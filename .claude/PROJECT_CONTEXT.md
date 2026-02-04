# Quiz Editor Project Context

**Generated**: 2025-02-04 (CLOUD-FIRST, DESKTOP-AWARE STRATEGY)  
**Purpose**: Context document for Claude Code implementation  
**Status**: Pre-implementation (dual deployment model designed)

---

## Project Overview

### What We're Building

A quiz editor that is the **first plugin** in the "IDIDE" (IDE for Instructional Design) ecosystem, with **two deployment models**:

1. **Cloud Edition (MVP)** - Web-based SaaS for instant "try it now" adoption
2. **Self-Hosted Edition (Future)** - Desktop app for enterprises and power users

**MVP (Cloud Free Tier):**
- Web-based quiz editor (React + Next.js)
- Creates and manages question banks online
- Imports/exports questions compatible with Articulate Storyline 360
- WYSIWYG editing for questions and feedback
- Hosted on your infrastructure (app.idide.io)
- Free tier: 1 project, 100 questions, 2 collaborators

**Future Cloud Pro/Team:**
- Visual Graph Manager for PR review
- Quiz Review plugin for SME feedback
- Collaboration features (comments, approvals)
- Team management
- Pricing: $15/month (Pro), $49/month (Team)

**Future Self-Hosted Edition:**
- Desktop Graph Manager (Tauri app)
- Desktop Quiz Editor (Tauri app)
- Local git integration (GitHub, GitLab)
- Self-hosted web server for Quiz Review plugin
- Complete data sovereignty
- Pricing: $999 one-time or $499/year

### Target Users

**Cloud Edition:**
- Freelance instructional designers
- Small teams (2-10 people)
- Teachers and educators
- Anyone who wants "try it now"

**Self-Hosted Edition:**
- Enterprise companies (defense, healthcare, finance)
- Large agencies with existing git infrastructure
- Organizations with strict data privacy requirements
- Power users who want complete control

### Key Differentiators

- **Dual deployment model** - Cloud for reach, self-hosted for control
- **Plugin-first architecture** - Designed for larger ecosystem
- **Semantic artifact typing** - Data is tool-agnostic (prevents vendor lock-in)
- **Git-style collaboration** - Branch, PR, review, merge workflow
- **Direct Storyline 360 integration** - Import/export Excel/CSV format
- **SME review workflow** - Quiz Review plugin for stakeholder feedback

---

## Dual Deployment Architecture

### Cloud Edition (Phase 1-3)

```
Cloud Infrastructure (Your SaaS)
┌─────────────────────────────────────────────────┐
│  Frontend (Next.js)                             │
│  ├── Quiz Editor (web app)                      │
│  ├── Graph Manager UI (PR review)               │
│  └── Quiz Review plugin (SME feedback)          │
├─────────────────────────────────────────────────┤
│  Backend (Next.js API Routes + Postgres)        │
│  ├── Git repositories (one per project)         │
│  ├── User authentication (Supabase Auth)        │
│  ├── Project/artifact storage (Postgres)        │
│  ├── File uploads (S3/Cloudflare R2)            │
│  └── Background workers (snapshots, exports)    │
├─────────────────────────────────────────────────┤
│  Deployment                                     │
│  ├── Frontend: Vercel                           │
│  ├── Database: Supabase (Postgres)              │
│  ├── Storage: Cloudflare R2                     │
│  └── Domain: app.idide.io                       │
└─────────────────────────────────────────────────┘
```

### Self-Hosted Edition (Phase 4)

```
Self-Hosted Infrastructure (User's)
┌─────────────────────────────────────────────────┐
│  Desktop Apps (Tauri)                           │
│  ├── Graph Manager (PR review GUI)              │
│  ├── Quiz Editor (local-first)                  │
│  └── Connects to local git repo                 │
├─────────────────────────────────────────────────┤
│  Local Storage                                  │
│  ├── SQLite database (artifacts)                │
│  ├── Git repository (version control)           │
│  └── File system (exports, backups)             │
├─────────────────────────────────────────────────┤
│  Optional: Web Server (Docker)                  │
│  ├── Quiz Review plugin (web UI)                │
│  ├── Comment system                             │
│  └── Read-only access for SMEs                  │
├─────────────────────────────────────────────────┤
│  User's Git Infrastructure                      │
│  ├── GitHub Enterprise                          │
│  ├── GitLab                                     │
│  └── Bitbucket                                  │
└─────────────────────────────────────────────────┘
```

