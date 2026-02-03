# Quiz Editor Project Context

**Generated**: 2025-02-03  
**Purpose**: Context document for Claude Code implementation  
**Status**: Pre-implementation (planning phase complete)

---

## Project Overview

### What We're Building

A web-based quiz editor for instructional designers that:

- Creates and manages question banks
- Imports/exports questions compatible with Articulate Storyline 360
- Supports collaborative editing (future: real-time)
- Provides WYSIWYG editing for questions and feedback
- Enables sharing via anonymous links

### Target Users

- Instructional designers
- Learning engineers
- Course developers
- Anyone creating quizzes for Storyline 360

### Key Differentiators

- Direct Storyline 360 integration (import/export Excel/CSV format)
- Lightweight and accessible (no complex authentication for MVP)
- Built for eventual real-time collaboration
- Flexible question schema (easy to add new question types)

---

## Tech Stack Decisions

### Frontend

- **Framework**: Next.js 14+ (App Router)
    - Rationale: SSR/CSR hybrid, built-in API routes, easy Vercel deployment
- **UI Components**: shadcn/ui (Radix + Tailwind)
    - Rationale: Free, accessible, customizable, no runtime cost
- **WYSIWYG Editor**: Tiptap
    - Rationale: Extensible, ProseMirror-based, works with Yjs for future real-time
    - MVP constraints: Basic formatting only (bold, italic, lists, links)
- **State Management**: Zustand + Immer
    - Rationale: Lightweight, easy undo/redo implementation
- **Styling**: Tailwind CSS
    - Rationale: Designer is familiar, fast iteration, good with shadcn

### Backend

- **API**: Next.js App Router Server Actions
- **Database**: Supabase (Postgres + Realtime + Auth)
    - Rationale: Free tier is generous, RLS for permissions, built-in auth and realtime
    - Free tier: 500MB DB, 2GB bandwidth, 50K MAU
- **Authentication**: Supabase Auth
    - MVP: Optional (allow anonymous banks)
    - Almost Essential: Email/password, magic links
- **Storage**: Supabase Storage (for future image uploads)

### Import/Export

- **CSV Parsing**: papaparse
    - Rationale: Battle-tested, handles Storyline's format
- **Validation**: Zod
    - Rationale: TypeScript-first, clear error messages
- **Format**: Storyline 360 Excel/Text import format
    - Reference: https://www.articulatesupport.com/article/Storyline-360-Importing-Questions-from-Excel-Spreadsheets-and-Text-Files

### Deployment

- **Hosting**: Vercel
    - Rationale: Optimized for Next.js, generous free tier, zero-config
- **Database**: Supabase Cloud
- **Domain**: TBD (Cloudflare DNS)

### Deferred Technologies

- **Real-time collaboration**: Yjs + y-websocket (Near-Future phase)
- **Advanced drag-and-drop**: react-dnd or dnd-kit (Future phase)

---

## Database Schema

### Core Tables

```sql
-- Users (via Supabase Auth, extended with profiles)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question Banks
CREATE TABLE banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- null = anonymous
  share_token UUID UNIQUE DEFAULT gen_random_uuid(), -- for "anyone with link"
  settings JSONB DEFAULT '{}', -- passing grade, attempts, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions (flat for MVP, add group_id later)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID REFERENCES banks(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'multiple_choice', 'multiple_response', 'true_false', 'fill_in_blank'
  prompt JSONB NOT NULL, -- Tiptap JSON for rich text
  answers JSONB NOT NULL, -- array of {text: Tiptap JSON, correct: boolean}
  feedback JSONB DEFAULT '{}', -- {correct: Tiptap JSON, incorrect: Tiptap JSON}
  settings JSONB DEFAULT '{}', -- points, attempts, randomize, etc.
  position INTEGER NOT NULL, -- for ordering within bank
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Snapshots (for undo/history)
CREATE TABLE bank_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID REFERENCES banks(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL, -- full bank state (questions, settings, etc.)
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shares (for future role-based permissions)
CREATE TABLE bank_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID REFERENCES banks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer', -- 'viewer', 'editor', 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bank_id, user_id)
);

-- Indexes
CREATE INDEX idx_questions_bank_id ON questions(bank_id);
CREATE INDEX idx_questions_position ON questions(bank_id, position);
CREATE INDEX idx_snapshots_bank_id ON bank_snapshots(bank_id, created_at DESC);
```

