# Session Log

**Project**: Quiz Editor (IDIDE Ecosystem)  
**Last Updated**: 2026-02-04
**Current Phase**: Phase 1, Week 1 (Foundation initialized)

---

## Current State

### What's Done

- ✅ **DUAL DEPLOYMENT STRATEGY DESIGNED**: Cloud SaaS + Self-Hosted Desktop
- ✅ Cloud-first, desktop-aware architecture finalized
- ✅ Hub-plugin ecosystem design complete
- ✅ Semantic artifact typing designed (plugin-agnostic data model)
- ✅ Git-style collaboration model designed (branching, PRs, offline-first)
- ✅ Business model defined (Cloud: $15-$49/mo, Self-Hosted: $299-$999)
- ✅ 5-phase roadmap: Cloud Free → Pro → Team → Self-Hosted → Ecosystem
- ✅ Quiz Review plugin concept (web-only, SME feedback workflow)
- ✅ Universal plugin architecture (code runs in both cloud and desktop)
- ✅ All `.claude/` documentation updated
- ✅ **Next.js 16.1.6 initialized** (App Router, Turbopack, React 19, TypeScript strict)
- ✅ **Tailwind v4 + shadcn/ui v3.8.3** configured (button, card, dialog, input, label, textarea, sonner, dropdown-menu, separator)
- ✅ **Semantic TypeScript types** created (`Artifact`, `TiptapJSON`, `QuestionArtifact`, `BankArtifact`, `Project`)
- ✅ **Storage adapter interface** defined (`StorageAdapter` in `src/lib/storage/interface.ts`)
- ✅ **Zustand + Immer store** set up (`src/store/app-store.ts`)
- ✅ **All routes scaffolded**: `/`, `/projects`, `/projects/[projectId]`, `/projects/[projectId]/banks/[bankId]`, `/login`, `/signup`
- ✅ **Build passes** — all routes compile and render
- ✅ Committed as `2b1fc4c` on `main`

### What's Next (Phase 1: Week 1-2 remaining)

**Backend / Supabase:**
- [ ] Set up Supabase project (Postgres + Auth)
- [ ] Create database schema (projects, artifacts, links, users)
- [ ] Set up RLS policies
- [ ] Implement `SupabaseStorage` adapter (against `StorageAdapter` interface)
- [ ] Deploy to Vercel (preview environment)

**Authentication:**
- [ ] Supabase Auth integration
- [ ] Configure authentication (email/password, Google, GitHub)
- [ ] Anonymous mode (no auth for free tier)
- [ ] Sign up / login page UI

### Active Strategy

**Cloud-First, Desktop-Aware**

**Phase 1 (MVP - 3 months):** Cloud Free Tier
- Web app (Next.js + Supabase)
- Instant "try it now" for validation
- Free: 1 project, 100 questions, 2 collaborators
- Goal: Prove people will use it

**Phase 2 (2 months):** Cloud Pro Tier
- Visual Graph Manager (PR review UI)
- Collaboration features
- $15/month per user
- Goal: Convert free → paid

**Phase 3 (2 months):** Quiz Review Plugin
- Web-only plugin for SME feedback
- Anonymous review links
- Team tier: $49/month
- Goal: Upsell to teams

**Phase 4 (3 months):** Self-Hosted Desktop
- Tauri desktop apps
- SQLite storage
- $299-$999 one-time or annual
- Goal: Enterprise sales

**Phase 5 (Ongoing):** Plugin Ecosystem
- Objective Editor, Gap Analysis, etc.
- Plugin marketplace
- Community contributions

### Core Architecture Principles

1. **Dual Deployment** - Same code runs in cloud (Vercel) and desktop (Tauri)
2. **Semantic Typing** - Artifacts typed by what they are, not which tool created them
3. **Storage Adapter** - Abstract interface, Supabase or SQLite implementation
4. **Offline-First** - IndexedDB cache in cloud, full offline in desktop
5. **Plugin Interchangeable** - Multiple plugins can handle same artifact types
6. **Git-Style Workflow** - Branch, PR, review, merge (not real-time sync)

### Blockers

**None!** Platform decision resolved: Cloud-first web app (Next.js), desktop later (Phase 4).

