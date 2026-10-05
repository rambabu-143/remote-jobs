import type { Prisma } from "@prisma/client";

// SEO landing pages: each is the normal job list with a fixed filter and its own heading/intro.
// ponytail: keyword matching on title/tags, no dedicated column; add a "level" field if fresher matching gets noisy.
export type LandingT = { path: string; title: string; h1: string; description: string; intro: string; where: Prisma.JobWhereInput };

const kw = (words: string[]): Prisma.JobWhereInput => ({
  OR: words.flatMap((w) => [
    { title: { contains: w, mode: "insensitive" as const } },
    { tags: { contains: w, mode: "insensitive" as const } },
  ]),
});
const FRESHER: Prisma.JobWhereInput = {
  OR: [
    { employmentType: "INTERNSHIP" },
    ...(kw(["fresher", "graduate", "junior", "entry level", "entry-level", "trainee", "intern", "apprentice", "associate"]).OR as Prisma.JobWhereInput[]),
  ],
};
const category = (c: string): Prisma.JobWhereInput => ({ category: c });

export const LANDINGS: LandingT[] = [
  { path: "/remote-jobs", title: "Remote Jobs - Latest Remote Job Openings", h1: "Remote jobs", where: {},
    description: "Latest remote jobs from verified companies. Browse and apply to full time, part time and entry level remote job openings in India and worldwide.",
    intro: "Every role here is fully remote. Browse the latest remote job openings in India and worldwide, then apply straight to the company." },
  { path: "/work-from-home-jobs", title: "Work From Home Jobs - Latest Openings", h1: "Work from home jobs", where: {},
    description: "Work from home jobs from verified companies in India and worldwide. Genuine full time and part time openings, no fees to apply.",
    intro: "Genuine work from home jobs, all remote and listed by companies that give a real address, phone and email. You never pay a fee to apply." },
  { path: "/jobs/freshers", title: "Jobs for Freshers - Entry Level Remote Jobs", h1: "Remote jobs for freshers", where: FRESHER,
    description: "Entry level remote jobs for freshers and students. Graduate, junior, trainee and internship roles from verified companies.",
    intro: "Graduate, junior, trainee and internship roles that don't ask for years of experience, all remote." },
  { path: "/remote-jobs/freshers", title: "Remote Jobs for Freshers in India - Entry Level", h1: "Remote jobs for freshers", where: FRESHER,
    description: "Remote jobs for freshers in India and worldwide: graduate, junior and entry level roles, no experience needed to start.",
    intro: "Start your career from home. These remote roles are open to freshers, recent graduates and students." },
  { path: "/work-from-home-jobs/freshers", title: "Work From Home Jobs for Freshers - Entry Level", h1: "Work from home jobs for freshers", where: FRESHER,
    description: "Work from home jobs for freshers: entry level, graduate and internship roles from verified companies, apply free.",
    intro: "Work-from-home roles for freshers and recent graduates, from companies that list a real address, phone and email." },
  { path: "/jobs/software-development", title: "Remote Software Development Jobs", h1: "Remote software development jobs", where: category("Software Development"),
    description: "Remote software developer, engineer and programming jobs from verified companies in India and worldwide.", intro: "Remote roles for developers and engineers." },
  { path: "/jobs/customer-support", title: "Remote Customer Support Jobs", h1: "Remote customer support jobs", where: category("Customer Support"),
    description: "Remote customer support, success and service jobs from verified companies. Work from home, apply free.", intro: "Remote roles in customer support and customer success." },
  { path: "/jobs/sales", title: "Remote Sales Jobs", h1: "Remote sales jobs", where: category("Sales"),
    description: "Remote sales, SDR and account roles from verified companies in India and worldwide.", intro: "Remote roles in sales and business development." },
  { path: "/jobs/digital-marketing", title: "Remote Digital Marketing Jobs", h1: "Remote digital marketing jobs", where: { OR: [category("Marketing"), kw(["marketing", "seo", "content"])] },
    description: "Remote digital marketing, SEO and content jobs from verified companies.", intro: "Remote roles in marketing, SEO and content." },
  { path: "/jobs/data-science", title: "Remote Data Science Jobs", h1: "Remote data science jobs", where: kw(["data scien", "data analy", "data engineer", "analytics"]),
    description: "Remote data science, analytics and data engineering jobs from verified companies.", intro: "Remote roles in data science and analytics." },
  { path: "/jobs/artificial-intelligence", title: "Remote AI & Machine Learning Jobs", h1: "Remote AI and machine learning jobs", where: kw(["artificial intelligence", "machine learning", "llm", "ml engineer", "ai engineer"]),
    description: "Remote artificial intelligence and machine learning jobs from verified companies.", intro: "Remote roles in AI and machine learning." },
  { path: "/jobs/human-resources", title: "Remote HR & Recruiting Jobs", h1: "Remote human resources jobs", where: kw(["human resources", "hr ", "recruit", "talent"]),
    description: "Remote HR, recruiting and people operations jobs from verified companies.", intro: "Remote roles in HR and recruiting." },
];

export const landingFor = (path: string) => LANDINGS.find((l) => l.path === path);
