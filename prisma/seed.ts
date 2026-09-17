import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const userPassword = await bcrypt.hash("user1234", 10);
  await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      name: "Jane Doe",
      email: "jane@example.com",
      passwordHash: userPassword,
      role: "USER",
    },
  });

  const jobs = [
    {
      title: "Senior Frontend Engineer",
      company: "Northwind Labs",
      description:
        "Build and maintain our React/Next.js customer dashboard. Work closely with design and backend teams in a fully async, remote-first environment.",
      location: "Worldwide",
      remoteType: "REMOTE" as const,
      employmentType: "FULL_TIME" as const,
      salaryMin: 90000,
      salaryMax: 130000,
      tags: "react,typescript,frontend",
      applyUrl: "https://example.com/careers/frontend",
    },
    {
      title: "DevOps Engineer",
      company: "Cloudbeam",
      description:
        "Own our Kubernetes infrastructure and CI/CD pipelines. Experience with AWS and Terraform required.",
      location: "US/Canada",
      remoteType: "REMOTE" as const,
      employmentType: "FULL_TIME" as const,
      salaryMin: 100000,
      salaryMax: 150000,
      tags: "devops,aws,kubernetes",
      applyEmail: "jobs@cloudbeam.example.com",
    },
    {
      title: "Part-time Technical Writer",
      company: "DocForge",
      description:
        "Write and maintain developer documentation for an open-source SDK. ~20 hrs/week, flexible schedule.",
      location: "Europe",
      remoteType: "REMOTE" as const,
      employmentType: "PART_TIME" as const,
      tags: "writing,docs",
      applyUrl: "https://example.com/careers/writer",
    },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { id: job.title.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: { ...job, id: job.title.toLowerCase().replace(/\s+/g, "-"), postedById: admin.id },
    });
  }

  console.log("Seeded admin login: admin@example.com / admin1234");
  console.log("Seeded user login: jane@example.com / user1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
