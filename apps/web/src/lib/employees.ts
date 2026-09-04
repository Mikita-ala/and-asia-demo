import "server-only";

import { cache } from "react";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

export const employeeRoles = [
  "administrator",
  "commercial_director",
  "category_manager",
  "logistics",
  "territorial_manager",
  "senior_consultant",
  "consultant",
  "merchandiser",
] as const;

export type EmployeeRole = (typeof employeeRoles)[number];
export type EmployeeStatus = "pending" | "active" | "suspended";

export const employeeRoleLabels: Record<EmployeeRole, string> = {
  administrator: "Администратор",
  commercial_director: "Коммерческий директор",
  category_manager: "Категорийный менеджер",
  logistics: "Логистика",
  territorial_manager: "Территориальный менеджер",
  senior_consultant: "Старший консультант",
  consultant: "Консультант",
  merchandiser: "Мерчандайзер",
};

export const employeeStatusLabels: Record<EmployeeStatus, string> = {
  pending: "Ожидает начала работы",
  active: "Активен",
  suspended: "Приостановлен",
};

export type EmployeeProfile = {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  employeeNumber: string | null;
  status: EmployeeStatus;
  jobTitle: string | null;
  phone: string | null;
  about: string | null;
};

export type EmployeeStore = {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  organizationId: string;
  organizationName: string;
  role: EmployeeRole;
};

export type EmployeeWithStores = EmployeeProfile & {
  stores: EmployeeStore[];
};

export type Region = { id: string; name: string; organizationId: string };
export type Store = { id: string; name: string; regionId: string; organizationId: string };

export const getCurrentEmployee = cache(async (): Promise<EmployeeProfile> => {
  const session = await requireSession();
  const result = await db.query<EmployeeProfile>(
    `SELECT u.id AS "userId", u.name, u.email, u.image,
            e.employee_number AS "employeeNumber", e.status,
            e.job_title AS "jobTitle", e.phone, e.about
       FROM "user" u
       JOIN employees e ON e.user_id = u.id
      WHERE u.id = $1`,
    [session.user.id],
  );

  if (!result.rows[0]) {
    throw new Error("Employee profile was not created for the signed-in user.");
  }
  return result.rows[0];
});

export async function getEmployeesForOrganizations(organizationIds: string[]): Promise<EmployeeWithStores[]> {
  if (organizationIds.length === 0) return [];
  const result = await db.query<EmployeeProfile>(
    `SELECT u.id AS "userId", u.name, u.email, u.image,
            e.employee_number AS "employeeNumber", e.status,
            e.job_title AS "jobTitle", e.phone, e.about
       FROM employees e
       JOIN "user" u ON u.id = e.user_id
      WHERE EXISTS (
        SELECT 1 FROM employee_assignments ea
        WHERE ea.employee_id = e.user_id AND ea.organization_id = ANY($1::uuid[]) AND ea.ends_at IS NULL
      )
      ORDER BY u.name ASC`,
    [organizationIds],
  );
  return attachStores(result.rows);
}

export async function getAllEmployees(): Promise<EmployeeWithStores[]> {
  const result = await db.query<EmployeeProfile>(
    `SELECT u.id AS "userId", u.name, u.email, u.image,
            e.employee_number AS "employeeNumber", e.status,
            e.job_title AS "jobTitle", e.phone, e.about
       FROM employees e
       JOIN "user" u ON u.id = e.user_id
      ORDER BY u.name ASC`,
  );
  return attachStores(result.rows);
}

export async function getEmployeeById(employeeId: string): Promise<EmployeeWithStores | null> {
  const result = await db.query<EmployeeProfile>(
    `SELECT u.id AS "userId", u.name, u.email, u.image,
            e.employee_number AS "employeeNumber", e.status,
            e.job_title AS "jobTitle", e.phone, e.about
       FROM "user" u
       JOIN employees e ON e.user_id = u.id
      WHERE u.id = $1`,
    [employeeId],
  );
  if (!result.rows[0]) return null;
  return (await attachStores([result.rows[0]]))[0];
}

async function attachStores(employees: EmployeeProfile[]): Promise<EmployeeWithStores[]> {
  if (employees.length === 0) return [];
  const stores = await db.query<EmployeeStore & { employeeId: string }>(
    `SELECT ea.employee_id AS "employeeId", b.id, b.name, r.id AS "regionId", r.name AS "regionName",
            o.id AS "organizationId", o.name AS "organizationName", ea.role
       FROM employee_assignments ea
       JOIN branches b ON b.id = ea.branch_id
       JOIN regions r ON r.id = b.region_id
       JOIN organizations o ON o.id = b.organization_id
      WHERE ea.employee_id = ANY($1::text[]) AND ea.scope = 'branch' AND ea.ends_at IS NULL
      ORDER BY o.name, r.name, b.name`,
    [employees.map((employee) => employee.userId)],
  );
  const storesByEmployee = new Map<string, EmployeeStore[]>();
  for (const store of stores.rows) {
    const { employeeId, ...storeData } = store;
    storesByEmployee.set(employeeId, [...(storesByEmployee.get(employeeId) ?? []), storeData]);
  }
  return employees.map((employee) => ({ ...employee, stores: storesByEmployee.get(employee.userId) ?? [] }));
}

export async function getOrganizations() {
  const result = await db.query<{ id: string; name: string }>(
    "SELECT id, name FROM organizations ORDER BY name ASC",
  );
  return result.rows;
}

export async function getRegions(organizationIds?: string[]): Promise<Region[]> {
  const result = await db.query<Region>(
    `SELECT id, name, organization_id AS "organizationId"
       FROM regions
      WHERE ($1::uuid[] IS NULL OR organization_id = ANY($1::uuid[]))
      ORDER BY name`,
    [organizationIds?.length ? organizationIds : null],
  );
  return result.rows;
}

export async function getStores(regionIds?: string[]): Promise<Store[]> {
  const result = await db.query<Store>(
    `SELECT id, name, region_id AS "regionId", organization_id AS "organizationId"
       FROM branches
      WHERE ($1::uuid[] IS NULL OR region_id = ANY($1::uuid[]))
      ORDER BY name`,
    [regionIds?.length ? regionIds : null],
  );
  return result.rows;
}