### Row-Level Security (RLS) Policies

```sql
-- Banks: Anyone can view if they have share_token
CREATE POLICY "Anyone can view shared banks"
ON banks FOR SELECT
USING (share_token IS NOT NULL OR auth.uid() = owner_id);

-- Banks: Only owner can update/delete (anonymous banks have no owner)
CREATE POLICY "Only owner can update banks"
ON banks FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Only owner can delete banks"
ON banks FOR DELETE
USING (auth.uid() = owner_id);

-- Questions: Inherit permissions from bank
CREATE POLICY "Questions follow bank permissions"
ON questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM banks
    WHERE banks.id = questions.bank_id
    AND (banks.share_token IS NOT NULL OR banks.owner_id = auth.uid())
  )
);

-- Snapshots: Read-only for bank viewers
CREATE POLICY "Snapshots follow bank permissions"
ON bank_snapshots FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM banks
    WHERE banks.id = bank_snapshots.bank_id
    AND (banks.share_token IS NOT NULL OR banks.owner_id = auth.uid())
  )
);
```

---

## Architecture Decisions

### Table-Based vs. File-Based Storage

**Decision**: Use Postgres tables (not files)
**Rationale**:

- Need querying/filtering for search (future feature)
- Real-time subscriptions for collaboration (near-future)
- RLS for permissions (MVP requirement)
- Atomic updates for concurrency (MVP requirement)
- Banks are small (<10MB), well within JSONB limits

**Migration Path**: If banks exceed 10K questions, move to hybrid (metadata in tables, content in files).

### Versioning Strategy

**Decision**: Snapshot-based undo (MVP) → Event sourcing (future)

**MVP Implementation**:

- Client-side undo/redo: Zustand + Immer
- Server-side snapshots: Full bank state saved on explicit save or auto-save
- Pessimistic locking: One editor at a time (prevent concurrent edits)

**Future Migration**:

- Replace snapshots with action logs (event sourcing)
- Enable fine-grained history ("who changed what when")
- Add real-time CRDTs (Yjs) for Google Docs–style collaboration

### Authentication Strategy

**Decision**: Hybrid (anonymous MVP → optional login)

**MVP**:

- No login required to create banks
- Banks created with `owner_id = NULL`
- Share via UUID token (e.g., `/banks/share/abc-123`)
- Risk: Spam/abuse (mitigated by rate limiting)

**Almost Essential**:

- Add Supabase Auth (email/password, magic links)
- Users can "claim" anonymous banks
- Logged-in users get persistent access, edit history

### Real-Time Collaboration Path

**Decision**: Pessimistic locking (MVP) → Optimistic updates → CRDTs

**Phase 1 (MVP)**: Single editor at a time

- Lock bank on open, release on close
- Show "Someone else is editing" message

**Phase 2 (Almost Essential)**: Async collaboration

- Multiple users can edit, warn on save if bank changed
- Show diff, manual merge

**Phase 3 (Near-Future)**: Real-time with Yjs

- Live cursors, immediate sync
- Requires WebSocket server (self-hosted or Liveblocks)

---

## Storyline Import/Export Format

### Import Format (Excel/CSV)

Based on: https://www.articulatesupport.com/article/Storyline-360-Importing-Questions-from-Excel-Spreadsheets-and-Text-Files

**Required Columns**:

- `Type`: "Multiple Choice", "Multiple Response", "True/False", "Fill In the Blank"
- `Question`: Question text (plain text or basic HTML)
- `Answer1`, `Answer2`, `Answer3`, `Answer4`: Answer options
- `CorrectAnswer`: "1", "2", "3", "4" (or "1,3" for Multiple Response)
- `CorrectFeedback`: Message shown when correct
- `IncorrectFeedback`: Message shown when incorrect

**Example CSV**:

```csv
Type,Question,Answer1,Answer2,Answer3,Answer4,CorrectAnswer,CorrectFeedback,IncorrectFeedback
Multiple Choice,What is 2+2?,3,4,5,6,2,Correct!,Try again.
True/False,The sky is blue.,True,False,,,1,Yes!,No.
```

### Export Format (CSV)

Generate CSV matching above structure from internal question format.

**Conversion Rules**:

- Tiptap JSON → Plain text (strip formatting for MVP)
- Future: Convert to Storyline-compatible HTML subset
- Warn user about stripped formatting (future feature)

### Import/Export Implementation

