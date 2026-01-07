import * as Minio from "minio";

// MinIO client configuration
// Uses environment variables for connection details
const minioEndpoint = import.meta.env.MINIO_ENDPOINT || process.env.MINIO_ENDPOINT;
const minioPort = parseInt(import.meta.env.MINIO_PORT || process.env.MINIO_PORT || "443", 10);
const minioUseSSL = (import.meta.env.MINIO_USE_SSL || process.env.MINIO_USE_SSL) !== "false";
const minioAccessKey = import.meta.env.MINIO_ACCESS_KEY || process.env.MINIO_ACCESS_KEY;
const minioSecretKey = import.meta.env.MINIO_SECRET_KEY || process.env.MINIO_SECRET_KEY;

export const MINIO_BUCKET = import.meta.env.MINIO_BUCKET || process.env.MINIO_BUCKET || "blog-images";
export const MINIO_PUBLIC_URL = import.meta.env.MINIO_PUBLIC_URL || process.env.MINIO_PUBLIC_URL;

// Check if MinIO is configured
export function isMinioConfigured(): boolean {
  return Boolean(minioEndpoint && minioAccessKey && minioSecretKey);
}

// Create MinIO client
let minioClient: Minio.Client | null = null;

export function getMinioClient(): Minio.Client {
  if (!minioClient) {
    if (!isMinioConfigured()) {
      throw new Error("MinIO is not configured. Please set MINIO_ENDPOINT, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY environment variables.");
    }

    minioClient = new Minio.Client({
      endPoint: minioEndpoint!,
      port: minioPort,
      useSSL: minioUseSSL,
      accessKey: minioAccessKey!,
      secretKey: minioSecretKey!,
    });
  }

  return minioClient;
}

// Generate presigned URL for uploading
export async function generatePresignedPutUrl(
  filename: string,
  contentType: string,
  expirySeconds: number = 300 // 5 minutes default
): Promise<{ presignedUrl: string; objectKey: string; publicUrl: string }> {
  const client = getMinioClient();

  // Generate unique object key with timestamp and random suffix
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const objectKey = `uploads/${timestamp}-${randomSuffix}-${sanitizedFilename}`;

  // Generate presigned PUT URL
  const presignedUrl = await client.presignedPutObject(
    MINIO_BUCKET,
    objectKey,
    expirySeconds
  );

  // Construct public URL
  const publicUrl = MINIO_PUBLIC_URL
    ? `${MINIO_PUBLIC_URL}/${objectKey}`
    : `${minioUseSSL ? "https" : "http"}://${minioEndpoint}${minioPort !== 443 && minioPort !== 80 ? `:${minioPort}` : ""}/${MINIO_BUCKET}/${objectKey}`;

  return {
    presignedUrl,
    objectKey,
    publicUrl,
  };
}

// Generate presigned URL for downloading/viewing
export async function generatePresignedGetUrl(
  objectKey: string,
  expirySeconds: number = 3600 // 1 hour default
): Promise<string> {
  const client = getMinioClient();
  return client.presignedGetObject(MINIO_BUCKET, objectKey, expirySeconds);
}

// Delete an object from MinIO
export async function deleteObject(objectKey: string): Promise<void> {
  const client = getMinioClient();
  await client.removeObject(MINIO_BUCKET, objectKey);
}

// Check if bucket exists and create if not
export async function ensureBucketExists(): Promise<void> {
  const client = getMinioClient();
  const exists = await client.bucketExists(MINIO_BUCKET);

  if (!exists) {
    await client.makeBucket(MINIO_BUCKET);
    console.log(`Created bucket: ${MINIO_BUCKET}`);
  }
}

// Get object info
export async function getObjectInfo(objectKey: string): Promise<Minio.BucketItemStat> {
  const client = getMinioClient();
  return client.statObject(MINIO_BUCKET, objectKey);
}

// Allowed MIME types for image uploads
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;

export type AllowedImageType = typeof ALLOWED_IMAGE_TYPES[number];

// Validate MIME type
export function isAllowedImageType(mimeType: string): mimeType is AllowedImageType {
  return ALLOWED_IMAGE_TYPES.includes(mimeType as AllowedImageType);
}

// Max file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Validate file size
export function isValidFileSize(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= MAX_FILE_SIZE;
}