### Universal Plugins (Work in Both)

```typescript
// Plugin supports both deployment modes
interface PluginManifest {
  name: 'quiz-editor'
  version: '1.0.0'
  
  modes: {
    web: {
      supported: true
      storage: 'cloud-api'      // Cloud: API + IndexedDB cache
      platform: 'browser'
    }
    desktop: {
      supported: true
      storage: 'sqlite'          // Desktop: SQLite
      platform: 'tauri'
    }
  }
  
  handles: [
    { type: 'question', can_read: true, can_write: true }
  ]
}
```

---

## Tech Stack Decisions

### Cloud Edition (MVP)

**Framework:**
- **Frontend**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui (Radix + Tailwind)
- **WYSIWYG**: Tiptap
- **State**: Zustand + Immer
- **Styling**: Tailwind CSS
- **TypeScript**: Strict mode

**Backend:**
- **API**: Next.js API Routes / Server Actions
- **Database**: Supabase (Postgres + Auth + Realtime)
- **Storage**: Cloudflare R2 (file uploads for future features)
- **Git Backend**: Simple-git (Node.js git library)
- **Queue**: Inngest or BullMQ (for background jobs)

**Authentication:**
- **Provider**: Supabase Auth
- **Methods**: Email/password, Google OAuth, GitHub OAuth
- **Free tier**: Anonymous projects (no auth required)

**Storage:**
- **Primary**: Postgres (projects, artifacts, links)
- **Cache**: IndexedDB (client-side for offline)
- **Git**: File system (git repos for versioning)

**Deployment:**
- **Frontend**: Vercel (free tier for MVP)
- **Database**: Supabase (free tier: 500MB DB)
- **Storage**: Cloudflare R2 (free tier: 10GB)
- **Domain**: app.idide.io

**Import/Export:**
- **CSV**: papaparse
- **Validation**: Zod

### Self-Hosted Edition (Phase 4)

**Desktop Apps:**
- **Framework**: Tauri 2.0 (Rust + WebView)
- **UI**: Same React components as cloud (code reuse!)
- **Storage**: SQLite (better-sqlite3)
- **Git**: libgit2 bindings

**Web Server (Optional):**
- **Container**: Docker
- **Framework**: Same Next.js app (subset of features)
- **Database**: SQLite or user's Postgres
- **Auth**: Self-managed (LDAP, OAuth, or simple)

---

## Data Model (Cloud Edition)

### Postgres Schema

```sql
-- Users (via Supabase Auth, extended with profiles)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  git_repo_path TEXT,  -- Path to git repo on disk
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project collaborators
CREATE TABLE project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,  -- 'owner', 'editor', 'reviewer', 'viewer'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Artifacts (semantic, plugin-agnostic)
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,           -- 'question', 'question-bank', 'learning-objective'
  schema_version TEXT NOT NULL, -- 'v1.0.0'
  data JSONB NOT NULL,          -- Type-specific data
  metadata JSONB NOT NULL,      -- created_by, created_at, modified_at
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Links between artifacts
CREATE TABLE artifact_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  source_id UUID NOT NULL,      -- artifact ID
  target_id UUID NOT NULL,      -- artifact ID
  relationship TEXT NOT NULL,   -- 'assesses', 'derived_from', 'contains'
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pull Requests (for collaboration)
CREATE TABLE pull_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  from_branch TEXT NOT NULL,
  to_branch TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL,         -- 'open', 'merged', 'closed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  merged_at TIMESTAMPTZ,
  merged_by UUID REFERENCES profiles(id)
);

-- PR Comments
CREATE TABLE pr_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_id UUID REFERENCES pull_requests(id) ON DELETE CASCADE,
  artifact_id UUID,             -- Optional: comment on specific artifact
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_artifacts_project_type ON artifacts(project_id, type);
CREATE INDEX idx_links_source ON artifact_links(source_id);
CREATE INDEX idx_links_target ON artifact_links(target_id);
CREATE INDEX idx_pr_project ON pull_requests(project_id);
CREATE INDEX idx_pr_comments ON pr_comments(pr_id);
```

### Row-Level Security (RLS)

