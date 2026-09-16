import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

// ponytail: local disk storage, fine for single-instance/local dev. Swap for
// S3/R2 + presigned uploads before deploying to a serverless/multi-instance host.
const RESUME_DIR = path.join(process.cwd(), "uploads", "resumes");

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function isAllowedResumeType(type: string) {
  return ALLOWED_TYPES.has(type);
}

export async function saveResumeFile(file: File): Promise<string> {
  await mkdir(RESUME_DIR, { recursive: true });
  const ext = path.extname(file.name) || ".pdf";
  const fileName = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(RESUME_DIR, fileName), buffer);
  return fileName;
}

export async function readResumeFile(fileName: string): Promise<Buffer> {
  const safeName = path.basename(fileName);
  return readFile(path.join(RESUME_DIR, safeName));
}