```typescript
// Import
async function importStorylineCSV(file: File): Promise<Question[]> {
    const text = await file.text();
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });

    return data.map((row) => ({
        type: mapStorylineType(row.Type),
        prompt: textToTiptap(row.Question),
        answers: extractAnswers(row),
        feedback: {
            correct: textToTiptap(row.CorrectFeedback),
            incorrect: textToTiptap(row.IncorrectFeedback),
        },
    }));
}

// Export
function exportToStorylineCSV(bank: Bank): Blob {
    const rows = bank.questions.map((q) => ({
        Type: mapTypeToStoryline(q.type),
        Question: tiptapToText(q.prompt),
        Answer1: tiptapToText(q.answers[0]?.text),
        Answer2: tiptapToText(q.answers[1]?.text),
        Answer3: tiptapToText(q.answers[2]?.text),
        Answer4: tiptapToText(q.answers[3]?.text),
        CorrectAnswer: getCorrectAnswerNumbers(q.answers),
        CorrectFeedback: tiptapToText(q.feedback.correct),
        IncorrectFeedback: tiptapToText(q.feedback.incorrect),
    }));

    const csv = Papa.unparse(rows);
    return new Blob([csv], { type: 'text/csv' });
}
```

---

## Feature Prioritization

### MVP (Must-Have for Launch)

- ✅ Create/view/edit/delete banks (anonymous, no login required)
- ✅ Add/edit/delete questions within a bank
- ✅ Question types: Multiple Choice, Multiple Response, True/False
- ✅ Basic WYSIWYG (bold, italic, lists via Tiptap)
- ✅ Custom feedback per question
- ✅ Import Storyline CSV/Excel
- ✅ Export to Storyline CSV
- ✅ Share via UUID link (read-only or editable)
- ✅ Client-side undo/redo (Zustand + Immer)
- ✅ Auto-save + snapshot history
- ✅ Pessimistic locking (one editor at a time)

### Almost Essential (Next Phase)

- ⏳ User accounts with Supabase Auth (email/password, magic links)
- ⏳ Claim anonymous banks after login
- ⏳ Manage sharing with logged-in users
- ⏳ Additional question type: Fill in the Blank
- ⏳ Bank settings (passing grade, attempts allowed)
- ⏳ Question settings (points, attempts, randomize answers)
- ⏳ Async collaboration with conflict detection

### Near-Future (Post-Launch)

- 🔮 Real-time collaboration (Yjs + live cursors)
- 🔮 Question groups within banks
- 🔮 Additional question types (drag-and-drop, matching)
- 🔮 Comments/discussions at bank/question level
- 🔮 Editing history (per-user, fine-grained)
- 🔮 Tags, search, filters
- 🔮 Question templates and feedback presets

### Future (Long-Term)

- 🔮 Bulk actions (duplicate, delete multiple)
- 🔮 Analytics (usage tracking, popular questions)
- 🔮 Additional export formats (Moodle, Blackboard)
- 🔮 AI writing assistance
- 🔮 Accessibility checks (alt text, contrast)
- 🔮 Advanced drag-and-drop authoring

---

## Component Architecture

### Page Structure

```
/                         → Landing page (public)
/banks                    → Bank list (anonymous or user's banks)
/banks/new                → Create new bank
/banks/[id]               → View bank (read-only)
/banks/[id]/edit          → Edit bank (question editor)
/banks/share/[token]      → Shared bank view (via UUID link)
```

### Component Hierarchy

```
App
├── Layout
│   ├── Header (title, user menu)
│   └── Main (page content)
│
├── BankListPage
│   ├── BankCard (title, question count, last edited)
│   └── CreateBankButton
│
├── BankViewPage
│   ├── BankHeader (title, description, actions)
│   ├── QuestionList (read-only)
│   └── ExportButton
│
└── BankEditPage
    ├── BankHeader (title, description, save status)
    ├── QuestionSidebar
    │   ├── QuestionListItem (draggable, shows type/prompt)
    │   └── AddQuestionButton
    ├── QuestionEditor
    │   ├── TypeSelector (dropdown)
    │   ├── PromptEditor (Tiptap)
    │   ├── AnswerList
    │   │   ├── AnswerEditor (Tiptap, checkbox for correct)
    │   │   └── AddAnswerButton
    │   └── FeedbackEditor
    │       ├── CorrectFeedbackEditor (Tiptap)
    │       └── IncorrectFeedbackEditor (Tiptap)
    └── Toolbar
        ├── UndoButton
        ├── RedoButton
        ├── ImportButton
        └── ShareButton
```

