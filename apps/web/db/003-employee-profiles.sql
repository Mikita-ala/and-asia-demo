ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS about text;

CREATE INDEX IF NOT EXISTS employees_status_idx ON employees (status);
