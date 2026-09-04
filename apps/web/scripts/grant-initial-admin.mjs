import pg from "pg";
import { OpenFgaClient } from "@openfga/sdk";

const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
const organizationName = process.env.INITIAL_ORGANIZATION_NAME?.trim() || "AND Asia";
const apiUrl = process.env.OPENFGA_API_URL;
const storeId = process.env.OPENFGA_STORE_ID;
const authorizationModelId = process.env.OPENFGA_AUTHORIZATION_MODEL_ID;

if (!email || !process.env.DATABASE_URL || !apiUrl || !storeId || !authorizationModelId) {
  throw new Error("Set DATABASE_URL, OPENFGA_API_URL, OPENFGA_STORE_ID, OPENFGA_AUTHORIZATION_MODEL_ID and INITIAL_ADMIN_EMAIL.");
}

const database = new pg.Client({ connectionString: process.env.DATABASE_URL });
await database.connect();
try {
  const user = await database.query('SELECT id FROM "user" WHERE lower(email) = $1', [email]);
  if (!user.rows[0]) throw new Error("Create the initial administrator account first, then run this command again.");

  let organization = await database.query("SELECT id FROM organizations WHERE name = $1 ORDER BY created_at LIMIT 1", [organizationName]);
  if (!organization.rows[0]) {
    organization = await database.query("INSERT INTO organizations (name) VALUES ($1) RETURNING id", [organizationName]);
  }

  const organizationId = organization.rows[0].id;
  const userId = user.rows[0].id;
  const fga = new OpenFgaClient({ apiUrl, storeId, authorizationModelId });
  await fga.write({ writes: [
    { user: `user:${userId}`, relation: "employee", object: `organization:${organizationId}` },
    { user: `user:${userId}`, relation: "administrator", object: `organization:${organizationId}` },
  ] });

  await database.query("UPDATE employees SET status = 'active', updated_at = now() WHERE user_id = $1", [userId]);
  const assigned = await database.query(
    `SELECT 1 FROM employee_assignments WHERE employee_id = $1 AND organization_id = $2
       AND scope = 'organization' AND role = 'administrator' AND ends_at IS NULL`,
    [userId, organizationId],
  );
  if (!assigned.rows[0]) {
    await database.query(
      "INSERT INTO employee_assignments (employee_id, organization_id, scope, role) VALUES ($1, $2, 'organization', 'administrator')",
      [userId, organizationId],
    );
  }
  console.log(`Initial administrator is ready for ${organizationName}.`);
} finally {
  await database.end();
}