### Open Questions

1. **Auto-save frequency**: Every 3s? 5s? On every change (debounced)?
2. **Anonymous projects**: Allow without account? Or require signup?
3. **File upload size**: Storyline CSVs can be large - what's limit?
4. **Email provider**: Use Supabase built-in or Resend?
5. **Analytics**: Plausible (privacy-focused) or PostHog (feature-rich)?

---

## Session History

### 2026-02-04 — Phase 1 Week 1: Foundation Initialized

**Focus**: Set up the Next.js project and core architecture for the cloud MVP.

**Accomplishments**:

- Initialized Next.js 16.1.6 (App Router, Turbopack, React 19, TypeScript strict)
- Configured Tailwind v4 + shadcn/ui v3.8.3 with 9 UI components
- Created semantic TypeScript types (`Artifact`, `TiptapJSON`, `QuestionArtifact`, `BankArtifact`, `Project`)
- Defined `StorageAdapter` interface for desktop-aware storage abstraction
- Set up Zustand + Immer state store with project/bank/question actions
- Scaffolded all 6 routes with route groups: `(auth)` and `(dashboard)`
- Build passes cleanly, all routes compile and render
- Committed as `2b1fc4c`

**Key Decisions**:

- Skipped React Compiler (not needed for MVP)
- Used `sonner` instead of deprecated `toast` component
- Next.js 16 dynamic params require `Promise`-based `await params` pattern
- Kept placeholder pages minimal — real UI comes in later weeks

**Next Steps**:

1. Set up Supabase (Postgres + Auth)
2. Create database schema and RLS policies
3. Implement `SupabaseStorage` adapter
4. Build authentication pages
5. Deploy to Vercel preview

---

### 2025-02-04 (Evening) — Dual Deployment Strategy Finalized

**Focus**: Resolved desktop vs web decision with dual deployment model

**Context**:
Debated desktop (Tauri) vs web (Next.js) for MVP. Both have strong pros/cons. Realized we can have both by building cloud-first with desktop-aware architecture.

**Key Insights**:
- "Try it now" is critical for adoption → Start with cloud
- Enterprises need data sovereignty → Add self-hosted desktop later
- Same React code can run in both environments (storage adapter pattern)
- Quiz Review plugin solves SME feedback problem (web-only)
- Two deployment models serve different markets (freelancers vs enterprises)

**Major Decisions**:

**1. Cloud-First Strategy**
- MVP is web app (Next.js + Supabase)
- Deployed to app.idide.io (Vercel)
- Free tier for validation (1 project, 100 questions)
- Faster to market, lower risk

**2. Desktop-Aware Architecture**
- Write universal code (works in both environments)
- Storage adapter interface (Supabase impl for cloud, SQLite for desktop)
- Same React components, same business logic
- Phase 4 adds desktop without rewriting

**3. Dual Deployment Models**

**Cloud Edition (Phase 1-3):**
- Web-based SaaS
- Hosted by us (app.idide.io)
- Supabase (Postgres + Auth)
- Pricing: Free, Pro ($15/mo), Team ($49/mo)
- Target: Freelancers, small teams, educators

**Self-Hosted Edition (Phase 4):**
- Desktop apps (Tauri)
- User's infrastructure
- SQLite + local git
- Pricing: $299-$999 one-time or annual
- Target: Enterprises, power users, agencies

**4. Quiz Review Plugin**
- Web-only plugin for SME feedback
- Anonymous review links (no login required)
- SMEs can comment, approve, request changes
- Hosted in cloud (app.idide.io/review/{prId})
- Self-hosted users run Docker container (localhost:3000)

**5. Business Model**

**Cloud Pricing:**
- Free: 1 project, 100 questions, 2 collaborators
- Pro: $15/month - 10 projects, 1000 questions, 10 collaborators
- Team: $49/month - Unlimited, 50 collaborators, Quiz Review
- Enterprise: Custom - SSO, SLA, on-premise

**Self-Hosted Pricing:**
- Personal: $299 one-time
- Team: $999 one-time or $499/year
- Enterprise: Custom

