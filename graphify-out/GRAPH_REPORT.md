# Graph Report - remote-jobs-board  (2026-09-24)

## Corpus Check
- 54 files · ~13,925 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 115 nodes · 106 edges · 8 communities detected
- Extraction: 68% EXTRACTED · 32% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.8)
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
1. `auth()` - 10 edges
2. `createClient()` - 6 edges
3. `requireAdmin()` - 6 edges
4. `createAdminClient()` - 5 edges
5. `saveJob()` - 5 edges
6. `applyToJob()` - 5 edges
7. `createRazorpayOrder()` - 5 edges
8. `saveResumeFile()` - 4 edges
9. `saveLogoFile()` - 4 edges
10. `updateApplicationStatus()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `isAllowedLogoType()` --calls--> `saveJob()`  [INFERRED]
  src/lib/storage.ts → src/lib/actions/jobs.ts
- `Layout()` --calls--> `auth()`  [INFERRED]
  src/app/docs/layout.tsx → src/lib/auth.ts
- `AdminLayout()` --calls--> `auth()`  [INFERRED]
  src/app/(site)/admin/layout.tsx → src/lib/auth.ts
- `GET()` --calls--> `readResumeFile()`  [INFERRED]
  src/app/api/files/resumes/[filename]/route.ts → src/lib/storage.ts
- `Nav()` --calls--> `auth()`  [INFERRED]
  src/components/Nav.tsx → src/lib/auth.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (10): activateSubscription(), createRazorpayOrder(), verifyRazorpayPayment(), subscribe(), extendExpiry(), getRazorpayClient(), isRazorpayConfigured(), verifyPaymentSignature() (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (8): authenticate(), registerUser(), AdminLayout(), Nav(), GET(), auth(), signOut(), createClient()

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (9): deleteJob(), requireAdmin(), saveJob(), toggleJobActive(), toIntOrNull(), updateApplicationStatus(), StatusSelect(), async() (+1 more)

### Community 3 - "Community 3"
Cohesion: 0.27
Nodes (8): applyToJob(), extOf(), isAllowedLogoType(), isAllowedResumeType(), readResumeFile(), saveLogoFile(), saveResumeFile(), createAdminClient()

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (2): JobCard(), formatSalary()

### Community 5 - "Community 5"
Cohesion: 0.83
Nodes (3): isActive(), linkClass(), mobileLinkClass()

### Community 6 - "Community 6"
Cohesion: 0.5
Nodes (2): Layout(), baseOptions()

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (2): getOrCreateAuthUser(), main()

## Knowledge Gaps
- **Thin community `Community 4`** (6 nodes): `JobCard()`, `formatRelativeTime()`, `formatSalary()`, `initials()`, `JobCard.tsx`, `job-labels.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (4 nodes): `Layout()`, `baseOptions()`, `layout.tsx`, `layout.shared.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (3 nodes): `getOrCreateAuthUser()`, `main()`, `seed.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `auth()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 6`?**
  _High betweenness centrality (0.171) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `auth()` (e.g. with `Layout()` and `AdminLayout()`) actually correct?**
  _`auth()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `createClient()` (e.g. with `auth()` and `signOut()`) actually correct?**
  _`createClient()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `createAdminClient()` (e.g. with `saveResumeFile()` and `readResumeFile()`) actually correct?**
  _`createAdminClient()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `saveJob()` (e.g. with `isAllowedLogoType()` and `saveLogoFile()`) actually correct?**
  _`saveJob()` has 2 INFERRED edges - model-reasoned connections that need verification._