# Architectural Decisions & Patterns

**Project**: Quiz Editor  
**Last Updated**: 2025-02-04 (MAJOR ARCHITECTURE REVISION)  
**Purpose**: Long-term architectural reference and established patterns

---

## Architecture Overview

### Hub-Plugin Ecosystem Model

```
IDIDE Hub (Future)                     Quiz Editor Plugin (MVP)
┌──────────────────────────┐          ┌───────────────────────────┐
│  Central Graph           │          │  Local Storage            │
│  ├── Artifacts (all)     │◄─────────│  ├── Projects             │
│  ├── Links (all)         │  Fetch   │  ├── Artifacts (subset)   │
│  └── Branches            │  Subgraph│  └── Auto-save            │
│                          │          │                           │
│  PR Review & Merge       │◄─────────│  Create PR when ready     │
│  ├── Diff view           │   Push   │  ├── Changed artifacts    │
│  ├── Validation          │  Changes │  └── New links            │
│  └── Conflict resolution │          │                           │
└──────────────────────────┘          └───────────────────────────┘
```

### MVP Architecture (No Hub Yet)

```
Quiz Editor (Standalone)
┌──────────────────────────────────────┐
│  UI Layer (React + shadcn/ui)        │
│  ├── Project List                    │
│  ├── Bank List                       │
│  └── Question Editor                 │
│      ├── Tiptap (WYSIWYG)            │
│      └── Answer/Feedback editors     │
├──────────────────────────────────────┤
│  State Layer (Zustand + Immer)       │
│  ├── Current project/bank            │
│  ├── Undo/redo history               │
│  └── Auto-save logic                 │
├──────────────────────────────────────┤
│  Storage Layer                       │
│  ├── SQLite (desktop)                │
│  └── IndexedDB (web)                 │
│      ├── Projects                    │
│      ├── Artifacts (semantic types)  │
│      └── Links (for future use)      │
├──────────────────────────────────────┤
│  Import/Export Layer                 │
│  ├── Storyline CSV ↔ Artifacts       │
│  └── JSON backup/restore             │
└──────────────────────────────────────┘
```

---

## Core Architectural Principles

### 1. Semantic Artifact Typing

**Principle**: Artifacts are typed by WHAT they are, not which tool created them.

```typescript
// ✅ Good (Semantic typing)
interface Artifact {
    id: string; // 'artifact:uuid'
    type: 'question'; // Semantic type
    schema_version: 'v1.0.0'; // Enables evolution
    metadata: {
        created_by: string;
        created_at: string;
        modified_at: string;
    };
    data: QuestionData; // Type-specific data
}

// ❌ Bad (Tool-specific typing)
interface ToolSpecificArtifact {
    id: string; // 'quiz-editor:question:uuid'
    tool: 'quiz-editor'; // Couples data to tool
    // ...
}
```

**Why**: Multiple plugins can handle same types, user can switch tools, no vendor lock-in.

**Example**: Quiz Editor Classic and SuperQuiz Pro both handle 'question' type → user can switch seamlessly.

---

### 2. Schema Versioning

**Principle**: All artifact types have explicit schema versions.

```typescript
// Version 1.0.0
interface QuestionV1 {
    type: 'question';
    schema_version: 'v1.0.0';
    data: {
        prompt: string; // Plain text
        answers: Answer[];
    };
}

// Version 2.0.0 (adds rich text)
interface QuestionV2 {
    type: 'question';
    schema_version: 'v2.0.0';
    data: {
        prompt: TiptapJSON; // Rich text!
        answers: Answer[];
        metadata?: {
            // New optional fields
            difficulty?: 'easy' | 'medium' | 'hard';
            estimated_time?: number;
        };
    };
}
```

**Migration Strategy**:

```typescript
function migrateQuestion(artifact: Artifact): Artifact {
    if (artifact.schema_version === 'v1.0.0') {
        return {
            ...artifact,
            schema_version: 'v2.0.0',
            data: {
                prompt: textToTiptap(artifact.data.prompt),
                answers: artifact.data.answers,
            },
        };
    }
    return artifact;
}
```

**Why**: Enables evolution without breaking compatibility, plugins declare which versions they support.

---

### 3. Offline-First Storage

**Principle**: Plugin works completely without network.

```typescript
// Storage interface (abstraction)
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

    // Links (for future use)
    getLinks(projectId: string): Promise<Link[]>;
    saveLink(link: Link): Promise<void>;
}

// SQLite implementation (desktop)
class SQLiteStorage implements StorageAdapter {
    // Uses better-sqlite3
}

// IndexedDB implementation (web)
class IndexedDBStorage implements StorageAdapter {
    // Uses idb library
}
```

