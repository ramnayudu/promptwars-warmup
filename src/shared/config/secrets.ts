import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Instantiate the client. Authentication goes through Google Application Default Credentials.
const client = new SecretManagerServiceClient();

/**
 * Utility to fetch secrets consistently from Google Cloud Secret Manager.
 * Falls back to local environment variables if in lower environments.
 * 
 * @param secretName Name of the secret configured in GCP.
 * @param version Defaults to "latest".
 * @returns The decoded secret string.
 */
export async function getSecret(secretName: string, version: string = 'latest'): Promise<string> {
  // Local development override for speed
  if (process.env.NODE_ENV !== 'production' && process.env[secretName]) {
    return process.env[secretName] as string;
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    throw new Error("GOOGLE_CLOUD_PROJECT is not set.");
  }

  const name = `projects/${projectId}/secrets/${secretName}/versions/${version}`;
  
  try {
    const [accessResponse] = await client.accessSecretVersion({ name });
    const responsePayload = accessResponse.payload?.data?.toString();
    
    if (!responsePayload) {
      throw new Error(`Empty payload returned for secret ${secretName}`);
    }
    return responsePayload;
  } catch (error) {
    console.error(`[SecretManager] Error fetching secret ${secretName}:`, error);
    throw error;
  }
}
