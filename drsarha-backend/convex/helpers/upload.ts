"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
// @ts-expect-error — нет типов в пакете, API простой
import convert from "heic-convert";

const HEIC_CONTENT_TYPES = ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"];

function isHeicContentType(contentType: string): boolean {
  const lower = (contentType || "").toLowerCase();
  return HEIC_CONTENT_TYPES.some((t) => lower.includes(t) || lower.includes("heic"));
}

/** Конвертирует HEIC в JPEG средствами Convex action (библиотека heic-convert, чистый JS). */
export const convertHeicToJpeg = internalAction({
  args: {
    file: v.object({ base64: v.string(), contentType: v.string() }),
  },
  handler: async (_ctx, { file }) => {
    const inputBuffer = Buffer.from(file.base64, "base64");
    const outputBuffer = await convert({
      buffer: inputBuffer,
      format: "JPEG",
      quality: 0.92,
    });
    const base64 =
      typeof outputBuffer === "object" && Buffer.isBuffer(outputBuffer)
        ? outputBuffer.toString("base64")
        : Buffer.from(outputBuffer as ArrayBuffer).toString("base64");
    return { base64, contentType: "image/jpeg" };
  },
});

const EXT_BY_FILE_TYPE: Record<string, string> = {
  images: ".jpg",
  pdf: ".pdf",
  video: ".mp4",
};

export const uploadToS3 = internalAction({
  args: {
    file: v.object({ base64: v.string(), contentType: v.string() }),
    fileType: v.union(v.literal("images"), v.literal("pdf"), v.literal("video")),
  },
  handler: async (ctx, { file, fileType }) => {
    const startedAt = Date.now();
    console.log("[uploadToS3] start", {
      fileType,
      contentType: file.contentType,
      base64Size: file.base64.length,
    });
    const bucket = process.env.S3_BUCKET_NAME;
    if (!bucket) throw new Error("S3_BUCKET_NAME required in Convex env");

    let fileToUpload = file;
    if (fileType === "images" && isHeicContentType(file.contentType)) {
      console.log("[uploadToS3] converting HEIC to JPEG");
      fileToUpload = await ctx.runAction(internal.helpers.upload.convertHeicToJpeg, { file });
    }

    const ext = EXT_BY_FILE_TYPE[fileType] ?? ".bin";
    const filename = `${crypto.randomUUID()}${ext}`;
    const prefix = process.env.S3_IMAGE_DIRECTORY?.replace(/\/$/, "") ?? "";
    const key = prefix ? `${prefix}/${fileType}/${filename}` : `${fileType}/${filename}`;
    const relativePath = `${fileType}/${filename}`;

    try {
      console.log("[uploadToS3] uploading", { key, bucket });
      await ctx.runAction(internal.helpers.s3.putObjectBase64, {
        bucket,
        key,
        bodyBase64: fileToUpload.base64,
        contentType: fileToUpload.contentType,
      });
      console.log("[uploadToS3] uploaded", {
        key,
        ms: Date.now() - startedAt,
      });
    } catch (error) {
      console.error("[uploadToS3] upload failed", {
        key,
        ms: Date.now() - startedAt,
        error,
      });
      throw error;
    }

    return relativePath;
  },
});

export const getUploadUrl = internalAction({
  args: {
    fileType: v.union(v.literal("images"), v.literal("pdf"), v.literal("video")),
    contentType: v.string(),
  },
  handler: async (ctx, { fileType, contentType }) => {
    const bucket = process.env.S3_BUCKET_NAME;
    if (!bucket) throw new Error("S3_BUCKET_NAME required in Convex env");

    const ext = EXT_BY_FILE_TYPE[fileType] ?? ".bin";
    const filename = `${crypto.randomUUID()}${ext}`;
    const prefix = process.env.S3_IMAGE_DIRECTORY?.replace(/\/$/, "") ?? "";
    const key = prefix ? `${prefix}/${fileType}/${filename}` : `${fileType}/${filename}`;
    const relativePath = `${fileType}/${filename}`;

    const { url } = await ctx.runAction(internal.helpers.s3.getPresignedPutUrl, {
      bucket,
      key,
      contentType,
      expiresIn: 300,
    });

    return { uploadUrl: url, relativePath };
  },
});