```sql
-- Projects: Users can see projects they own or are collaborators on
CREATE POLICY "Users can view their projects"
ON projects FOR SELECT
USING (
  auth.uid() = owner_id
  OR EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_id = projects.id
    AND user_id = auth.uid()
  )
);

-- Artifacts: Inherit permissions from project
CREATE POLICY "Artifacts follow project permissions"
ON artifacts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = artifacts.project_id
    AND (
      auth.uid() = projects.owner_id
      OR EXISTS (
        SELECT 1 FROM project_collaborators
        WHERE project_id = projects.id
        AND user_id = auth.uid()
        AND role IN ('owner', 'editor')
      )
    )
  )
);

-- Similar policies for artifact_links, pull_requests, pr_comments
```

---

## Feature Prioritization & Roadmap

### Phase 1: Cloud Free Tier (MVP - 3 months) ← **START HERE**

**Goal**: "Try it now" validation - prove people will use it

**Features:**
- ✅ Web-based Quiz Editor (React + Next.js)
- ✅ Create/edit/delete projects (authenticated)
- ✅ Create/edit/delete question banks
- ✅ Add/edit/delete questions (MC, MR, T/F)
- ✅ WYSIWYG editing (Tiptap: bold, italic, lists, links)
- ✅ Custom feedback per question
- ✅ Storyline CSV import/export
- ✅ Undo/redo (client-side)
- ✅ Auto-save to cloud
- ✅ IndexedDB cache for offline work
- ✅ Anonymous projects (no auth required for free tier)
- ✅ User accounts (email/password, Google, GitHub)

**Storage:**
- Postgres (artifacts, projects, users)
- IndexedDB (client-side cache)
- Simple git backend (for future PRs)

**Deployment:**
- Frontend: Vercel
- Backend: Next.js API Routes
- Database: Supabase (free tier)

**Success Metrics:**
- 100 signups in first month
- 20% create a project
- 10% import Storyline CSV

**Pricing:**
- Free: 1 project, 100 questions, 2 collaborators
- No paid tier yet (validation first)

---

### Phase 2: Cloud Pro Tier (2 months)

**Goal**: Convert free users to paying customers

**Features:**
- ✅ Visual Graph Manager (web UI)
- ✅ PR workflow (create, review, merge)
- ✅ Visual diff viewer
- ✅ Conflict resolution UI
- ✅ User invites (email)
- ✅ Project settings (permissions)
- ✅ Activity feed (who changed what)

**New UI:**
- PR list page
- PR detail page with diff
- Conflict resolution modal
- Team management page

**Success Metrics:**
- 10% of free users upgrade to Pro
- $15/month per user
- Churn < 5% monthly

**Pricing:**
- Pro: $15/month - 10 projects, 1000 questions, 10 collaborators

---

### Phase 3: Quiz Review Plugin (2 months)

**Goal**: Solve SME feedback problem, upsell to teams

**Features:**
- ✅ Quiz Review web interface (web-only plugin)
- ✅ Anonymous review links (no login for SMEs)
- ✅ Comment on specific questions
- ✅ Approve/request changes workflow
- ✅ Email notifications
- ✅ Review history

**User Flow:**
1. ID creates quiz, commits to branch, creates PR
2. Graph Manager generates review link: `app.idide.io/review/{prId}`
3. ID shares link with SME via email
4. SME opens in browser, reviews questions, leaves comments
5. ID sees comments in PR, makes changes
6. SME re-reviews, approves
7. ID merges PR

**Success Metrics:**
- 30% of Pro users use Quiz Review
- Teams upgrade from Pro ($15) to Team ($49)

**Pricing:**
- Team: $49/month - Unlimited projects, 50 collaborators, Quiz Review

---

### Phase 4: Self-Hosted Edition (3 months)

**Goal**: Enterprise sales, complete data sovereignty

**Features:**
- ✅ Desktop Graph Manager (Tauri app)
- ✅ Desktop Quiz Editor (Tauri app)
- ✅ Local git integration (GitHub, GitLab, Bitbucket)
- ✅ SQLite storage (unlimited)
- ✅ Self-hosted web server (Docker) for Quiz Review
- ✅ License management
- ✅ Offline-first (no cloud dependency)

**Distribution:**
- macOS: .dmg installer
- Windows: .exe installer
- Linux: .AppImage
- Docker image for web server

