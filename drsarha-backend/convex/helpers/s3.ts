"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Скачивает объект из S3 по ключу и возвращает base64 + contentType.
 * Env: S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET_NAME, S3_ENDPOINT_URL (опционально).
 */
export const getObjectAsBase64 = internalAction({
  args: {
    bucket: v.string(),
    key: v.string(),
  },
  handler: async (_ctx, { bucket, key }) => {
    const accessKey = process.env.S3_ACCESS_KEY;
    const secretKey = process.env.S3_SECRET_KEY;
    if (!accessKey || !secretKey) {
      throw new Error("S3_ACCESS_KEY and S3_SECRET_KEY required in Convex env");
    }

    const client = new S3Client({
      region: process.env.S3_REGION ?? process.env.AWS_REGION ?? "us-east-1",
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      ...(process.env.S3_ENDPOINT_URL && {
        endpoint: process.env.S3_ENDPOINT_URL,
        forcePathStyle: true,
      }),
    });

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const data = await client.send(command);
    const body = data.Body;
    if (!body) throw new Error(`S3 GetObject empty body: ${bucket}/${key}`);

    const chunks: Uint8Array[] = [];
    for await (const chunk of body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const base64 = buffer.toString("base64");
    const contentType = data.ContentType ?? "application/octet-stream";

    return { base64, contentType };
  },
});

/**
 * Загружает объект в S3 из base64.
 * Env: S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET_NAME, S3_ENDPOINT_URL (опционально).
 */
export const putObjectBase64 = internalAction({
  args: {
    bucket: v.string(),
    key: v.string(),
    bodyBase64: v.string(),
    contentType: v.string(),
  },
  handler: async (_ctx, { bucket, key, bodyBase64, contentType }) => {
    const accessKey = process.env.S3_ACCESS_KEY;
    const secretKey = process.env.S3_SECRET_KEY;
    if (!accessKey || !secretKey) {
      throw new Error("S3_ACCESS_KEY and S3_SECRET_KEY required in Convex env");
    }

    const client = new S3Client({
      region: process.env.S3_REGION ?? process.env.AWS_REGION ?? "us-east-1",
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      ...(process.env.S3_ENDPOINT_URL && {
        endpoint: process.env.S3_ENDPOINT_URL,
        forcePathStyle: true,
      }),
    });

    const body = Buffer.from(bodyBase64, "base64");
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    return { key };
  },
});
