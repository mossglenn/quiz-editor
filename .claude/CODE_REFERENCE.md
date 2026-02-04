# Code Session Quick Reference

**Project**: Quiz Editor  
**Location**: `/Users/amosglenn/Dev/quiz-editor`  
**Last Updated**: 2025-02-04 (Major Architecture Revision)

---

## Starting a Code Session

### 1. Read Context Files First

```bash
Read .claude/PROJECT_CONTEXT.md and .claude/SESSION.md to understand the project.
```

**What you'll find**:

- **PROJECT_CONTEXT.md**: Full architecture, data model, implementation plan, hub-plugin design
- **SESSION.md**: Current state, what's done, what's next, recent decisions, architecture summary

### 2. Check Current Phase

Look at SESSION.md → "Current State" → "What's Next" to see what to build.

**Current phase**: Phase 1 pending (waiting on platform decision: desktop vs web)

### 3. Start Building

Ask Code to help implement the next item from implementation plan.

---

## Tech Stack (Revised 2025-02-04)

### Core Framework

- **Platform**: Desktop (Tauri/Electron) OR Web (Next.js) - **DECISION PENDING**
- **UI Library**: React + TypeScript (strict mode)
- **UI Components**: shadcn/ui (Radix + Tailwind)
- **Styling**: Tailwind CSS
- **WYSIWYG**: Tiptap (with minimal extensions: bold, italic, lists, links)
- **State**: Zustand + Immer
- **Import/Export**: papaparse (CSV), Zod (validation)

### Storage (CHANGED FROM ORIGINAL)

- **Desktop Option**: SQLite (better-sqlite3)
- **Web Option**: IndexedDB (idb library)
- **NO Supabase** (local storage only for MVP)
- **NO Authentication** (not needed for local app)

### Key Libraries

```json
{
    "dependencies": {
        "react": "^18.x",
        "zustand": "^4.x",
        "immer": "^10.x",
        "@tiptap/react": "^2.x",
        "@tiptap/starter-kit": "^2.x",
        "papaparse": "^5.x",
        "zod": "^3.x",
        "lodash-es": "^4.x",
        // If desktop (SQLite):
        "better-sqlite3": "^9.x",
        // If web (IndexedDB):
        "idb": "^8.x"
    }
}
```

### Development Commands

```bash
# Development (depends on platform choice)
npm run dev              # Start dev server
npm run build            # Build for production
npm run type-check       # Check TypeScript errors
npm run lint             # Run ESLint

# Git
git status               # Check what's changed
git add .                # Stage all changes
git commit -m "..."      # Commit with message
git log --oneline        # See recent commits
```

---

## File Structure (Updated)

```
quiz-editor/
├── .claude/                    # AI context & workflows
│   ├── PROJECT_CONTEXT.md      # Full project context
│   ├── SESSION.md              # Work log
│   ├── CLAUDE.md               # Patterns & decisions
│   └── CODE_REFERENCE.md       # This file
├── src/
│   ├── app/                    # Pages (if Next.js)
│   │   ├── page.tsx            # Project list
│   │   ├── [projectId]/
│   │   │   └── page.tsx        # Bank list
│   │   └── [projectId]/[bankId]/
│   │       └── page.tsx        # Bank editor
│   ├── components/
│   │   ├── ui/                 # shadcn primitives
│   │   ├── project/            # Project components
│   │   ├── bank/               # Bank components
│   │   └── question/           # Question components
│   ├── lib/
│   │   ├── storage/            # Storage adapters
│   │   │   ├── interface.ts    # StorageAdapter interface
│   │   │   ├── sqlite.ts       # SQLite impl (desktop)
│   │   │   └── indexeddb.ts    # IndexedDB impl (web)
│   │   ├── import-export/      # Storyline conversion
│   │   │   ├── import.ts
│   │   │   └── export.ts
│   │   ├── utils.ts            # Utilities
│   │   └── validations.ts      # Zod schemas
│   ├── store/
│   │   └── app-store.ts        # Zustand store
│   └── types/
│       ├── artifact.ts         # Artifact types
│       ├── question.ts         # Question types
│       └── plugin.ts           # Plugin manifest
├── .env.local                  # Environment variables (if needed)
└── package.json
```

---

## Core Data Types (NEW ARCHITECTURE)

### Artifact (Plugin-Agnostic Format)