**Why**: No server dependency, works on planes/trains/offline, simpler architecture.

---

### 4. Plugin Manifest

**Principle**: Plugin declares capabilities explicitly.

```typescript
// plugin-manifest.json
{
  "name": "quiz-editor",
  "version": "1.0.0",
  "author": "Amos Glenn",
  "description": "Create and edit quiz questions for instructional design",
  
  "handles": [
    {
      "type": "question",
      "can_read": true,
      "can_write": true,
      "schema_versions": ["v1.0.0"]
    },
    {
      "type": "question-bank",
      "can_read": true,
      "can_write": true,
      "schema_versions": ["v1.0.0"]
    }
  ],
  
  "requires": {
    "hub_api_version": "v1.0.0",  // Future: when hub exists
    "platform": ["desktop", "web"]
  },
  
  "exports": {
    "formats": ["storyline-csv", "json"]
  }
}
```

**Why**: Hub knows what each plugin can do, users know plugin capabilities, developers have clear contract.

---

## Design Patterns

### 1. Tiptap JSON as Content Format

**Principle**: Store rich text as structured Tiptap JSON, not HTML strings.

```typescript
// ✅ Good (Tiptap JSON)
const prompt: TiptapJSON = {
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            content: [
                { type: 'text', text: 'What is ' },
                {
                    type: 'text',
                    text: 'photosynthesis',
                    marks: [{ type: 'bold' }],
                },
                { type: 'text', text: '?' },
            ],
        },
    ],
};

// ❌ Bad (HTML string)
const prompt = '<p>What is <strong>photosynthesis</strong>?</p>';
```

**Why**:

- Structured (can query/transform)
- Versionable (schema evolution)
- Editor-agnostic (not tied to Tiptap)
- Safer (no XSS from HTML parsing)

---

### 2. Zustand + Immer for State

**Principle**: Write mutable-looking code, get immutable updates.

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface AppState {
    currentProject: Project | null;
    currentBank: Bank | null;
    questions: Question[];
    selectedQuestionId: string | null;

    // Actions
    loadBank: (bank: Bank) => void;
    updateQuestion: (id: string, updates: Partial<Question>) => void;
    addQuestion: (question: Question) => void;
    deleteQuestion: (id: string) => void;
}

const useAppStore = create(
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
                    Object.assign(question, updates); // Looks mutable!
                }
            }),

        addQuestion: (question) =>
            set((state) => {
                state.questions.push(question); // Looks mutable!
            }),

        deleteQuestion: (id) =>
            set((state) => {
                state.questions = state.questions.filter((q) => q.id !== id);
            }),
    }))
);
```

**Why**: Simpler than Redux, automatic structural sharing, easier undo/redo.

---

### 3. Undo/Redo with Snapshots

**Principle**: Store serialized state snapshots for undo/redo.

```typescript
interface UndoableState extends AppState {
    history: string[]; // Serialized snapshots
    historyIndex: number;

    // Undo/redo actions
    undo: () => void;
    redo: () => void;
    pushHistory: () => void;
}

const useAppStore = create(
    immer<UndoableState>((set, get) => ({
        // ... existing state

        history: [],
        historyIndex: -1,

        pushHistory: () =>
            set((state) => {
                // Serialize current state
                const snapshot = JSON.stringify({
                    questions: state.questions,
                    currentBank: state.currentBank,
                });

                // Trim future history if not at end
                state.history = state.history.slice(0, state.historyIndex + 1);

                // Add new snapshot
                state.history.push(snapshot);
                state.historyIndex = state.history.length - 1;

                // Limit history size
                if (state.history.length > 50) {
                    state.history.shift();
                    state.historyIndex--;
                }
            }),

        undo: () =>
            set((state) => {
                if (state.historyIndex > 0) {
                    state.historyIndex--;
                    const snapshot = JSON.parse(state.history[state.historyIndex]);
                    state.questions = snapshot.questions;
                    state.currentBank = snapshot.currentBank;
                }
            }),

        redo: () =>
            set((state) => {
                if (state.historyIndex < state.history.length - 1) {
                    state.historyIndex++;
                    const snapshot = JSON.parse(state.history[state.historyIndex]);
                    state.questions = snapshot.questions;
                    state.currentBank = snapshot.currentBank;
                }
            }),
    }))
);
```

**Why**: Simple to implement, works with any state shape, memory efficient (only store diffs later).

---

### 4. Auto-Save with Debouncing

**Principle**: Save frequently but not on every keystroke.

```typescript
import { useEffect, useMemo } from 'react';
import { debounce } from 'lodash-es';