**Revenue Projections:**
- Year 1: ~$24K (cloud only, validation)
- Year 2: ~$172K (cloud + self-hosted)
- Year 3: ~$738K (ecosystem growth)

**6. 5-Phase Roadmap**

**Phase 1 (3 months):** Cloud Free Tier (MVP)
- Web quiz editor
- Storyline import/export
- Anonymous projects
- Auth (email, Google, GitHub)
- Deploy to Vercel
- **Goal**: 100 signups, validate market

**Phase 2 (2 months):** Cloud Pro Tier
- Visual Graph Manager
- PR workflow
- Diff viewer
- Conflict resolution
- **Goal**: 10% free → paid conversion

**Phase 3 (2 months):** Quiz Review Plugin
- SME feedback workflow
- Anonymous review links
- Comment system
- **Goal**: Upsell to Team tier ($49/mo)

**Phase 4 (3 months):** Self-Hosted Desktop
- Tauri desktop apps
- SQLite storage
- Local git integration
- Docker web server
- **Goal**: Enterprise deals

**Phase 5 (Ongoing):** Plugin Ecosystem
- Objective Editor
- Gap Analysis
- Content Builder
- Plugin marketplace

**Discussion Highlights**:

*On dual deployment:*
"What about doing both? There could be a version that is 'self-hosted' where the administrator uses desktop... But there could also be a hosted version where the infrastructure is hosted by me and the interface is online web-based."

*On Quiz Review plugin:*
"There could be a plugin that provides basic quiz creation, and another plugin that provides quiz review urls for SMEs to visit and review/comment/approve quizzes."

*On Graph Manager GUI:*
"I think merging branches is going to need some tools beyond simple git commands or even what GitHub provides. So I'm thinking that the central graph is going to need some sort of interface."

**Files Updated**:
- Updated: `.claude/PROJECT_CONTEXT.md` (complete rewrite for dual deployment)
- Updated: `.claude/SESSION.md` (this file)
- Pending: `.claude/CLAUDE.md` (add cloud patterns)
- Pending: `.claude/CODE_REFERENCE.md` (update for Next.js + Supabase)

**Next Steps**:
1. Update remaining `.claude/` files
2. Start Phase 1, Week 1: Initialize Next.js project
3. Set up Supabase
4. Create database schema
5. Build authentication

**Notes for Next Session**:
- Start with cloud web app (Next.js)
- Write desktop-aware code (storage adapter pattern)
- Focus on validation first (prove market exists)
- Desktop edition comes later (Phase 4) if demand exists
- Same codebase powers both environments

### 2025-02-04 (Afternoon) — Major Architecture Revision

**Focus**: Reimagined quiz editor as first plugin in IDIDE ecosystem

**Accomplishments**:
- Designed hub-plugin architecture
- Defined semantic artifact typing
- Planned git-style collaboration workflow
- Created offline-first design
- Documented central graph for provenance

**Key Decisions**:
- Artifacts typed by what they are (semantic), not which tool created them
- Plugins declare capabilities via manifest
- Hub provides graph traversal API (future)
- Local storage for MVP (no backend)
- Git-style PRs instead of real-time sync

**Impact**:
- Removed: Supabase requirement, real-time sync, pessimistic locking
- Added: Semantic typing, plugin manifest, hub integration plan
- Deferred: Platform decision (desktop vs web)

*(See earlier session notes for full details)*

### 2025-02-03 — Initial Planning & Workflow Setup

**Focus**: Project setup, tech stack decisions, `.claude/` infrastructure

**Accomplishments**:
- Created all `.claude/` documentation files
- Set up workflow prompts
- Validated Desktop Commander access
- Initial PROJECT_CONTEXT.md (now obsolete)

**Note**: Original plan was Supabase-based, pessimistic locking, real-time sync. All superseded by 2025-02-04 revisions.

---

## Dual Deployment Architecture Summary

### Cloud Edition (Your SaaS)

```
Frontend: Next.js (app.idide.io)
├── Quiz Editor (web app)
├── Graph Manager UI (PR review)
└── Quiz Review plugin

Backend: Next.js API + Supabase
├── Postgres (projects, artifacts, users)
├── Auth (email, Google, GitHub)
├── Storage (Cloudflare R2)
└── Git backend (simple-git)

Deployment:
├── Vercel (frontend)
├── Supabase (database + auth)
└── Cloudflare R2 (file uploads)
```