```typescript
// Universal artifact structure
interface Artifact {
    id: string; // 'artifact:uuid' (no tool prefix!)
    type: string; // 'question', 'question-bank'
    schema_version: string; // 'v1.0.0'

    metadata: {
        created_by: string;
        created_at: string; // ISO timestamp
        modified_at: string;
    };

    data: any; // Type-specific data
}

// Question artifact
interface QuestionArtifact extends Artifact {
    type: 'question';
    data: {
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
    };
}

// Bank artifact
interface BankArtifact extends Artifact {
    type: 'question-bank';
    data: {
        title: string;
        description?: string;
        question_ids: string[]; // References to question artifacts
        settings: {
            passing_grade?: number;
            attempts_allowed?: number;
        };
    };
}
```

### Answer & Tiptap Types

```typescript
interface Answer {
    text: TiptapJSON; // Rich text
    correct: boolean; // True if correct answer
}

interface TiptapJSON {
    type: 'doc';
    content: Array<{
        type: string; // 'paragraph', 'heading', 'bulletList'
        content?: Array<{
            type: string; // 'text', 'hardBreak'
            text?: string;
            marks?: Array<{ type: string }>; // 'bold', 'italic'
        }>;
    }>;
}
```

### Storage Interface

```typescript
// Storage adapter (abstracts SQLite vs IndexedDB)
interface StorageAdapter {
    // Projects
    getProjects(): Promise<Project[]>;
    getProject(id: string): Promise<Project>;
    saveProject(project: Project): Promise<void>;
    deleteProject(id: string): Promise<void>;

    // Artifacts
    getArtifacts(projectId: string, type?: string): Promise<Artifact[]>;
    getArtifact(id: string): Promise<Artifact>;
    saveArtifact(artifact: Artifact): Promise<void>;
    deleteArtifact(id: string): Promise<void>;

    // Links (for future)
    getLinks(projectId: string): Promise<Link[]>;
    saveLink(link: Link): Promise<void>;
}
```

---

## Coding Conventions (Updated)

### TypeScript

```typescript
// ✅ Good (strict, typed)
interface Question {
    id: string;
    prompt: TiptapJSON;
    answers: Answer[];
}

function updateQuestion(id: string, updates: Partial<Question>): void {
    // Implementation
}

// ❌ Bad (any types)
function updateQuestion(id: any, updates: any) {
    // Don't do this
}
```

### React Components

```typescript
// ✅ Good (functional, typed props)
interface QuestionEditorProps {
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
}

export function QuestionEditor({ question, onUpdate }: QuestionEditorProps) {
    const [localPrompt, setLocalPrompt] = useState(question.prompt);

    return <div>...</div>;
}
```

### Storage Usage

```typescript
// ✅ Good (abstracted)
async function saveQuestion(storage: StorageAdapter, question: Question) {
    await storage.saveArtifact({
        id: question.id,
        type: 'question',
        schema_version: 'v1.0.0',
        metadata: {
            created_by: 'user',
            created_at: question.created_at,
            modified_at: new Date().toISOString(),
        },
        data: question,
    });
}

// ❌ Bad (hardcoded)
async function saveQuestion(question: Question) {
    const db = openDatabase(); // Tightly coupled!
    db.insert('questions', question);
}
```

### Styling

```typescript
// ✅ Good (Tailwind utilities)
<Card className="p-6 hover:shadow-lg transition-shadow">
  <CardTitle className="text-2xl font-bold mb-4">
    {bank.title}
  </CardTitle>
</Card>

// ❌ Bad (inline styles)
<Card style={{ padding: '24px' }}>
  <CardTitle style={{ fontSize: '24px' }}>
    {bank.title}
  </CardTitle>
</Card>
```

---

## Common Patterns

### Creating Artifacts

```typescript
import { nanoid } from 'nanoid';

// Create new question
const question: QuestionArtifact = {
    id: `artifact:${nanoid()}`,
    type: 'question',
    schema_version: 'v1.0.0',
    metadata: {
        created_by: 'user',
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
    },
    data: {
        prompt: textToTiptap('What is 2+2?'),
        answers: [
            { text: textToTiptap('3'), correct: false },
            { text: textToTiptap('4'), correct: true },
        ],
        feedback: {
            correct: textToTiptap('Correct!'),
            incorrect: textToTiptap('Try again.'),
        },
        settings: {},
    },
};

await storage.saveArtifact(question);
```

