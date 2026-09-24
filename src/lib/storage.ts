import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const RESUME_BUCKET = "resumes";
const LOGO_BUCKET = "logos";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);

export function isAllowedResumeType(type: string) {
  return ALLOWED_TYPES.has(type);
}

export function isAllowedLogoType(type: string) {
  return ALLOWED_LOGO_TYPES.has(type);
}

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i);
}

// resumes bucket is private: uploaded/read with the service-role client, and
// access is gated in the API route (owner or admin) before a read happens.
export async function saveResumeFile(file: File): Promise<string> {
  const fileName = `${randomUUID()}${extOf(file.name) || ".pdf"}`;
  const { error } = await createAdminClient()
    .storage.from(RESUME_BUCKET)
    .upload(fileName, file, { contentType: file.type });
  if (error) throw error;
  return fileName;
}

export async function readResumeFile(fileName: string): Promise<Buffer> {
  const { data, error } = await createAdminClient().storage.from(RESUME_BUCKET).download(fileName);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}

// logos bucket is public: the returned value is the full public URL, stored
// directly as Job.logoUrl and rendered with a plain <img>, no proxy route.
export async function saveLogoFile(file: File): Promise<string> {
  const fileName = `${randomUUID()}${extOf(file.name) || ".png"}`;
  const client = createAdminClient();
  const { error } = await client.storage.from(LOGO_BUCKET).upload(fileName, file, { contentType: file.type });
  if (error) throw error;
  return client.storage.from(LOGO_BUCKET).getPublicUrl(fileName).data.publicUrl;
}
