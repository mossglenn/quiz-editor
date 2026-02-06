# Working Session Guide

**Project**: Quiz Editor (IDIDE Ecosystem)  
**Last Updated**: 2026-02-05  
**Purpose**: Quick-start guide for new working sessions with Claude

---

## 🚀 Quick Start (First 60 Seconds)

### Current State
- ✅ **Next.js 16.1.6** initialized (App Router, Turbopack, React 19)
- ✅ **Tailwind v4 + shadcn/ui v3.8.3** configured
- ✅ **Semantic TypeScript types** created
- ✅ **All routes scaffolded** and building
- ✅ **Supabase** project connected (Postgres + Auth)
- ✅ **Database migration** run (profiles, projects, artifacts, links + RLS)
- ✅ **Email/password authentication** working
- ✅ **Route protection** implemented
- ✅ Latest commit: `ed3b690` on `main`

### What's Next
**Immediate Priority:**
1. Implement `SupabaseStorage` adapter (against `StorageAdapter` interface)
2. Deploy to Vercel (preview environment)
3. Add Google/GitHub OAuth (optional enhancement)

**Current Phase**: Phase 1, Week 1-2 (Foundation completed, backend implementation next)

---

## 📋 Project Context (30 Second Version)

### What We're Building
A **quiz editor** that's the first plugin in the "IDIDE" ecosystem:
- **Cloud Edition (MVP)**: Web-based SaaS for instant adoption (Next.js + Supabase)
- **Self-Hosted Edition (Future)**: Desktop app for enterprises (Tauri + SQLite)
- **Dual deployment**: Same React code, different storage backends

### Key Differentiators
- **Plugin-first architecture** - Designed for larger ecosystem
- **Semantic artifact typing** - Data is tool-agnostic (prevents vendor lock-in)
- **Git-style collaboration** - Branch, PR, review, merge workflow
- **Direct Storyline 360 integration** - Import/export Excel/CSV format
- **Dual deployment model** - Cloud for reach, self-hosted for control

### Business Model
**Cloud:** Free (1 project, 100 questions) → Pro $15/mo → Team $49/mo  
**Self-Hosted:** $299-$999 one-time or annual  
**Phase 1 Goal:** 100 signups, validate market

---

## 🏗️ Architecture at a Glance

### Cloud Edition (Current Focus)
```
Frontend: Next.js 16 (app.idide.io)
├── Quiz Editor (web app)
├── Graph Manager UI (PR review - future)
└── Quiz Review plugin (SME feedback - future)

Backend: Next.js API + Supabase
├── Postgres (projects, artifacts, users)
├── Auth (email, Google, GitHub)
├── Storage (Cloudflare R2 - future)
└── Git backend (simple-git - future)
```

### Core Data Model
```typescript
// Semantic artifact (plugin-agnostic)
interface Artifact {
    id: string;                    // 'artifact:uuid'
    type: string;                  // 'question', 'question-bank'
    schema_version: string;        // 'v1.0.0'
    metadata: { created_by, created_at, modified_at };
    data: any;                     // Type-specific data
}

// Storage abstraction (works for Supabase or SQLite)
interface StorageAdapter {
    getProjects(): Promise<Project[]>;
    getArtifacts(projectId: string, type?: string): Promise<Artifact[]>;
    saveArtifact(artifact: Artifact): Promise<void>;
    // ... more methods
}
```

### Tech Stack
- **Framework**: Next.js 16.1.6 (App Router, Turbopack)
- **UI**: shadcn/ui v3.8.3 (Radix + Tailwind v4)
- **WYSIWYG**: Tiptap (planned)
- **State**: Zustand + Immer
- **Database**: Supabase (Postgres + Auth)
- **Styling**: Tailwind CSS v4
- **TypeScript**: Strict mode

---

## 🎯 Core Principles (Keep These in Mind)

### 1. Semantic Artifact Typing
```typescript
// ✅ Good (semantic - tool-agnostic)
{ id: 'artifact:uuid', type: 'question' }

// ❌ Bad (tool-specific - vendor lock-in)
{ id: 'quiz-editor:question:uuid', created_by_tool: 'quiz-editor' }
```
**Why**: Multiple plugins can handle same types, users can switch tools.

### 2. Desktop-Aware Code
Even though Phase 1 is cloud-only, write code that works for both:
```typescript
// ✅ Good (works for Supabase or SQLite)
interface StorageAdapter {
    getProjects(): Promise<Project[]>
}

// ❌ Bad (Supabase-only)
async function getProjects() {
    return await supabase.from('projects').select('*')
}
```

