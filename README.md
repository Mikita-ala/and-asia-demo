# AND Asia

Веб‑приложение для полевых и офисных операций. Нативный `apps/mobile` остаётся подготовленным фундаментом следующего этапа.

## Local setup

```bash
docker compose up -d
cd apps/web
DATABASE_URL=postgres://andasia:andasia_local_password@localhost:55432/andasia \
REDIS_URL=redis://localhost:6379 \
BETTER_AUTH_SECRET=local-development-secret-change-before-production \
npx @better-auth/cli@latest migrate --yes --config src/lib/auth.ts
DATABASE_URL=postgres://andasia:andasia_local_password@localhost:55432/andasia node scripts/run-app-migrations.mjs
pnpm openfga:bootstrap
pnpm dev
```

Copy the two values printed by `openfga:bootstrap` into `apps/web/.env.local` together with `DATABASE_URL`, `REDIS_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`. `.env.example` contains the complete local template.

After creating the first account, make it the initial workspace administrator once. This command creates the organization if necessary, activates that employee, and writes the administrator relation to OpenFGA:

```bash
cd apps/web
INITIAL_ADMIN_EMAIL=owner@company.kz \
INITIAL_ORGANIZATION_NAME="AND Asia" \
pnpm access:grant-initial-admin
```

Every subsequent account starts with a personal profile and waits until an administrator adds a role in **Команда**. Permissions are written to OpenFGA only by server-side actions; the employee assignment and audit record remain in PostgreSQL.

PostgreSQL is exposed on `55432`, Redis on `6379`, OpenFGA API on `8080`, and the OpenFGA playground on `13000`. Both PostgreSQL and Redis use named Docker volumes and restart automatically. Authentication sessions are stored in PostgreSQL; Redis is deliberately not the session authority. Redis has AOF + RDB snapshots and `noeviction`, so a full cache cannot silently evict keys.

## Access model

`apps/web/openfga/model.fga` is the source of truth for authorization. It supports organization office roles and branch/region roles. A branch receives a region relation, so a territorial manager assigned to one or more regions inherits access to every branch in those regions. Direct branch assignments support employees working in multiple stores. `employee_assignments` mirrors the administrative assignment and audit data in PostgreSQL; access checks must call OpenFGA server-side.
