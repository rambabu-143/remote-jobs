# Graph Report - remote-jobs-board  (2026-09-23)

## Corpus Check
- 52 files · ~13,549 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 104 nodes · 80 edges · 6 communities detected
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]

## God Nodes (most connected - your core abstractions)
1. `requireAdmin()` - 5 edges
2. `saveJob()` - 5 edges
3. `GET()` - 4 edges
4. `updateApplicationStatus()` - 4 edges
5. `applyToJob()` - 4 edges
6. `createRazorpayOrder()` - 4 edges
7. `activateSubscription()` - 4 edges
8. `POST()` - 3 edges
9. `isActive()` - 3 edges
10. `sendEmail()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `isAllowedLogoType()` --calls--> `saveJob()`  [INFERRED]
  src/lib/storage.ts → src/lib/actions/jobs.ts
- `saveLogoFile()` --calls--> `saveJob()`  [INFERRED]
  src/lib/storage.ts → src/lib/actions/jobs.ts
- `sendEmail()` --calls--> `updateApplicationStatus()`  [INFERRED]
  src/lib/email.ts → src/lib/actions/jobs.ts
- `Layout()` --calls--> `baseOptions()`  [INFERRED]
  src/app/docs/layout.tsx → src/lib/layout.shared.tsx
- `async()` --calls--> `toggleJobActive()`  [INFERRED]
  src/app/(site)/admin/jobs/page.tsx → src/lib/actions/jobs.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (10): activateSubscription(), createRazorpayOrder(), verifyRazorpayPayment(), subscribe(), extendExpiry(), getRazorpayClient(), isRazorpayConfigured(), verifyPaymentSignature() (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (9): applyToJob(), GET(), sendEmail(), isAllowedLogoType(), isAllowedResumeType(), readLogoFile(), readResumeFile(), saveLogoFile() (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.27
Nodes (8): deleteJob(), requireAdmin(), saveJob(), toggleJobActive(), toIntOrNull(), updateApplicationStatus(), StatusSelect(), async()

### Community 3 - "Community 3"
Cohesion: 0.33
Nodes (2): JobCard(), formatSalary()

### Community 4 - "Community 4"
Cohesion: 0.83
Nodes (3): isActive(), linkClass(), mobileLinkClass()

### Community 5 - "Community 5"
Cohesion: 0.5
Nodes (2): Layout(), baseOptions()

## Knowledge Gaps
- **Thin community `Community 3`** (6 nodes): `JobCard()`, `formatRelativeTime()`, `formatSalary()`, `initials()`, `JobCard.tsx`, `job-labels.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (4 nodes): `Layout()`, `baseOptions()`, `layout.tsx`, `layout.shared.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `saveJob()` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `updateApplicationStatus()` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `sendEmail()` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `saveJob()` (e.g. with `isAllowedLogoType()` and `saveLogoFile()`) actually correct?**
  _`saveJob()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `GET()` (e.g. with `readResumeFile()` and `readLogoFile()`) actually correct?**
  _`GET()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `updateApplicationStatus()` (e.g. with `StatusSelect()` and `sendEmail()`) actually correct?**
  _`updateApplicationStatus()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `applyToJob()` (e.g. with `isAllowedResumeType()` and `saveResumeFile()`) actually correct?**
  _`applyToJob()` has 3 INFERRED edges - model-reasoned connections that need verification._