### 3. Schema Versioning
```typescript
interface Artifact {
    schema_version: 'v1.0.0';  // ALWAYS include version!
}
```
**Why**: Enables evolution without breaking compatibility.

### 4. Tiptap JSON (Not HTML Strings)
```typescript
// ✅ Good (structured, versionable)
prompt: {
    type: 'doc',
    content: [{ type: 'paragraph', content: [...] }]
}

// ❌ Bad (HTML string - XSS risk, harder to transform)
prompt: '<p>What is <strong>2+2</strong>?</p>'
```

---

## 📂 File Structure

```
quiz-editor/
├── .claude/                          # AI context & workflows
│   ├── PROJECT_CONTEXT.md            # Full architecture (READ FIRST)
│   ├── SESSION.md                    # Work log & current state
│   ├── CLAUDE.md                     # Patterns & decisions
│   ├── CODE_REFERENCE.md             # Quick reference
│   └── WORKING_SESSION_GUIDE.md      # This file
├── src/
│   ├── app/
│   │   ├── (auth)/                   # Auth routes (login, signup)
│   │   ├── (dashboard)/              # Protected routes
│   │   │   ├── page.tsx              # Projects list
│   │   │   └── projects/
│   │   │       └── [projectId]/
│   │   │           ├── page.tsx      # Banks list
│   │   │           └── banks/
│   │   │               └── [bankId]/
│   │   │                   └── page.tsx  # Bank editor
│   │   └── auth/callback/            # Supabase auth callback
│   ├── components/
│   │   ├── ui/                       # shadcn primitives
│   │   ├── project/                  # Project components
│   │   ├── bank/                     # Bank components
│   │   └── question/                 # Question components
│   ├── lib/
│   │   ├── storage/
│   │   │   ├── interface.ts          # StorageAdapter interface
│   │   │   └── supabase.ts           # Supabase implementation (NEXT)
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   └── middleware.ts         # Middleware client
│   │   └── utils.ts
│   ├── store/
│   │   └── app-store.ts              # Zustand + Immer
│   └── types/
│       ├── artifact.ts               # Artifact types
│       └── database.ts               # Supabase types
└── supabase/
    └── migrations/                   # Database migrations
```

---

## 🔨 Common Commands

```bash
# Development
npm run dev                           # Start Next.js dev server
npm run build                         # Build for production
npm run type-check                    # Check TypeScript errors
npm run lint                          # Run ESLint

# Supabase
npx supabase status                   # Check connection
npx supabase db push                  # Push schema changes
npx supabase migration new <name>     # Create new migration

# Git
git status                            # Check what's changed
git log --oneline -10                 # Recent commits
git add .                             # Stage all changes
git commit -m "feat: description"     # Commit (conventional commits)
git push                              # Push to remote

# Claude Desktop workflow
"update session"                      # Update SESSION.md (end of session)
```

---

## 🎨 Coding Conventions

### TypeScript
```typescript
// ✅ Strict typing
interface Question {
    id: string;
    prompt: TiptapJSON;
    answers: Answer[];
}

// ❌ Avoid 'any'
function update(data: any) { }
```

### React Components
```typescript
// ✅ Functional + typed props
interface Props {
    question: Question;
    onUpdate: (q: Question) => void;
}

export function QuestionEditor({ question, onUpdate }: Props) {
    return <div>...</div>;
}
```

### Styling (Tailwind)
```typescript
// ✅ Utility classes
<Card className="p-6 hover:shadow-lg transition-shadow">

// ❌ Inline styles
<Card style={{ padding: '24px' }}>
```

---

## 🚨 Critical Reminders

### Architecture Changes (2026-02-04)
**The project went through a major revision:**
- **Original plan**: Supabase with pessimistic locking, real-time sync
- **Revised plan**: Offline-first, semantic typing, hub-plugin ecosystem
- **Current**: Back to Supabase for cloud MVP, but with semantic types

### Database Schema (Supabase)
```sql
-- Core tables (already migrated)
profiles                  -- User profiles (extends Supabase Auth)
projects                  -- Project list
project_collaborators     -- Team members
artifacts                 -- Questions, banks (JSONB data)
artifact_links            -- Relationships between artifacts
pull_requests            -- PR workflow (future)
pr_comments              -- PR feedback (future)
```

**RLS Enabled**: Users only see their own projects + collaborations.