**Users:** Freelancers, small teams, educators
**Pricing:** Free, $15/mo (Pro), $49/mo (Team)

### Self-Hosted Edition (User's Infrastructure)

```
Desktop Apps: Tauri
├── Graph Manager (PR review GUI)
└── Quiz Editor (local-first)

Storage:
├── SQLite (artifacts)
├── Git repo (version control)
└── File system (exports)

Optional Web Server: Docker
├── Quiz Review plugin
└── Read-only SME access

User's Git:
├── GitHub Enterprise
├── GitLab
└── Bitbucket
```

**Users:** Enterprises, agencies, power users
**Pricing:** $299-$999 one-time or annual

### Universal Plugins (Work in Both)

```typescript
// Plugin manifest supports both modes
{
  name: 'quiz-editor',
  version: '1.0.0',
  
  modes: {
    web: {
      supported: true,
      storage: 'cloud-api',     // Supabase
      platform: 'browser'
    },
    desktop: {
      supported: true,
      storage: 'sqlite',         // Local DB
      platform: 'tauri'
    }
  },
  
  handles: [
    { type: 'question', can_read: true, can_write: true }
  ]
}
```

**Key Insight**: Same React code, different storage backend.

---

## Quiz Review Plugin (SME Feedback Workflow)

### Problem It Solves

Instructional designers need Subject Matter Expert (SME) feedback on quizzes, but:
- SMEs aren't technical (don't use git, IDEs)
- SMEs shouldn't need accounts (friction)
- SMEs need clean, focused review UI (not editing tools)
- IDs need structured feedback (not email threads)

### Solution: Quiz Review Plugin

**Web-only plugin** that provides:
1. Anonymous review links (no login required)
2. Clean question display
3. Comment on specific questions
4. Approve/request changes workflow
5. Review history

### Workflow

**Cloud Edition:**
```
1. ID creates quiz in Quiz Editor
2. ID commits to branch, creates PR
3. Graph Manager generates link:
   https://app.idide.io/review/abc123/pr-45
4. ID emails link to SME
5. SME opens in browser, sees questions
6. SME leaves comments:
   "Question 3: Answer B should be correct, not C"
   "Question 7: Wording is unclear"
7. Comments stored in PR
8. ID sees comments in Graph Manager
9. ID makes changes, SME re-reviews
10. SME approves, ID merges PR
```

**Self-Hosted Edition:**
```
Same workflow, but:
- Link is localhost:3000/review/...
- Runs on user's web server (Docker)
- No data leaves user's network
```

### Revenue Impact

- **Pro tier** ($15/mo): Single user, no Quiz Review
- **Team tier** ($49/mo): Includes Quiz Review for teams
- **Upsell path**: Solo users hit SME feedback need → upgrade to Team

---

## Phase 1 Implementation Plan (Cloud MVP)

### Week 1-2: Foundation ← **START HERE**

**Setup:**
- [ ] `npx create-next-app@latest quiz-editor`
- [ ] Configure TypeScript (strict mode)
- [ ] Install dependencies: Tailwind, shadcn/ui, Tiptap, Zustand, papaparse, Zod
- [ ] Set up Supabase project
- [ ] Create database schema (run SQL migrations)
- [ ] Configure RLS policies
- [ ] Set up Supabase client (server + client)
- [ ] Deploy to Vercel (connect to GitHub)
- [ ] Configure custom domain (app.idide.io)

**Authentication:**
- [ ] Supabase Auth integration
- [ ] Sign up / login pages
- [ ] Email/password authentication
- [ ] Google OAuth
- [ ] GitHub OAuth
- [ ] Anonymous mode (create projects without account)
- [ ] User profile page

**File Structure:**
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx                    # Project list
│   │   ├── projects/
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Bank list
│   │   │       └── banks/
│   │   │           └── [bankId]/
│   │   │               └── page.tsx    # Bank editor
│   └── api/                             # API routes (if needed)
├── components/
│   ├── ui/                              # shadcn primitives
│   ├── project/
│   ├── bank/
│   └── question/
├── lib/
│   ├── storage/
│   │   ├── interface.ts                 # StorageAdapter interface
│   │   └── supabase.ts                  # Supabase implementation
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
├── store/
│   └── app-store.ts                     # Zustand + Immer
└── types/
    ├── artifact.ts
    ├── database.ts                      # Supabase types
    └── plugin.ts