### Zustand Store (with Immer)

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface AppState {
    currentProject: Project | null;
    currentBank: Bank | null;
    questions: Question[];
    selectedQuestionId: string | null;

    loadBank: (bank: Bank) => void;
    updateQuestion: (id: string, updates: Partial<Question>) => void;
    addQuestion: (question: Question) => void;
}

export const useAppStore = create(
    immer<AppState>((set) => ({
        currentProject: null,
        currentBank: null,
        questions: [],
        selectedQuestionId: null,

        loadBank: (bank) =>
            set((state) => {
                state.currentBank = bank;
                state.questions = bank.questions;
            }),

        updateQuestion: (id, updates) =>
            set((state) => {
                const question = state.questions.find((q) => q.id === id);
                if (question) {
                    Object.assign(question, updates);
                }
            }),

        addQuestion: (question) =>
            set((state) => {
                state.questions.push(question);
            }),
    }))
);
```

### Auto-Save with Debouncing

```typescript
import { useEffect, useMemo } from 'react';
import { debounce } from 'lodash-es';

function BankEditor() {
    const { currentBank, questions } = useAppStore();
    const storage = useStorage(); // Get storage adapter

    const debouncedSave = useMemo(
        () =>
            debounce(async () => {
                if (!currentBank) return;

                // Save bank
                await storage.saveArtifact({
                    id: currentBank.id,
                    type: 'question-bank',
                    schema_version: 'v1.0.0',
                    data: currentBank,
                });

                // Save all questions
                for (const question of questions) {
                    await storage.saveArtifact({
                        id: question.id,
                        type: 'question',
                        schema_version: 'v1.0.0',
                        data: question,
                    });
                }
            }, 3000), // 3 second delay
        [currentBank, questions]
    );

    useEffect(() => {
        debouncedSave();
    }, [currentBank, questions]);

    return <div>...</div>;
}
```

### Storyline Import

```typescript
import Papa from 'papaparse';

async function importStorylineCSV(file: File): Promise<QuestionArtifact[]> {
    const text = await file.text();
    const { data } = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
    });

    return data.map((row: any) => ({
        id: `artifact:${nanoid()}`,
        type: 'question',
        schema_version: 'v1.0.0',
        metadata: {
            created_by: 'import',
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString(),
        },
        data: {
            prompt: textToTiptap(row.Question),
            answers: extractAnswers(row), // Helper function
            feedback: {
                correct: textToTiptap(row.CorrectFeedback || ''),
                incorrect: textToTiptap(row.IncorrectFeedback || ''),
            },
            settings: {},
        },
    }));
}

function extractAnswers(row: any): Answer[] {
    const answers: Answer[] = [];
    const correctNums = row.CorrectAnswer.split(',').map((n: string) =>
        parseInt(n.trim())
    );

    for (let i = 1; i <= 4; i++) {
        const text = row[`Answer${i}`];
        if (text) {
            answers.push({
                text: textToTiptap(text),
                correct: correctNums.includes(i),
            });
        }
    }

    return answers;
}
```

---

## Troubleshooting

### TypeScript Errors

```bash
# Check all errors
npm run type-check

# Common fixes:
# - Add proper types (no 'any')
# - Import types from '@/types'
# - Use Zod for runtime validation
```

### Storage Errors

```bash
# SQLite (desktop)
# - Check file permissions
# - Verify database path exists
# - Check better-sqlite3 is installed

# IndexedDB (web)
# - Check browser console for errors
# - Verify browser supports IndexedDB
# - Check storage quota (browser settings)
```

### Build Errors

```bash
# Clean and rebuild
rm -rf .next # or dist/
npm run build

# Common issues:
# - Import paths wrong
# - Missing dependencies (npm install)
# - TypeScript errors blocking build
```

---

## Storage Implementation Notes

### SQLite (Desktop)

```typescript
import Database from 'better-sqlite3';

class SQLiteStorage implements StorageAdapter {
    private db: Database.Database;

    constructor(dbPath: string) {
        this.db = new Database(dbPath);
        this.initTables();
    }

