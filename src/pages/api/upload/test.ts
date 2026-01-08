import type { APIRoute } from "astro";
import {
  isMinioConfigured,
  getMinioClient,
  MINIO_BUCKET,
  MINIO_PUBLIC_URL
} from "../../../lib/minio";

export const prerender = false;

export const GET: APIRoute = async () => {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    configured: false,
    connection: false,
    bucketExists: false,
    bucketName: MINIO_BUCKET,
    publicUrl: MINIO_PUBLIC_URL || "Not configured",
    error: null,
  };

  try {
    // Check if MinIO is configured
    results.configured = isMinioConfigured();

    if (!results.configured) {
      results.error = "MinIO is not configured. Missing environment variables.";
      return new Response(JSON.stringify(results, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Try to connect and check bucket
    const client = getMinioClient();

    // Test connection by listing buckets
    const buckets = await client.listBuckets();
    results.connection = true;
    results.availableBuckets = buckets.map(b => b.name);

    // Check if our bucket exists
    results.bucketExists = await client.bucketExists(MINIO_BUCKET);

    if (!results.bucketExists) {
      results.error = `Bucket "${MINIO_BUCKET}" does not exist. Create it in MinIO console.`;
    }

    // If bucket exists, try to get bucket policy
    if (results.bucketExists) {
      try {
        const policy = await client.getBucketPolicy(MINIO_BUCKET);
        results.bucketPolicy = JSON.parse(policy);
      } catch (policyError) {
        results.bucketPolicy = "No policy set or unable to retrieve";
      }
    }

    return new Response(JSON.stringify(results, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    results.error = error instanceof Error ? error.message : String(error);

    return new Response(JSON.stringify(results, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};
