import { readFile } from "node:fs/promises";
import { OpenFgaClient } from "@openfga/sdk";
import { transformer } from "@openfga/syntax-transformer";

const apiUrl = process.env.OPENFGA_API_URL ?? "http://localhost:8080";
const storeName = process.env.OPENFGA_STORE_NAME ?? "and-asia-local";
const modelDsl = await readFile(new URL("../openfga/model.fga", import.meta.url), "utf8");
const model = transformer.transformDSLToJSONObject(modelDsl);

const bootstrapClient = new OpenFgaClient({ apiUrl });
const { stores = [] } = await bootstrapClient.listStores();
const store = stores.find((item) => item.name === storeName)
  ?? await bootstrapClient.createStore({ name: storeName });

const storeClient = new OpenFgaClient({ apiUrl, storeId: store.id });
const { authorization_model_id: modelId } = await storeClient.writeAuthorizationModel(model);

console.log(`OPENFGA_STORE_ID=${store.id}`);
console.log(`OPENFGA_AUTHORIZATION_MODEL_ID=${modelId}`);