### Authentication Flow
```
1. User signs up/logs in → Supabase Auth
2. Profile auto-created via trigger
3. Dashboard checks auth → redirect to /login if not authenticated
4. Protected routes use getUser() server-side
```

---

## 📚 When to Read Each File

### Start of Session
1. **This file** (WORKING_SESSION_GUIDE.md) - Quick context
2. **SESSION.md** - Current state, what's next, recent work

### Deep Dive Needed
3. **PROJECT_CONTEXT.md** - Full architecture, data model, implementation plan
4. **CLAUDE.md** - Established patterns, design decisions
5. **CODE_REFERENCE.md** - Quick lookup during coding

### Workflow Actions
6. **prompts/*.md** - Workflow templates (commit messages, handoffs)

---

## 🎯 Next Steps (Updated Weekly)

### This Week (Week 1-2 Completion)
1. **Implement SupabaseStorage** adapter
   - Create `src/lib/storage/supabase.ts`
   - Implement all `StorageAdapter` methods
   - Use existing Supabase client from `src/lib/supabase/server.ts`
   - Test CRUD operations for projects and artifacts

2. **Deploy to Vercel**
   - Connect GitHub repo to Vercel
   - Add environment variables (Supabase keys)
   - Test preview deployment
   - Configure custom domain (later)

3. **Optional Enhancements**
   - Add Google OAuth
   - Add GitHub OAuth
   - Add anonymous mode for free tier

### Coming Soon (Week 3-4)
- Project management UI (create, list, delete projects)
- Bank management UI (create, list, delete banks)
- Project settings page

---

## 💡 Tips for Effective Sessions

### For Planning Sessions (Desktop)
- Update PROJECT_CONTEXT.md for architecture changes
- Update CLAUDE.md when patterns solidify
- Run "update session" at end to capture work

### For Implementation Sessions (Code)
- Read this guide + SESSION.md first
- Check "What's Next" section
- Commit frequently (every feature/fix)
- Follow established patterns (CLAUDE.md)
- Fix TypeScript errors before committing

### For Handoffs
- Desktop → Code: Update SESSION.md → Code reads and implements
- Code → Desktop: Commit with good messages → Desktop runs "update session"

---

## 🔗 Important Links

- **Storyline Import Format**: https://www.articulatesupport.com/article/Storyline-360-Importing-Questions-from-Excel-Spreadsheets-and-Text-Files
- **Next.js 16 Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tiptap Docs**: https://tiptap.dev/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Zustand**: https://zustand-demo.pmnd.rs

---

## 📊 Success Metrics

### Phase 1 Milestones
- **Week 4**: Project/bank management works
- **Week 6**: Bank list populated with dummy data
- **Week 9**: Can edit questions with Tiptap
- **Week 11**: Import/export Storyline CSV works
- **Week 12**: Deployed to production

### Launch Goals (Month 1)
- 100 signups
- 20 active projects
- 10 Storyline imports

### Phase 1 Complete (Month 3)
- 500 signups
- 100 active users (7-day)
- 50 projects with 10+ questions
- 5% ask about paid tier → validates Phase 2

---

## 🤔 Decision Framework

### When to Update Which File

**SESSION.md**: Every session (work log, current state)  
**PROJECT_CONTEXT.md**: Major architecture changes  
**CLAUDE.md**: When patterns solidify (infrequent)  
**CODE_REFERENCE.md**: When conventions change  
**This Guide**: Weekly or when onboarding process changes

### When to Ask Questions
- Unclear what to implement? → Check SESSION.md "What's Next"
- How to implement something? → Check CLAUDE.md patterns
- Need full context? → Read PROJECT_CONTEXT.md
- Quick lookup? → Check CODE_REFERENCE.md

---

## 🎬 Session Startup Checklist

- [ ] Read this guide (WORKING_SESSION_GUIDE.md)
- [ ] Check SESSION.md → "What's Next"
- [ ] Check SESSION.md → "Blockers" (any?)
- [ ] Review recent commits (`git log --oneline -10`)
- [ ] Understand current state vs. target state
- [ ] Have PROJECT_CONTEXT.md open for reference
- [ ] Have CODE_REFERENCE.md open for quick lookup
- [ ] Ready to code/plan!

---

**Last Updated**: 2026-02-05  
**Project Location**: `/Users/amosglenn/Dev/quiz-editor`  
**Current Branch**: `main`  
**Latest Commit**: `ed3b690` (Supabase + Authentication)

---

**Remember**: This is a living document. Update weekly or when significant changes occur.
