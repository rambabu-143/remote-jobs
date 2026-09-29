# Graph Report - remote-jobs-board  (2026-09-29)

## Corpus Check
- 65 files · ~15,261 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 135 nodes · 122 edges · 8 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]

## God Nodes (most connected - your core abstractions)
1. `auth()` - 13 edges
2. `createClient()` - 6 edges
3. `requireAdmin()` - 6 edges
4. `createAdminClient()` - 5 edges
5. `saveJob()` - 5 edges
6. `applyToJob()` - 5 edges
7. `createRazorpayOrder()` - 5 edges
8. `POST()` - 4 edges
9. `saveResumeFile()` - 4 edges
10. `saveLogoFile()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `isAllowedLogoType()` --calls--> `saveJob()`  [INFERRED]
  src/lib/storage.ts → src/lib/actions/jobs.ts
- `Layout()` --calls--> `auth()`  [INFERRED]
  src/app/docs/layout.tsx → src/lib/auth.ts
- `AdminLayout()` --calls--> `auth()`  [INFERRED]
  src/app/(site)/admin/layout.tsx → src/lib/auth.ts
- `DashboardPage()` --calls--> `auth()`  [INFERRED]
  src/app/(site)/dashboard/page.tsx → src/lib/auth.ts
- `GET()` --calls--> `auth()`  [INFERRED]
  src/app/api/files/resumes/[filename]/route.ts → src/lib/auth.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (9): applyToJob(), GET(), extOf(), isAllowedLogoType(), isAllowedResumeType(), readResumeFile(), saveLogoFile(), saveResumeFile() (+1 more)

### Community 1 - "Community 1"
Cohesion: 0.22
Nodes (8): markJobPaidAndPending(), verifyJobListingPayment(), activateSubscription(), verifyRazorpayPayment(), extendExpiry(), verifyPaymentSignature(), verifyWebhookSignature(), POST()

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (9): deleteJob(), requireAdmin(), saveJob(), toggleJobActive(), toIntOrNull(), updateApplicationStatus(), StatusSelect(), async() (+1 more)

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (9): createJobListingOrder(), createRazorpayOrder(), AdminLayout(), Nav(), subscribe(), DashboardPage(), auth(), getRazorpayClient() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (4): authenticate(), registerUser(), signOut(), createClient()

### Community 5 - "Community 5"
Cohesion: 0.33
Nodes (2): JobCard(), formatSalary()

### Community 6 - "Community 6"
Cohesion: 0.83
Nodes (3): isActive(), linkClass(), mobileLinkClass()

### Community 7 - "Community 7"
Cohesion: 0.5
Nodes (2): Layout(), baseOptions()

## Knowledge Gaps
- **Thin community `Community 5`** (6 nodes): `JobCard()`, `formatRelativeTime()`, `formatSalary()`, `initials()`, `JobCard.tsx`, `job-labels.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (4 nodes): `Layout()`, `baseOptions()`, `layout.tsx`, `layout.shared.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `auth()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 2` to `Community 3`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Community 4` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `auth()` (e.g. with `Layout()` and `AdminLayout()`) actually correct?**
  _`auth()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `createClient()` (e.g. with `auth()` and `signOut()`) actually correct?**
  _`createClient()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `createAdminClient()` (e.g. with `saveResumeFile()` and `readResumeFile()`) actually correct?**
  _`createAdminClient()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `saveJob()` (e.g. with `isAllowedLogoType()` and `saveLogoFile()`) actually correct?**
  _`saveJob()` has 2 INFERRED edges - model-reasoned connections that need verification._