### State Management

```typescript
// Zustand store for bank editing
interface BankStore {
    bank: Bank | null;
    selectedQuestionId: string | null;
    history: string[]; // Serialized snapshots for undo/redo
    historyIndex: number;

    // Actions
    loadBank: (bank: Bank) => void;
    selectQuestion: (id: string) => void;
    updateQuestion: (id: string, updates: Partial<Question>) => void;
    addQuestion: (question: Question) => void;
    deleteQuestion: (id: string) => void;
    reorderQuestions: (fromIndex: number, toIndex: number) => void;
    undo: () => void;
    redo: () => void;
    save: () => Promise<void>;
}
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1-2)

- [ ] Set up Next.js project with App Router
- [ ] Configure Tailwind + shadcn/ui
- [ ] Set up Supabase client + environment variables
- [ ] Run database migrations (create tables)
- [ ] Set up RLS policies
- [ ] Create basic routing structure
- [ ] Build Layout component (header, nav)

### Phase 2: Bank Management (Week 2-3)

- [ ] BankListPage (create, list, view)
- [ ] Server Actions for bank CRUD
- [ ] BankViewPage (read-only display)
- [ ] BankCard component
- [ ] Anonymous bank creation (no auth)

### Phase 3: Question Editor (Week 3-5)

- [ ] Install Tiptap + configure extensions
- [ ] Build Tiptap toolbar (minimal formatting)
- [ ] QuestionEditor component
- [ ] PromptEditor (Tiptap instance)
- [ ] AnswerList + AnswerEditor
- [ ] FeedbackEditor (correct/incorrect)
- [ ] TypeSelector (dropdown for question types)

### Phase 4: State Management (Week 5-6)

- [ ] Set up Zustand store
- [ ] Integrate Immer for immutable updates
- [ ] Implement undo/redo
- [ ] Add auto-save (debounced, every 30s)
- [ ] Server Action for saving snapshots
- [ ] QuestionSidebar with selection state

### Phase 5: Import/Export (Week 6-7)

- [ ] Install papaparse + Zod
- [ ] Build CSV parser (Storyline format)
- [ ] Validate imported data (Zod schemas)
- [ ] ImportModal component
- [ ] Export function (bank → CSV)
- [ ] Download button (trigger file download)

### Phase 6: Sharing (Week 7)

- [ ] Generate UUID share links
- [ ] ShareModal component (copy link)
- [ ] Shared bank view (via token)
- [ ] Pessimistic locking (edit mode)
- [ ] Rate limiting (Vercel middleware)

### Phase 7: Polish (Week 8)

- [ ] Responsive design (mobile-friendly)
- [ ] Loading states (skeleton screens)
- [ ] Error handling (toast notifications)
- [ ] Empty states (no banks, no questions)
- [ ] Keyboard shortcuts (Cmd+Z, Cmd+S)
- [ ] Accessibility audit (ARIA labels, focus management)

---

## Data Type Definitions

### TypeScript Types

```typescript
// Question Types
type QuestionType =
    | 'multiple_choice'
    | 'multiple_response'
    | 'true_false'
    | 'fill_in_blank';

// Tiptap JSON structure (simplified)
interface TiptapJSON {
    type: 'doc';
    content: Array<{
        type: string; // 'paragraph', 'heading', 'bulletList', etc.
        content?: Array<{
            type: string; // 'text', 'hardBreak', etc.
            text?: string;
            marks?: Array<{ type: string }>; // 'bold', 'italic', etc.
        }>;
    }>;
}

// Core domain types
interface Bank {
    id: string;
    title: string;
    description: string | null;
    owner_id: string | null;
    share_token: string;
    settings: {
        passing_grade?: number;
        attempts_allowed?: number;
    };
    created_at: string;
    updated_at: string;
}

interface Question {
    id: string;
    bank_id: string;
    type: QuestionType;
    prompt: TiptapJSON;
    answers: Answer[];
    feedback: {
        correct: TiptapJSON;
        incorrect: TiptapJSON;
    };
    settings: {
        points?: number;
        attempts?: number;
        randomize?: boolean;
    };
    position: number;
    created_at: string;
    updated_at: string;
}

