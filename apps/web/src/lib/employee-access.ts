import "server-only";

import { db } from "@/lib/db";
import { getOrganizations, getRegions, type EmployeeWithStores } from "@/lib/employees";
import { hasPermission } from "@/lib/openfga";

export type EmployeeAccessScope = {
  administratorOrganizationIds: string[];
  managedRegionIds: string[];
  storeIds: string[];
};

export async function getEmployeeAccessScope(userId: string): Promise<EmployeeAccessScope> {
  const [organizations, regions, assignments] = await Promise.all([
    getOrganizations(),
    getRegions(),
    db.query<{ branchId: string }>(
      `SELECT branch_id AS "branchId" FROM employee_assignments
        WHERE employee_id = $1 AND scope = 'branch' AND ends_at IS NULL`,
      [userId],
    ),
  ]);
  const [administratorOrganizationIds, managedRegionIds] = await Promise.all([
    Promise.all(organizations.map(async (organization) =>
      (await hasPermission({ userId, relation: "can_manage_users", object: `organization:${organization.id}` })) ? organization.id : null,
    )).then((ids) => ids.filter((id): id is string => Boolean(id))),
    Promise.all(regions.map(async (region) =>
      (await hasPermission({ userId, relation: "can_manage_region", object: `region:${region.id}` })) ? region.id : null,
    )).then((ids) => ids.filter((id): id is string => Boolean(id))),
  ]);

  const storeIds = (await Promise.all(assignments.rows.map(async ({ branchId }) =>
    (await hasPermission({ userId, relation: "employee", object: `branch:${branchId}` })) ? branchId : null,
  ))).filter((id): id is string => Boolean(id));

  return { administratorOrganizationIds, managedRegionIds, storeIds };
}

export function canViewEmployee(scope: EmployeeAccessScope, viewerId: string, employee: EmployeeWithStores) {
  if (viewerId === employee.userId) return true;
  return employee.stores.some((store) =>
    scope.administratorOrganizationIds.includes(store.organizationId)
    || scope.managedRegionIds.includes(store.regionId)
    || scope.storeIds.includes(store.id),
  );
}

export function canManageEmployee(scope: EmployeeAccessScope, employee: EmployeeWithStores) {
  if (scope.administratorOrganizationIds.length > 0) return true;
  return employee.stores.length > 0 && employee.stores.every((store) =>
    scope.administratorOrganizationIds.includes(store.organizationId) || scope.managedRegionIds.includes(store.regionId),
  );
}