function BankEditor() {
    const { currentBank, questions } = useAppStore();

    // Debounced save function
    const debouncedSave = useMemo(
        () =>
            debounce(async (bank: Bank) => {
                await storage.saveArtifact({
                    id: bank.id,
                    type: 'question-bank',
                    schema_version: 'v1.0.0',
                    data: bank,
                });

                // Save all questions
                for (const question of bank.questions) {
                    await storage.saveArtifact({
                        id: question.id,
                        type: 'question',
                        schema_version: 'v1.0.0',
                        data: question,
                    });
                }

                toast.success('Saved');
            }, 3000), // Wait 3s after last change
        []
    );

    // Trigger save when state changes
    useEffect(() => {
        if (currentBank) {
            debouncedSave(currentBank);
        }
    }, [currentBank, questions]);

    return <div>...</div>;
}
```

**Why**: Responsive UX (no lag), prevents data loss, reduces storage writes.

---

### 5. Storyline Import/Export

**Principle**: Convert between internal format and Storyline CSV.

```typescript
// Import: Storyline CSV → Artifacts
async function importStorylineCSV(file: File): Promise<Artifact[]> {
    const text = await file.text();
    const { data } = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
    });

    return data.map((row: any) => ({
        id: `artifact:${crypto.randomUUID()}`,
        type: 'question',
        schema_version: 'v1.0.0',
        metadata: {
            created_by: 'import',
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString(),
        },
        data: {
            prompt: textToTiptap(row.Question),
            answers: extractAnswers(row),
            feedback: {
                correct: textToTiptap(row.CorrectFeedback),
                incorrect: textToTiptap(row.IncorrectFeedback),
            },
            settings: {},
        },
    }));
}

// Export: Artifacts → Storyline CSV
function exportToStorylineCSV(questions: Artifact[]): string {
    const rows = questions.map((q) => ({
        Type: mapTypeToStoryline(q.data.type),
        Question: tiptapToText(q.data.prompt),
        Answer1: tiptapToText(q.data.answers[0]?.text),
        Answer2: tiptapToText(q.data.answers[1]?.text),
        Answer3: tiptapToText(q.data.answers[2]?.text),
        Answer4: tiptapToText(q.data.answers[3]?.text),
        CorrectAnswer: getCorrectAnswerNumbers(q.data.answers),
        CorrectFeedback: tiptapToText(q.data.feedback.correct),
        IncorrectFeedback: tiptapToText(q.data.feedback.incorrect),
    }));

    return Papa.unparse(rows);
}

// Helpers
function textToTiptap(text: string): TiptapJSON {
    return {
        type: 'doc',
        content: [
            {
                type: 'paragraph',
                content: [{ type: 'text', text }],
            },
        ],
    };
}

function tiptapToText(json: TiptapJSON): string {
    // Extract plain text from Tiptap JSON (strip formatting)
    return json.content
        .map((node) =>
            node.content?.map((c) => c.text || '').join('') || ''
        )
        .join('\n');
}
```

**Why**: Interoperability with Storyline 360 is critical, lossy conversion acceptable for MVP.

---

## Coding Conventions

### TypeScript

```typescript
// ✅ Good (strict typing)
interface Question {
    id: string;
    prompt: TiptapJSON;
    answers: Answer[];
    feedback: Feedback;
}

function updateQuestion(id: string, updates: Partial<Question>): void {
    // Implementation
}

