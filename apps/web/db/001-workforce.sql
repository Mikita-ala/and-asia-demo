CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE employee_status AS ENUM ('pending', 'active', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE assignment_scope AS ENUM ('organization', 'region', 'branch');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE employee_role AS ENUM (
    'territorial_manager', 'senior_consultant', 'consultant', 'merchandiser',
    'commercial_director', 'category_manager', 'logistics', 'administrator'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  UNIQUE (organization_id, code)
);

CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  region_id uuid NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  name text NOT NULL,
  code text NOT NULL,
  UNIQUE (organization_id, code)
);

-- Better Auth's `user` table remains the identity source. This table is the employee profile.
CREATE TABLE IF NOT EXISTS employees (
  user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  employee_number text UNIQUE,
  status employee_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- A person can have several roles and several independent scopes at the same time.
CREATE TABLE IF NOT EXISTS employee_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL REFERENCES employees(user_id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  scope assignment_scope NOT NULL,
  region_id uuid REFERENCES regions(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE CASCADE,
  role employee_role NOT NULL,
  orders_enabled boolean NOT NULL DEFAULT false,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (scope = 'organization' AND region_id IS NULL AND branch_id IS NULL)
    OR (scope = 'region' AND region_id IS NOT NULL AND branch_id IS NULL)
    OR (scope = 'branch' AND branch_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS employee_assignments_employee_idx ON employee_assignments (employee_id);
CREATE INDEX IF NOT EXISTS employee_assignments_scope_idx ON employee_assignments (organization_id, region_id, branch_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id text REFERENCES employees(user_id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