**Success Metrics:**
- 5 enterprise deals in first 6 months
- $999 one-time OR $499/year per organization

**Pricing:**
- Personal: $299 one-time
- Team: $999 one-time OR $499/year
- Enterprise: Custom (SSO, SLA, support)

---

### Phase 5: Plugin Ecosystem (Ongoing)

**Goal**: Build IDIDE ecosystem

**Plugins to Build:**
- Objective Editor (create learning objectives)
- Gap Analysis (needs analysis from data)
- Content Builder (lesson pages)
- Simulation Builder (interactive scenarios)

**Plugin Marketplace:**
- Browse community plugins
- Install with one click
- Developer documentation
- Revenue share (80/20 split)

---

## Implementation Plan: Cloud-First, Desktop-Aware

### Design Principle: Write Once, Deploy Twice

**Code is shared** between cloud and desktop:
- Same React components
- Same business logic
- Same data models
- Different storage adapters (Postgres vs SQLite)
- Different deployment targets (Vercel vs Tauri)

### Phase 1: Cloud MVP (12 weeks)

#### Week 1-2: Foundation

**Setup:**
- [ ] Initialize Next.js project (App Router, TypeScript)
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Set up Supabase (Postgres + Auth)
- [ ] Create database schema (projects, artifacts, links)
- [ ] Set up RLS policies
- [ ] Deploy to Vercel (preview environment)

**Authentication:**
- [ ] Supabase Auth integration
- [ ] Email/password signup/login
- [ ] Google OAuth
- [ ] GitHub OAuth
- [ ] Anonymous mode (free tier, no account)

**File Structure:**
```
src/
├── app/                      # Next.js pages
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── projects/
│   │   └── [projectId]/
│   └── api/                  # API routes
├── components/
│   ├── ui/                   # shadcn primitives
│   ├── project/
│   ├── bank/
│   └── question/
├── lib/
│   ├── storage/
│   │   ├── interface.ts      # Storage adapter interface
│   │   ├── supabase.ts       # Cloud implementation
│   │   └── sqlite.ts         # Desktop implementation (future)
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
├── store/
│   └── app-store.ts          # Zustand
└── types/
    ├── artifact.ts
    └── database.ts
```

#### Week 3-4: Project Management

**Features:**
- [ ] Create project
- [ ] List projects (dashboard)
- [ ] Open project (shows banks)
- [ ] Delete project
- [ ] Project settings (name, description)

**UI:**
- [ ] Dashboard page (`/projects`)
- [ ] Project card component
- [ ] Create project modal
- [ ] Project settings page

**Storage:**
- [ ] Implement Supabase storage adapter
- [ ] Server Actions for project CRUD
- [ ] RLS policies testing

#### Week 5-6: Bank Management

**Features:**
- [ ] Create bank within project
- [ ] List banks in project
- [ ] Open bank (question editor)
- [ ] Delete bank
- [ ] Bank metadata (title, description)

**UI:**
- [ ] Bank list page (`/projects/[id]`)
- [ ] Bank card component
- [ ] Create bank modal

#### Week 7-9: Question Editor

**Features:**
- [ ] Install and configure Tiptap
- [ ] Question editor UI
- [ ] Add/edit/delete questions
- [ ] Question types: MC, MR, T/F
- [ ] Answers with rich text
- [ ] Feedback (correct/incorrect)
- [ ] Drag-to-reorder questions

**UI:**
- [ ] Bank editor page (`/projects/[id]/banks/[bankId]`)
- [ ] Question sidebar (list)
- [ ] Question editor panel
- [ ] Tiptap toolbar (bold, italic, lists, links)
- [ ] Answer list component
- [ ] Feedback editors

**State:**
- [ ] Zustand store with Immer
- [ ] Undo/redo stack
- [ ] Auto-save (debounced)

#### Week 10-11: Import/Export

**Features:**
- [ ] Import Storyline CSV
- [ ] Export to Storyline CSV
- [ ] Validate imported data (Zod)
- [ ] Handle edge cases (missing columns, invalid data)
- [ ] Export project as JSON (backup)

**UI:**
- [ ] Import modal with file picker
- [ ] Export button with format selection
- [ ] Progress indicators
- [ ] Error messages

**Implementation:**
- [ ] papaparse for CSV parsing
- [ ] Zod schemas for validation
- [ ] Conversion functions (Storyline ↔ artifacts)