```

### Week 3-4: Project Management

**Features:**
- [ ] Create project (modal with name, description)
- [ ] List projects (dashboard page)
- [ ] Open project (navigate to bank list)
- [ ] Delete project (with confirmation)
- [ ] Project settings page

**UI Components:**
- [ ] ProjectList component
- [ ] ProjectCard component (shows title, question count, last edited)
- [ ] CreateProjectModal component
- [ ] DeleteConfirmDialog component

**Storage:**
- [ ] Implement `StorageAdapter` interface
- [ ] `SupabaseStorage.getProjects()`
- [ ] `SupabaseStorage.saveProject()`
- [ ] `SupabaseStorage.deleteProject()`
- [ ] Test RLS policies (users only see their projects)

### Week 5-6: Bank Management

**Features:**
- [ ] Create bank within project
- [ ] List banks in project
- [ ] Open bank (navigate to editor)
- [ ] Delete bank
- [ ] Edit bank metadata (title, description)

**UI Components:**
- [ ] BankList component
- [ ] BankCard component
- [ ] CreateBankModal component

**Storage:**
- [ ] Bank artifacts in Postgres
- [ ] Link banks to projects (foreign key)

### Week 7-9: Question Editor

**Features:**
- [ ] Install Tiptap and configure
- [ ] Question editor layout (sidebar + editor panel)
- [ ] Add/edit/delete questions
- [ ] Question types: Multiple Choice, Multiple Response, True/False
- [ ] Rich text prompts (Tiptap)
- [ ] Rich text answers (Tiptap)
- [ ] Rich text feedback (correct/incorrect)
- [ ] Drag-to-reorder questions (dnd-kit)

**UI Components:**
- [ ] BankEditor page (main layout)
- [ ] QuestionSidebar component (list of questions)
- [ ] QuestionEditor component (edit panel)
- [ ] PromptEditor component (Tiptap instance)
- [ ] AnswerList component
- [ ] AnswerEditor component (Tiptap instance per answer)
- [ ] FeedbackEditor component (correct/incorrect Tiptap instances)
- [ ] TypeSelector component (dropdown)
- [ ] Toolbar component (undo, redo, import, export)

**State Management:**
- [ ] Zustand store with Immer
- [ ] Undo/redo stack (serialize state snapshots)
- [ ] Auto-save (debounced, every 3-5s)
- [ ] Optimistic updates (update UI, then sync)

### Week 10-11: Import/Export

**Features:**
- [ ] Import Storyline CSV
- [ ] Validate imported data (Zod schemas)
- [ ] Convert Storyline format → artifacts
- [ ] Export artifacts → Storyline CSV
- [ ] Export project as JSON (backup)
- [ ] Download button (trigger file download)

**UI Components:**
- [ ] ImportModal component (file picker, drag-and-drop)
- [ ] ImportProgressIndicator component
- [ ] ExportButton component (format selector)
- [ ] ErrorDisplay component (validation errors)

**Implementation:**
- [ ] papaparse for CSV parsing
- [ ] Zod schemas for Storyline format
- [ ] `storylineToArtifacts()` function
- [ ] `artifactsToStoryline()` function
- [ ] `textToTiptap()` helper (plain text → Tiptap JSON)
- [ ] `tiptapToText()` helper (Tiptap JSON → plain text)
- [ ] Handle edge cases (missing columns, invalid data, extra columns)

### Week 12: Polish & Launch

**Features:**
- [ ] Responsive design (test on desktop, tablet)
- [ ] Loading states (skeletons, spinners)
- [ ] Error handling (toast notifications)
- [ ] Empty states (no projects, no banks, no questions)
- [ ] Keyboard shortcuts (Cmd+Z, Cmd+Y, Cmd+S, Cmd+N)
- [ ] Help tooltips (onboarding)
- [ ] Accessibility audit (keyboard nav, ARIA labels, focus management)
- [ ] Performance optimization (lazy loading, code splitting)

**Testing:**
- [ ] Manual testing with real Storyline CSV files
- [ ] Test import → edit → export → import to Storyline 360
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile/tablet testing (iPad)
- [ ] Performance testing (100+ question banks)
- [ ] Stress testing (rapid edits, large imports)

**Deployment:**
- [ ] Production build (`npm run build`)
- [ ] Deploy to Vercel production
- [ ] Configure custom domain (app.idide.io)
- [ ] SSL certificate (automatic with Vercel)
- [ ] Set up analytics (Plausible or PostHog)
- [ ] Set up error tracking (Sentry)
- [ ] Create marketing site (idide.io landing page)

**Launch:**
- [ ] Demo video (screen recording with Loom)
- [ ] Launch on Product Hunt
- [ ] Share on Twitter, LinkedIn
- [ ] Post in ID communities (Reddit, Facebook groups)
- [ ] Email beta testers
- [ ] Monitor analytics and errors

---

## Notes & Observations

### Why Cloud-First Works

- ✅ **Validation**: Prove market exists before investing in desktop
- ✅ **Speed**: Web app ships faster than desktop (no installers, signing)
- ✅ **Reach**: "Try it now" removes all friction
- ✅ **Learning**: User feedback shapes desktop features
- ✅ **Revenue**: Monthly subscriptions fund desktop development

### Desktop-Aware Code Patterns

Even though Phase 1 is cloud-only, write code that works in both:

```typescript
// ✅ Good (desktop-aware)
interface StorageAdapter {
  getProjects(): Promise<Project[]>
}

