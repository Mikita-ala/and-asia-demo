import "server-only";

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION;
const bucket = process.env.S3_BUCKET;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");

function getConfig() {
  if (!endpoint || !region || !bucket || !accessKeyId || !secretAccessKey || !publicBaseUrl) {
    throw new Error("Фото пока недоступно. Обратитесь к команде.");
  }

  return { endpoint, region, bucket, accessKeyId, secretAccessKey, publicBaseUrl };
}

function getClient() {
  const config = getConfig();
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    forcePathStyle: true,
  });
}

export async function uploadEmployeePhoto(input: { employeeId: string; file: File }) {
  const config = getConfig();
  const extension = input.file.type === "image/png" ? "png" : input.file.type === "image/webp" ? "webp" : "jpg";
  const key = `employees/${input.employeeId}/${crypto.randomUUID()}.${extension}`;
  await getClient().send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: Buffer.from(await input.file.arrayBuffer()),
    ContentType: input.file.type,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return { key, url: `${config.publicBaseUrl}/${key}` };
}

export async function deleteEmployeePhoto(url: string | null) {
  const config = getConfig();
  if (!url?.startsWith(`${config.publicBaseUrl}/`)) return;
  const key = url.slice(config.publicBaseUrl.length + 1);
  await getClient().send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
}