    private initTables() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS artifacts (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        type TEXT NOT NULL,
        schema_version TEXT NOT NULL,
        metadata TEXT NOT NULL,
        data TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_artifacts_project 
        ON artifacts(project_id);
      CREATE INDEX IF NOT EXISTS idx_artifacts_type 
        ON artifacts(project_id, type);
    `);
    }

    async getArtifacts(projectId: string, type?: string): Promise<Artifact[]> {
        const query = type
            ? this.db.prepare(
                  'SELECT * FROM artifacts WHERE project_id = ? AND type = ?'
              )
            : this.db.prepare('SELECT * FROM artifacts WHERE project_id = ?');

        const rows = type ? query.all(projectId, type) : query.all(projectId);

        return rows.map((row: any) => ({
            id: row.id,
            type: row.type,
            schema_version: row.schema_version,
            metadata: JSON.parse(row.metadata),
            data: JSON.parse(row.data),
        }));
    }

    // ... other methods
}
```

### IndexedDB (Web)

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface QuizEditorDB extends DBSchema {
    projects: {
        key: string;
        value: Project;
        indexes: { 'by-updated': string };
    };
    artifacts: {
        key: string;
        value: Artifact;
        indexes: {
            'by-project': string;
            'by-type': [string, string];
        };
    };
}

class IndexedDBStorage implements StorageAdapter {
    private db!: IDBPDatabase<QuizEditorDB>;

    async init() {
        this.db = await openDB<QuizEditorDB>('quiz-editor', 1, {
            upgrade(db) {
                // Projects store
                const projectStore = db.createObjectStore('projects', {
                    keyPath: 'id',
                });
                projectStore.createIndex('by-updated', 'updated_at');

                // Artifacts store
                const artifactStore = db.createObjectStore('artifacts', {
                    keyPath: 'id',
                });
                artifactStore.createIndex('by-project', 'project_id');
                artifactStore.createIndex('by-type', ['project_id', 'type']);
            },
        });
    }

    async getArtifacts(projectId: string, type?: string): Promise<Artifact[]> {
        if (type) {
            return this.db.getAllFromIndex('artifacts', 'by-type', [
                projectId,
                type,
            ]);
        }
        return this.db.getAllFromIndex('artifacts', 'by-project', projectId);
    }

    // ... other methods
}
```

---

## Workflow Reminders

### During Code Session

- ✅ Commit frequently (every feature/fix)
- ✅ Use descriptive commit messages (conventional commits)
- ✅ Test changes locally (npm run dev)
- ✅ Fix TypeScript errors before committing
- ✅ Follow established patterns (CLAUDE.md)

### End of Code Session

Return to Desktop and run:

```
"update session"
```

Desktop will check git log and update SESSION.md automatically.

---

## Critical Reminders

### ⚠️ Architecture Changes (2025-02-04)

**REMOVED FROM ORIGINAL PLAN:**

- ❌ Supabase (no backend!)
- ❌ Server Actions (local storage only)
- ❌ Authentication (not needed)
- ❌ RLS policies (no database server)
- ❌ Pessimistic locking (no concurrent editing)
- ❌ Real-time sync (offline-first)

**ADDED TO NEW PLAN:**

- ✅ Semantic artifact typing (plugin-agnostic)
- ✅ Schema versioning (v1.0.0, v2.0.0, etc.)
- ✅ Plugin manifest (declares capabilities)
- ✅ Storage adapter interface (SQLite or IndexedDB)
- ✅ Offline-first (works without network)
- ✅ Future hub integration (designed for ecosystem)

### ⚠️ Platform Decision Needed

**BEFORE STARTING IMPLEMENTATION:**

Must decide: **Desktop (Tauri/Electron) OR Web (Next.js)?**

This affects:

- Storage implementation (SQLite vs IndexedDB)
- Build setup
- Deployment strategy
- File access patterns

See SESSION.md → "Blockers" for details.

---

## Quick Links

- **PROJECT_CONTEXT.md**: Full technical context (11,000+ words)
- **SESSION.md**: Current state and work log with architecture summary
- **CLAUDE.md**: Patterns and architectural decisions
- **Tiptap Docs**: https://tiptap.dev/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Zustand**: https://zustand-demo.pmnd.rs
- **Tauri**: https://tauri.app/ (if desktop)
- **Electron**: https://www.electronjs.org/ (if desktop)
- **IndexedDB (idb)**: https://github.com/jakearchibald/idb (if web)

---

**Remember**: This is a reference card, not a rulebook. Read PROJECT_CONTEXT.md for full context. When in doubt, ask Code for guidance—it has all the context.