class SupabaseStorage implements StorageAdapter { /* cloud */ }
class SQLiteStorage implements StorageAdapter { /* desktop */ }

// ❌ Bad (cloud-only)
async function getProjects() {
  return await supabase.from('projects').select('*')
}
```

### Future Migration Path

**Phase 1 → Phase 4:**
1. Extract storage adapter to shared package
2. Create Tauri project
3. Import React components from cloud
4. Implement SQLiteStorage
5. Add desktop-specific features (file system access)
6. Package as .dmg, .exe, .AppImage

**Code reuse**: ~80% of React components, 100% of business logic, different storage only.

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run type-check       # Check TypeScript errors
npm run lint             # Run ESLint

# Supabase
npx supabase status      # Check connection
npx supabase db push     # Push schema changes
npx supabase migration new <name>  # Create migration

# Git
git status
git add .
git commit -m "feat: add project management"
git push

# Update session (Desktop)
"update session"
```

### File Locations

- **Project context**: `.claude/PROJECT_CONTEXT.md`
- **Session notes**: `.claude/SESSION.md` (this file)
- **Architecture patterns**: `.claude/CLAUDE.md`
- **Code quick reference**: `.claude/CODE_REFERENCE.md`

### Phase 1 Success Metrics

**Week 4:** Project/bank management works
**Week 6:** Bank list populated with dummy data
**Week 9:** Can edit questions with Tiptap
**Week 11:** Import/export Storyline CSV works
**Week 12:** Deployed to production, first users

**Month 1 after launch:**
- 100 signups
- 20 active projects
- 10 Storyline imports

**Month 3 after launch:**
- 500 signups
- 100 active users (7-day)
- 50 projects with 10+ questions
- 5% ask about paid tier

### Important Links

- **Storyline Import Docs**: https://www.articulatesupport.com/article/Storyline-360-Importing-Questions-from-Excel-Spreadsheets-and-Text-Files
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tiptap Docs**: https://tiptap.dev/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Zustand**: https://zustand-demo.pmnd.rs

---

## Current Focus

**Immediate Next Step**: Week 1 foundation setup
- Initialize Next.js project
- Configure Tailwind + shadcn/ui
- Set up Supabase
- Create database schema
- Configure authentication

**Platform**: Cloud web app (Next.js + Supabase)
**Goal**: Validate market with free tier
**Timeline**: 3 months to MVP launch
**Success**: 100 signups, 10% create projects

---

**End of SESSION.md**

Update this file after every session using "update session" workflow.
