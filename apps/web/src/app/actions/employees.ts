"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { canManageEmployee, getEmployeeAccessScope } from "@/lib/employee-access";
import { employeeRoles, getEmployeeById, getRegions, getStores, type EmployeeRole } from "@/lib/employees";
import { hasPermission, writeAuthorizationTuples } from "@/lib/openfga";
import { requireSession } from "@/lib/session";
import { deleteEmployeePhoto, uploadEmployeePhoto } from "@/lib/storage";

const profileSchema = z.object({
  jobTitle: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  about: z.string().trim().max(500).optional().or(z.literal("")),
});

const accessSchema = z.object({
  employeeId: z.string().min(1),
  organizationId: z.string().uuid(),
  role: z.enum(employeeRoles),
});

const managedProfileSchema = z.object({
  employeeId: z.string().min(1),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  status: z.enum(["pending", "active", "suspended"]),
});

const storeAssignmentSchema = z.object({
  employeeId: z.string().min(1),
  storeId: z.string().uuid(),
  role: z.enum(["territorial_manager", "senior_consultant", "consultant", "merchandiser"]),
});

const regionalManagerSchema = z.object({
  employeeId: z.string().min(1),
  regionId: z.string().uuid(),
});

const organizationRoles = new Set<EmployeeRole>([
  "administrator",
  "commercial_director",
  "category_manager",
  "logistics",
]);

function organizationTuple(employeeId: string, organizationId: string, role: EmployeeRole) {
  return { user: `user:${employeeId}`, relation: role, object: `organization:${organizationId}` };
}

export async function updateMyProfile(formData: FormData) {
  const session = await requireSession();
  const parsed = profileSchema.safeParse({
    jobTitle: formData.get("jobTitle"),
    phone: formData.get("phone"),
    about: formData.get("about"),
  });
  if (!parsed.success) return;

  await db.query(
    `UPDATE employees
        SET job_title = NULLIF($1, ''), phone = NULLIF($2, ''), about = NULLIF($3, ''), updated_at = now()
      WHERE user_id = $4`,
    [parsed.data.jobTitle, parsed.data.phone, parsed.data.about, session.user.id],
  );
  revalidatePath("/ru/profile");
  revalidatePath("/ru/dashboard");
}

export async function saveRegistrationJobTitle(jobTitle: string) {
  const session = await requireSession();
  const title = z.string().trim().min(2).max(100).safeParse(jobTitle);
  if (!title.success) return { error: "Укажите должность." };
  await db.query(`UPDATE employees SET job_title = $1, updated_at = now() WHERE user_id = $2`, [title.data, session.user.id]);
  return { success: true };
}

async function getManagementTarget(employeeId: string) {
  const session = await requireSession();
  const [scope, employee] = await Promise.all([getEmployeeAccessScope(session.user.id), getEmployeeById(employeeId)]);
  if (!employee || !canManageEmployee(scope, employee)) return null;
  return { session, scope, employee };
}