interface Answer {
    text: TiptapJSON;
    correct: boolean;
}

interface BankSnapshot {
    id: string;
    bank_id: string;
    snapshot: {
        bank: Bank;
        questions: Question[];
    };
    created_by: string | null;
    created_at: string;
}
```

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Project Constraints & Considerations

### Cost Constraints

- **Must stay within free tiers** (personal project, no funding)
- Supabase free: 500MB DB, 2GB bandwidth
- Vercel free: 100GB bandwidth, serverless functions
- If exceeds: ~$45/mo combined (Supabase Pro + Vercel Pro)

### Time Constraints

- Part-time development (evenings/weekends)
- Target: MVP in 8-10 weeks
- Prioritize working features over polish

### Technical Constraints

- **No real-time collaboration in MVP** (too complex)
- **Basic WYSIWYG only** (plain text export to Storyline)
- **Limited question types** (defer drag-and-drop)
- **Pessimistic locking** (avoid concurrent edit conflicts)

### Risk Factors

- **Abuse (spam banks)**: Mitigate with rate limiting, CAPTCHA if needed
- **Storyline format changes**: Test imports regularly, version export format
- **Scope creep**: Strict MVP feature freeze, defer everything else

---

## Success Criteria

### MVP Launch Criteria

- ✅ Can create bank anonymously
- ✅ Can add 3+ question types (MC, MR, T/F)
- ✅ WYSIWYG editing works (Tiptap)
- ✅ Import Storyline CSV → questions appear correctly
- ✅ Export questions → imports into Storyline 360 successfully
- ✅ Share link works (others can view/edit)
- ✅ Undo/redo works for basic edits
- ✅ Auto-save prevents data loss
- ✅ Responsive on desktop + tablet
- ✅ No critical bugs in happy path

### Definition of Done (Per Feature)

- ✅ Code committed to Git
- ✅ TypeScript compiles (no errors)
- ✅ Component renders without console errors
- ✅ Manual testing passes (happy path)
- ✅ Session notes updated (CLAUDE.md, SESSION.md)

---

## References

### Documentation

- Storyline Import: https://www.articulatesupport.com/article/Storyline-360-Importing-Questions-from-Excel-Spreadsheets-and-Text-Files
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tiptap: https://tiptap.dev/docs
- shadcn/ui: https://ui.shadcn.com
- Zustand: https://zustand-demo.pmnd.rs

### Design Patterns

- Component composition (shadcn approach)
- Server Actions for mutations (Next.js App Router)
- Optimistic UI updates (Zustand)
- Immutable state with Immer

---

## Notes for Claude Code

### When Starting Implementation

1. **Read this entire file first** to understand context
2. **Follow the Implementation Plan phases** sequentially
3. **Refer to Component Architecture** for structure
4. **Use TypeScript types** defined above
5. **Follow established patterns** (shadcn components, Server Actions)

### Code Style Preferences

- **TypeScript strict mode** (no `any` types)
- **Functional components** (React hooks, no classes)
- **Server Actions** for mutations (not API routes)
- **Tailwind** for styling (no custom CSS unless necessary)
- **Zod** for validation (API inputs, import data)

### Git Workflow

- **Commit frequently** (after each feature/fix)
- **Use conventional commits** (`feat:`, `fix:`, `refactor:`)
- **Branch per phase** (`phase-1-foundation`, `phase-2-banks`, etc.)

### Testing Strategy

- **Manual testing** for MVP (no automated tests yet)
- **Test imports** with actual Storyline CSV files
- **Test exports** by importing into Storyline 360

### When Stuck

- **Re-read this file** (context might clarify)
- **Check references** (docs for libraries)
- **Ask clarifying questions** (don't guess)

---

## Open Questions (To Resolve)

1. **Drag-and-drop for question reordering**: Use react-dnd, dnd-kit, or native HTML5?
2. **Image uploads**: Defer to post-MVP, or include basic support?
3. **Keyboard shortcuts**: Which ones are essential? (Cmd+S, Cmd+Z, others?)
4. **Mobile editing**: Full editor on mobile, or view-only?
5. **Analytics**: Track usage stats (page views, exports), or skip for privacy?

---

## Change Log

- **2025-02-03**: Initial document created (planning phase complete)
- Future updates: Add migration notes, architectural changes, lessons learned

---

**End of Context Document**

This file should be updated as the project evolves. Refer back to it when starting new phases or making architectural decisions.
