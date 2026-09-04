import "server-only";

import { OpenFgaClient } from "@openfga/sdk";

const apiUrl = process.env.OPENFGA_API_URL;
const storeId = process.env.OPENFGA_STORE_ID;
const authorizationModelId = process.env.OPENFGA_AUTHORIZATION_MODEL_ID;

export const isOpenFgaConfigured = Boolean(apiUrl && storeId && authorizationModelId);

function client() {
  if (!isOpenFgaConfigured) {
    throw new Error(
      "OpenFGA is not configured. Set OPENFGA_API_URL, OPENFGA_STORE_ID and OPENFGA_AUTHORIZATION_MODEL_ID.",
    );
  }

  return new OpenFgaClient({
    apiUrl: apiUrl!,
    storeId: storeId!,
    authorizationModelId: authorizationModelId!,
  });
}

export type AuthorizationTuple = {
  user: string;
  relation: string;
  object: string;
};

/** Writes are only used from server actions after their own permission check. */
export async function writeAuthorizationTuples(input: {
  writes?: AuthorizationTuple[];
  deletes?: AuthorizationTuple[];
}) {
  if (!isOpenFgaConfigured) {
    throw new Error("OpenFGA is not configured.");
  }

  await client().write({
    writes: input.writes,
    deletes: input.deletes,
  });
}

/** Server-side authorization only. A missing OpenFGA configuration fails closed. */
export async function hasPermission(input: {
  userId: string;
  relation: string;
  object: string;
}) {
  if (!isOpenFgaConfigured) return false;

  const result = await client().check({
    user: `user:${input.userId}`,
    relation: input.relation,
    object: input.object,
  });

  return result.allowed;
}

/** Documentation permissions always resolve on the server and fail closed. */
export async function canViewDocument(userId: string, resourceId: string) {
  return hasPermission({
    userId,
    relation: "viewer",
    object: `document:${resourceId}`,
  });
}