#### Week 12: Polish & Launch

**Features:**
- [ ] Responsive design (desktop + tablet)
- [ ] Loading states
- [ ] Error handling (toast notifications)
- [ ] Empty states
- [ ] Keyboard shortcuts (Cmd+Z, Cmd+S)
- [ ] Help documentation (tooltips)
- [ ] Onboarding flow (first-time users)

**Testing:**
- [ ] Manual testing with real Storyline files
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile/tablet testing
- [ ] Performance testing (100+ questions)

**Deployment:**
- [ ] Production deployment to Vercel
- [ ] Custom domain (app.idide.io)
- [ ] SSL certificate
- [ ] Analytics (Plausible or Simple Analytics)
- [ ] Error tracking (Sentry)

**Launch:**
- [ ] Marketing site (idide.io)
- [ ] Demo video
- [ ] Launch on Product Hunt
- [ ] Share on Twitter, LinkedIn, ID communities

---

### Phase 2-5: Implementation Plans (Detailed Later)

Phase 2-5 plans will be fleshed out after Phase 1 validates the market.

---

## Artifact Structure (Universal)

```typescript
// Universal artifact (works in cloud and desktop)
interface Artifact {
  id: string              // 'artifact:uuid'
  type: string            // 'question', 'question-bank', 'learning-objective'
  schema_version: string  // 'v1.0.0'
  
  metadata: {
    created_by: string    // User ID
    created_at: string    // ISO timestamp
    modified_at: string
  }
  
  data: any  // Type-specific data (validated by schema)
}

// Question artifact
interface QuestionArtifact extends Artifact {
  type: 'question'
  data: {
    question_type: 'multiple_choice' | 'multiple_response' | 'true_false'
    prompt: TiptapJSON
    answers: Answer[]
    feedback: {
      correct: TiptapJSON
      incorrect: TiptapJSON
    }
    settings: {
      points?: number
      attempts?: number
      randomize?: boolean
    }
  }
}

// Question bank artifact
interface BankArtifact extends Artifact {
  type: 'question-bank'
  data: {
    title: string
    description?: string
    question_ids: string[]  // References to question artifacts
    settings: {
      passing_grade?: number
      attempts_allowed?: number
    }
  }
}
```

---

## Storage Adapter Pattern (Desktop-Aware)

```typescript
// Storage interface (universal)
interface StorageAdapter {
  // Projects
  getProjects(): Promise<Project[]>
  getProject(id: string): Promise<Project>
  saveProject(project: Project): Promise<void>
  deleteProject(id: string): Promise<void>
  
  // Artifacts
  getArtifacts(projectId: string, type?: string): Promise<Artifact[]>
  getArtifact(id: string): Promise<Artifact>
  saveArtifact(artifact: Artifact): Promise<void>
  deleteArtifact(id: string): Promise<void>
  
  // Links
  getLinks(projectId: string): Promise<Link[]>
  saveLink(link: Link): Promise<void>
}

// Cloud implementation (Phase 1)
class SupabaseStorage implements StorageAdapter {
  async getProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })
    return data
  }
  
  async saveArtifact(artifact: Artifact) {
    await supabase.from('artifacts').upsert({
      id: artifact.id,
      project_id: artifact.project_id,
      type: artifact.type,
      schema_version: artifact.schema_version,
      data: artifact.data,
      metadata: artifact.metadata
    })
  }
  
  // ... other methods
}

// Desktop implementation (Phase 4)
class SQLiteStorage implements StorageAdapter {
  private db: Database
  
  async getProjects() {
    return this.db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all()
  }
  
  async saveArtifact(artifact: Artifact) {
    this.db.prepare(`
      INSERT OR REPLACE INTO artifacts (id, project_id, type, schema_version, data, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      artifact.id,
      artifact.project_id,
      artifact.type,
      artifact.schema_version,
      JSON.stringify(artifact.data),
      JSON.stringify(artifact.metadata)
    )
  }
  
  // ... other methods
}