// ❌ Bad (any types)
function updateQuestion(id: any, updates: any): any {
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

function QuestionEditor({ question, onUpdate }: QuestionEditorProps) {
    const [localPrompt, setLocalPrompt] = useState(question.prompt);

    return <div>...</div>;
}

// ❌ Bad (class components)
class QuestionEditor extends React.Component {
    // Don't use classes
}
```

### Styling (Tailwind)

```typescript
// ✅ Good (utility classes)
<Card className="p-6 hover:shadow-lg transition-shadow">
  <CardTitle className="text-2xl font-bold mb-4">
    {bank.title}
  </CardTitle>
</Card>

// ❌ Bad (inline styles)
<Card style={{ padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
  <CardTitle style={{ fontSize: '24px', fontWeight: 'bold' }}>
    {bank.title}
  </CardTitle>
</Card>
```

### File Structure

```
src/
├── app/                      # Pages (if using Next.js)
│   ├── page.tsx              # Home / Project list
│   ├── [projectId]/
│   │   └── page.tsx          # Bank list
│   └── [projectId]/[bankId]/
│       └── page.tsx          # Bank editor
├── components/
│   ├── ui/                   # shadcn primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── project/              # Project components
│   │   ├── ProjectList.tsx
│   │   └── ProjectCard.tsx
│   ├── bank/                 # Bank components
│   │   ├── BankList.tsx
│   │   └── BankCard.tsx
│   └── question/             # Question components
│       ├── QuestionEditor.tsx
│       ├── PromptEditor.tsx
│       ├── AnswerList.tsx
│       └── FeedbackEditor.tsx
├── lib/
│   ├── storage/              # Storage adapters
│   │   ├── interface.ts      # StorageAdapter interface
│   │   ├── sqlite.ts         # SQLite implementation
│   │   └── indexeddb.ts      # IndexedDB implementation
│   ├── import-export/        # Storyline conversion
│   │   ├── import.ts
│   │   └── export.ts
│   ├── utils.ts              # General utilities
│   └── validations.ts        # Zod schemas
├── store/
│   └── app-store.ts          # Zustand store
└── types/
    ├── artifact.ts           # Artifact types
    ├── question.ts           # Question types
    └── plugin.ts             # Plugin manifest types
```

---

## Anti-Patterns to Avoid

### ❌ Don't Store Tool Identity in Artifacts

```typescript
// Bad (couples artifact to tool)
{
  id: 'quiz-editor:question:uuid',
  created_by_tool: 'quiz-editor'
}

// Good (tool-agnostic)
{
  id: 'artifact:uuid',
  type: 'question'
}
```

### ❌ Don't Use HTML Strings

```typescript
// Bad
question.prompt = '<p>What is <strong>2+2</strong>?</p>';

// Good
question.prompt = {
    type: 'doc',
    content: [
        /* Tiptap JSON */
    ],
};
```

### ❌ Don't Skip Schema Versions

```typescript
// Bad (no version)
{
  id: 'artifact:uuid',
  type: 'question',
  data: { ... }
}

// Good (explicit version)
{
  id: 'artifact:uuid',
  type: 'question',
  schema_version: 'v1.0.0',
  data: { ... }
}
```

### ❌ Don't Hardcode Storage Implementation

```typescript
// Bad (tightly coupled)
function saveQuestion(question: Question) {
    const db = openDatabase();
    db.insert('questions', question);
}

// Good (abstracted)
interface StorageAdapter {
    saveArtifact(artifact: Artifact): Promise<void>;
}

function saveQuestion(question: Question, storage: StorageAdapter) {
    storage.saveArtifact({
        id: question.id,
        type: 'question',
        data: question,
    });
}
```

---

## Future Architectural Changes

### When to Add Hub Integration

**Triggers**:

- Multiple users need to collaborate
- Need version control (branching, PRs)
- Want cross-tool provenance (question → objective → need)
- Second plugin exists and needs shared data

**Effort**: Medium (hub API, PR workflow UI, conflict resolution)
**Impact**: High (enables full ecosystem)

### When to Add Real-Time Collaboration

**Triggers**:

- Users request simultaneous editing within branches
- Need live cursors / presence indicators
- Want Google Docs-style experience

**Effort**: High (WebSocket server, Yjs integration, CRDT conflicts)
**Impact**: Medium (nice-to-have, not essential)

### When to Add Type Registry

**Triggers**:

- 10+ plugins with custom types
- Type naming conflicts emerge
- Need discoverability (search for types)

**Effort**: Medium (registry API, UI, governance)
**Impact**: Medium (standardization, reusability)

---

## Lessons Learned

*(Will update as we build)*

### Decision: Semantic Typing

- **Why**: Prevents vendor lock-in, enables plugin competition
- **Trade-off**: Plugins must agree on type schemas
- **Outcome**: TBD (validate during MVP)

### Decision: Offline-First

- **Why**: Simpler architecture, works without network
- **Trade-off**: No real-time collaboration, manual sync
- **Outcome**: TBD (validate during MVP)

### Decision: Local Storage Only

- **Why**: No server = simpler MVP, faster launch
- **Trade-off**: No sharing, no collaboration, no cloud backup
- **Outcome**: TBD (can add hub later without migration)

---

**End of CLAUDE.md**

This file captures long-term architectural decisions and patterns.  
Update when patterns solidify or architecture shifts significantly.