export async function updateEmployeeProfile(_previousState: { error?: string; success?: boolean } | null, formData: FormData) {
  const parsed = managedProfileSchema.safeParse({
    employeeId: formData.get("employeeId"),
    phone: formData.get("phone"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Проверьте данные сотрудника." };
  const target = await getManagementTarget(parsed.data.employeeId);
  if (!target) return { error: "Не удалось изменить данные сотрудника." };
  await db.query(
    `UPDATE employees SET phone = NULLIF($1, ''), status = $2, updated_at = now() WHERE user_id = $3`,
    [parsed.data.phone, parsed.data.status, parsed.data.employeeId],
  );
  revalidatePath("/ru/team");
  revalidatePath(`/ru/team/${parsed.data.employeeId}`);
  return { success: true };
}

export async function assignEmployeeToStore(_previousState: { error?: string; success?: boolean } | null, formData: FormData) {
  const parsed = storeAssignmentSchema.safeParse({ employeeId: formData.get("employeeId"), storeId: formData.get("storeId"), role: formData.get("role") });
  if (!parsed.success) return { error: "Выберите магазин и рабочую роль." };
  const target = await getManagementTarget(parsed.data.employeeId);
  if (!target) return { error: "Не удалось изменить закрепление сотрудника." };
  const stores = await getStores();
  const store = stores.find((item) => item.id === parsed.data.storeId);
  if (!store || (!target.scope.administratorOrganizationIds.includes(store.organizationId) && !target.scope.managedRegionIds.includes(store.regionId))) {
    return { error: "Этот магазин недоступен для управления." };
  }
  await db.query(
    `INSERT INTO employee_assignments (employee_id, organization_id, scope, branch_id, role)
     VALUES ($1, $2, 'branch', $3, $4)
     ON CONFLICT DO NOTHING`,
    [parsed.data.employeeId, store.organizationId, store.id, parsed.data.role],
  );
  await writeAuthorizationTuples({ writes: [
    { user: `user:${parsed.data.employeeId}`, relation: parsed.data.role, object: `branch:${store.id}` },
    { user: `user:${parsed.data.employeeId}`, relation: "employee", object: `organization:${store.organizationId}` },
  ] });
  revalidatePath("/ru/team");
  revalidatePath(`/ru/team/${parsed.data.employeeId}`);
  return { success: true };
}

export async function removeEmployeeFromStore(_previousState: { error?: string; success?: boolean } | null, formData: FormData) {
  const employeeId = String(formData.get("employeeId") ?? "");
  const storeId = String(formData.get("storeId") ?? "");
  const target = await getManagementTarget(employeeId);
  if (!target) return { error: "Не удалось изменить закрепление сотрудника." };
  const existing = target.employee.stores.find((store) => store.id === storeId);
  if (!existing || (!target.scope.administratorOrganizationIds.includes(existing.organizationId) && !target.scope.managedRegionIds.includes(existing.regionId))) return { error: "Этот магазин недоступен для управления." };
  await db.query(
    `UPDATE employee_assignments SET ends_at = now() WHERE employee_id = $1 AND branch_id = $2 AND scope = 'branch' AND ends_at IS NULL`,
    [employeeId, storeId],
  );
  await writeAuthorizationTuples({ deletes: [{ user: `user:${employeeId}`, relation: existing.role, object: `branch:${storeId}` }] });
  revalidatePath("/ru/team");
  revalidatePath(`/ru/team/${employeeId}`);
  return { success: true };
}

export async function assignRegionalManager(_previousState: { error?: string; success?: boolean } | null, formData: FormData) {
  const parsed = regionalManagerSchema.safeParse({ employeeId: formData.get("employeeId"), regionId: formData.get("regionId") });
  if (!parsed.success) return { error: "Выберите сотрудника и регион." };
  const session = await requireSession();
  const regions = await getRegions();
  const region = regions.find((item) => item.id === parsed.data.regionId);
  if (!region || !(await hasPermission({ userId: session.user.id, relation: "can_manage_users", object: `organization:${region.organizationId}` }))) {
    return { error: "Назначить менеджера может администратор." };
  }
  await db.query(
    `INSERT INTO employee_assignments (employee_id, organization_id, scope, region_id, role)
     VALUES ($1, $2, 'region', $3, 'territorial_manager') ON CONFLICT DO NOTHING`,
    [parsed.data.employeeId, region.organizationId, region.id],
  );
  await writeAuthorizationTuples({ writes: [
    { user: `user:${parsed.data.employeeId}`, relation: "territorial_manager", object: `region:${region.id}` },
    { user: `user:${parsed.data.employeeId}`, relation: "employee", object: `organization:${region.organizationId}` },
  ] });
  revalidatePath("/ru/team");
  revalidatePath(`/ru/team/${parsed.data.employeeId}`);
  return { success: true };
}

export async function uploadEmployeePhotoAction(_previousState: { error?: string; success?: boolean } | null, formData: FormData) {
  const employeeId = String(formData.get("employeeId") ?? "");
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0 || file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { error: "Выберите изображение JPG, PNG или WebP до 5 МБ." };
  }
  const session = await requireSession();
  const employee = await getEmployeeById(employeeId);
  if (!employee) return { error: "Сотрудник не найден." };
  if (employeeId !== session.user.id) {
    const scope = await getEmployeeAccessScope(session.user.id);
    if (!canManageEmployee(scope, employee)) return { error: "Не удалось изменить фотографию." };
  }
  try {
    const uploaded = await uploadEmployeePhoto({ employeeId, file });
    await db.query(`UPDATE "user" SET image = $1 WHERE id = $2`, [uploaded.url, employeeId]);
    await deleteEmployeePhoto(employee.image);
  } catch {
    return { error: "Не удалось загрузить фотографию. Попробуйте ещё раз." };
  }
  revalidatePath("/ru/profile");
  revalidatePath("/ru/team");
  revalidatePath(`/ru/team/${employeeId}`);
  return { success: true };
}

export async function grantOrganizationRole(
  _previousState: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const session = await requireSession();
  const parsed = accessSchema.safeParse({
    employeeId: formData.get("employeeId"),
    organizationId: formData.get("organizationId"),
    role: formData.get("role"),
  });
  if (!parsed.success || !organizationRoles.has(parsed.data.role)) {
    return { error: "Выберите роль для работы в компании." };
  }

  const allowed = await hasPermission({
    userId: session.user.id,
    relation: "can_manage_users",
    object: `organization:${parsed.data.organizationId}`,
  });
  if (!allowed) return { error: "Изменять состав команды может только администратор." };

  const connection = await db.connect();
  try {
    await connection.query("BEGIN");
    const existing = await connection.query(
      `SELECT 1 FROM employee_assignments
        WHERE employee_id = $1 AND organization_id = $2 AND scope = 'organization'
          AND role = $3 AND ends_at IS NULL`,
      [parsed.data.employeeId, parsed.data.organizationId, parsed.data.role],
    );
    if (existing.rowCount === 0) {
      await connection.query(
        `INSERT INTO employee_assignments (employee_id, organization_id, scope, role)
         VALUES ($1, $2, 'organization', $3)`,
        [parsed.data.employeeId, parsed.data.organizationId, parsed.data.role],
      );
    }
    await connection.query(
      `UPDATE employees SET status = 'active', updated_at = now() WHERE user_id = $1`,
      [parsed.data.employeeId],
    );
    await connection.query(
      `INSERT INTO audit_log (organization_id, actor_id, action, target_type, target_id, metadata)
       VALUES ($1, $2, 'employee.role_granted', 'employee', $3, jsonb_build_object('role', $4))`,
      [parsed.data.organizationId, session.user.id, parsed.data.employeeId, parsed.data.role],
    );
    await writeAuthorizationTuples({ writes: [
      { user: `user:${parsed.data.employeeId}`, relation: "employee", object: `organization:${parsed.data.organizationId}` },
      organizationTuple(parsed.data.employeeId, parsed.data.organizationId, parsed.data.role),
    ] });
    await connection.query("COMMIT");
  } catch {
    await connection.query("ROLLBACK");
    return { error: "Не удалось сохранить изменения. Попробуйте ещё раз." };
  } finally {
    connection.release();
  }
  revalidatePath("/ru/team");
  revalidatePath("/ru/dashboard");
  return { success: true };
}