// Factory (environment-aware)
class StorageFactory {
  static create(): StorageAdapter {
    if (isDesktopEnvironment()) {
      return new SQLiteStorage()
    } else {
      return new SupabaseStorage()
    }
  }
}
```

---

## Business Model

### Cloud Edition Pricing

**Free Tier:**
- 1 project
- 100 questions
- 2 collaborators
- Community support

**Pro Tier: $15/month**
- 10 projects
- 1,000 questions per project
- 10 collaborators
- Email support
- Priority features

**Team Tier: $49/month**
- Unlimited projects
- Unlimited questions
- 50 collaborators
- Quiz Review plugin
- Priority support
- Usage analytics

**Enterprise: Custom**
- SSO (SAML, OIDC)
- SLA (99.9% uptime)
- Dedicated support
- On-premise option
- Custom integrations

### Self-Hosted Edition Pricing

**Personal: $299 one-time**
- 1 user
- Unlimited projects
- Desktop apps
- Community support

**Team: $999 one-time OR $499/year**
- Up to 25 users
- Unlimited projects
- Desktop apps
- Self-hosted web server
- Email support

**Enterprise: Custom**
- Unlimited users
- SSO integration
- Priority support
- Custom development
- Training/onboarding

### Revenue Projections

**Year 1 (Cloud Only):**
- 1,000 free users
- 100 Pro users ($15/mo) = $18K/year
- 10 Team users ($49/mo) = $5.9K/year
- **Total: ~$24K/year**

**Year 2 (Cloud + Self-Hosted):**
- 5,000 free users
- 500 Pro users = $90K/year
- 50 Team users = $29.4K/year
- 5 Enterprise deals = $50K/year
- 3 Self-Hosted Team licenses = $3K
- **Total: ~$172K/year**

**Year 3 (Ecosystem Growth):**
- 20,000 free users
- 2,000 Pro users = $360K/year
- 200 Team users = $117.6K/year
- 20 Enterprise deals = $200K/year
- 10 Self-Hosted licenses = $10K
- Plugin marketplace revenue = $50K/year
- **Total: ~$738K/year**

---

## Success Criteria

### Phase 1 Launch Criteria (Cloud MVP)

- ✅ Can create account and project
- ✅ Can add 3+ question types (MC, MR, T/F)
- ✅ WYSIWYG editing works (Tiptap)
- ✅ Import Storyline CSV → questions appear correctly
- ✅ Export questions → imports into Storyline 360 successfully
- ✅ Undo/redo works for edits
- ✅ Auto-save prevents data loss
- ✅ Works on desktop browsers (Chrome, Safari, Firefox)
- ✅ Responsive on tablet (iPad)
- ✅ No critical bugs in happy path
- ✅ Page load < 2s
- ✅ Deployed to app.idide.io

### Phase 1 Validation Metrics

**Month 1:**
- 100 signups
- 20 active projects created
- 10 Storyline imports

**Month 3:**
- 500 signups
- 100 active users (used in last 7 days)
- 50 projects with 10+ questions
- 5% ask about paid tier

**If metrics hit:** Proceed to Phase 2
**If metrics miss:** Pivot or iterate on value prop

---

## References

### Documentation

- Storyline Import: https://www.articulatesupport.com/article/Storyline-360-Importing-Questions-from-Excel-Spreadsheets-and-Text-Files
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tiptap: https://tiptap.dev/docs
- shadcn/ui: https://ui.shadcn.com
- Zustand: https://zustand-demo.pmnd.rs
- Tauri (Phase 4): https://tauri.app/

---

## Notes for Claude Code

### When Starting Implementation

1. **Read this entire file first** to understand dual deployment strategy
2. **Check SESSION.md** for current state and next steps
3. **Focus on Phase 1** (cloud MVP) - desktop comes later
4. **Follow implementation plan** week by week
5. **Write desktop-aware code** (use storage adapter pattern)

### Code Style

- **TypeScript strict mode** (no `any` types)
- **Functional components** (React hooks, no classes)
- **Server Actions** for mutations (Next.js App Router)
- **Tailwind** for styling (no custom CSS unless necessary)
- **Zod** for validation
- **Conventional commits** (`feat:`, `fix:`, `refactor:`)

### Testing Strategy

- **Manual testing** for MVP (no automated tests yet)
- **Test imports** with actual Storyline CSV files
- **Test exports** by importing into Storyline 360
- **Cross-browser** (Chrome, Safari, Firefox)
- **Mobile/tablet** (iPad primarily)

---

**End of PROJECT_CONTEXT.md**

This file should be updated as the project evolves.
