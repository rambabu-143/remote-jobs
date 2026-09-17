# Graph Report - remote-jobs-board  (2026-09-17)

## Corpus Check
- 45 files · ~11,043 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 82 nodes · 51 edges · 4 communities detected
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]

## God Nodes (most connected - your core abstractions)
1. `requireAdmin()` - 5 edges
2. `updateApplicationStatus()` - 4 edges
3. `applyToJob()` - 4 edges
4. `sendEmail()` - 3 edges
5. `saveJob()` - 3 edges
6. `toggleJobActive()` - 3 edges
7. `Layout()` - 2 edges
8. `async()` - 2 edges
9. `GET()` - 2 edges
10. `JobCard()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `sendEmail()` --calls--> `updateApplicationStatus()`  [INFERRED]
  src/lib/email.ts → src/lib/actions/jobs.ts
- `Layout()` --calls--> `baseOptions()`  [INFERRED]
  src/app/docs/layout.tsx → src/lib/layout.shared.tsx
- `async()` --calls--> `toggleJobActive()`  [INFERRED]
  src/app/(site)/admin/jobs/page.tsx → src/lib/actions/jobs.ts
- `GET()` --calls--> `readResumeFile()`  [INFERRED]
  src/app/api/files/resumes/[filename]/route.ts → src/lib/storage.ts
- `JobCard()` --calls--> `formatSalary()`  [INFERRED]
  src/components/JobCard.tsx → src/lib/job-labels.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.27
Nodes (8): deleteJob(), requireAdmin(), saveJob(), toggleJobActive(), toIntOrNull(), updateApplicationStatus(), StatusSelect(), async()

### Community 1 - "Community 1"
Cohesion: 0.22
Nodes (6): applyToJob(), GET(), sendEmail(), isAllowedResumeType(), readResumeFile(), saveResumeFile()

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (2): JobCard(), formatSalary()

### Community 3 - "Community 3"
Cohesion: 0.5
Nodes (2): Layout(), baseOptions()

## Knowledge Gaps
- **Thin community `Community 2`** (6 nodes): `JobCard()`, `formatRelativeTime()`, `formatSalary()`, `initials()`, `JobCard.tsx`, `job-labels.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 3`** (4 nodes): `Layout()`, `baseOptions()`, `layout.tsx`, `layout.shared.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `updateApplicationStatus()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `sendEmail()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `updateApplicationStatus()` (e.g. with `StatusSelect()` and `sendEmail()`) actually correct?**
  _`updateApplicationStatus()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `applyToJob()` (e.g. with `isAllowedResumeType()` and `saveResumeFile()`) actually correct?**
  _`applyToJob()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `sendEmail()` (e.g. with `updateApplicationStatus()` and `applyToJob()`) actually correct?**
  _`sendEmail()` has 2 INFERRED edges - model-reasoned connections that need verification._