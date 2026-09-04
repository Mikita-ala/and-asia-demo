CREATE UNIQUE INDEX IF NOT EXISTS employee_active_branch_assignment_idx
  ON employee_assignments (employee_id, branch_id, role)
  WHERE scope = 'branch' AND ends_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS employee_active_region_assignment_idx
  ON employee_assignments (employee_id, region_id, role)
  WHERE scope = 'region' AND ends_at IS NULL;
