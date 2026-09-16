import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readResumeFile } from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function GET(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const application = await prisma.application.findFirst({ where: { resumeFileName: filename } });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = application.applicantId === session.user.id;
  if (!isOwner && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const buffer = await readResumeFile(filename);
  const ext = filename.slice(filename.lastIndexOf("."));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
