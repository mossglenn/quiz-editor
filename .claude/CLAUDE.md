# Architectural Decisions & Patterns

**Project**: Quiz Editor  
**Last Updated**: 2025-02-03  
**Purpose**: Long-term architectural reference and established patterns

---

## Architecture Overview

### System Design

```bash
┌─────────────────────────────────────────┐
│          Client (Next.js App)           │
│  ┌─────────────────────────────────┐   │
│  │   React Components (shadcn/ui)  │   │
│  │   • BankList, QuestionEditor    │   │
│  │   • Tiptap WYSIWYG              │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   State (Zustand + Immer)       │   │
│  │   • Undo/redo history           │   │
│  │   • Question editing state      │   │
│  └─────────────────────────────────┘   │
└────────────────┬────────────────────────┘
                 │
                 │ Server Actions
                 │
┌────────────────▼────────────────────────┐
│       Next.js Server (Vercel)           │
│  ┌─────────────────────────────────┐   │
│  │   API Layer (Server Actions)    │   │
│  │   • Bank CRUD                    │   │
│  │   • Question CRUD                │   │
│  │   • Import/Export                │   │
│  └─────────────────────────────────┘   │
└────────────────┬────────────────────────┘
                 │
                 │ Supabase Client
                 │
┌────────────────▼────────────────────────┐
│         Supabase (Database)             │
│  ┌─────────────────────────────────┐   │
│  │   Postgres Tables                │   │
│  │   • banks, questions             │   │
│  │   • bank_snapshots, bank_shares  │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   Row-Level Security (RLS)      │   │
│  │   • Share permissions            │   │
│  │   • Anonymous access control     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Data Flow

```bash
User Action → Component → Zustand Store → Server Action → Supabase → RLS Check → Database
                              ↓
                        Optimistic Update
                              ↓
                        UI Updates Immediately
                              ↓
                        Server Confirms/Rejects
```

---

## Design Patterns

### 1. Component Composition (shadcn Pattern)

**Principle**: Build from primitives, compose upward

```typescript
// Primitives (shadcn/ui)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Composed Components
function QuestionCard({ question, onEdit, onDelete }) {
  return (
    <Card>
      <QuestionPrompt content={question.prompt} />
      <AnswerList answers={question.answers} />
      <CardFooter>
        <Button onClick={onEdit}>Edit</Button>
        <Button variant="destructive" onClick={onDelete}>Delete</Button>
      </CardFooter>
    </Card>
  );
}
```

**Why**: Reusability, consistency, easy to test

---

### 2. Server Actions for Mutations

**Principle**: No API routes—use Server Actions for all data mutations

```typescript
// app/actions/banks.ts
'use server';

export async function createBank(data: {
    title: string;
    description?: string;
}) {
    const supabase = createClient();

    const { data: bank, error } = await supabase
        .from('banks')
        .insert(data)
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/banks');
    return bank;
}
```

**Why**: Type-safe, no boilerplate, automatic revalidation

---

### 3. Optimistic UI Updates

**Principle**: Update UI immediately, rollback on error

```typescript
// Zustand store
updateQuestion: (id, updates) => {
    set((state) => {
        // Optimistic update
        const question = state.questions.find((q) => q.id === id);
        Object.assign(question, updates);
    });

    // Server sync (async)
    saveQuestion(id, updates).catch(() => {
        // Rollback on error
        set((state) => {
            const question = state.questions.find((q) => q.id === id);
            Object.assign(question, previousState);
        });
    });
};
```

**Why**: Snappy UX, handles failures gracefully

---

### 4. Immutable Updates with Immer

**Principle**: Write mutable code, get immutable updates

```typescript
import { immer } from 'zustand/middleware/immer';

const useBankStore = create(
    immer((set) => ({
        bank: null,
        updateQuestion: (id, updates) =>
            set((state) => {
                const question = state.bank.questions.find((q) => q.id === id);
                question.prompt = updates.prompt; // Looks mutable, actually creates new object
            }),
    }))
);
```

**Why**: Simpler code, automatic structural sharing, easier undo/redo

---

### 5. Tiptap JSON as Content Format

**Principle**: Store rich text as Tiptap JSON, not HTML

```typescript
// Good (Tiptap JSON)
{
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Hello ' },
        { type: 'text', text: 'world', marks: [{ type: 'bold' }] }
      ]
    }
  ]
}

// Bad (HTML string)
"<p>Hello <strong>world</strong></p>"
```

**Why**: Structured, versionable, editor-agnostic, easier to transform

---

### 6. UUID Share Tokens for Anonymous Access

**Principle**: Use unguessable UUIDs, not sequential IDs

```sql
CREATE TABLE banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_token UUID UNIQUE DEFAULT gen_random_uuid()
);

-- Share URL: /banks/share/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Why**: Security through obscurity (128-bit entropy), no enumeration attacks

---

## Coding Conventions

### TypeScript

- ✅ Strict mode enabled (`"strict": true`)
- ✅ No `any` types (use `unknown` if necessary)
- ✅ Explicit return types for functions
- ✅ Zod for runtime validation

### React

- ✅ Functional components only (no classes)
- ✅ Hooks for state/effects
- ✅ Server Components by default (`'use client'` only when needed)
- ✅ Co-locate state with components (avoid prop drilling)

### Styling

- ✅ Tailwind utility classes (no custom CSS unless necessary)
- ✅ shadcn/ui for base components
- ✅ Consistent spacing scale (4px increments)
- ✅ Mobile-first responsive design

### File Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx
│   └── banks/
│       ├── page.tsx      # Bank list
│       ├── [id]/
│       │   └── page.tsx  # Bank view
│       └── [id]/edit/
│           └── page.tsx  # Bank editor
├── components/
│   ├── ui/               # shadcn primitives
│   └── banks/            # Domain components
│       ├── BankCard.tsx
│       └── QuestionEditor.tsx
├── lib/
│   ├── supabase.ts       # Supabase client
│   ├── utils.ts          # Utilities
│   └── validations.ts    # Zod schemas
└── types/
    ├── database.ts       # Supabase types
    └── question.ts       # Domain types
```

### Git

- ✅ Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.)
- ✅ Descriptive commit bodies (why, not what)
- ✅ Branch per phase (`phase-1-foundation`, `phase-2-banks`)
- ✅ Squash merge to main (clean history)

---

## Anti-Patterns to Avoid

### ❌ Don't Use API Routes for Mutations

```typescript
// Bad
export async function POST(request: Request) {
    const data = await request.json();
    // ...
}

// Good
('use server');
export async function createBank(data: BankInput) {
    // ...
}
```

### ❌ Don't Store HTML Strings

```typescript
// Bad
question.prompt = '<p>What is 2+2?</p>';

// Good
question.prompt = {
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            content: [{ type: 'text', text: 'What is 2+2?' }],
        },
    ],
};
```

### ❌ Don't Bypass RLS Policies

```typescript
// Bad (service role key in client)
const supabase = createClient(serviceRoleKey);

// Good (anon key, RLS enforces permissions)
const supabase = createClient(anonKey);
```

### ❌ Don't Hardcode UUIDs

```typescript
// Bad
const bankId = '12345678-1234-1234-1234-123456789012';

// Good
const bankId = crypto.randomUUID();
```

---

## Supabase Patterns

### Client Creation

```typescript
// Server Component
import { createClient } from '@/lib/supabase/server';
const supabase = createClient();

// Client Component
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

### RLS Policy Pattern

```sql
-- Template for table policies
CREATE POLICY "policy_name"
ON table_name
FOR operation -- SELECT, INSERT, UPDATE, DELETE
USING (
  -- Condition for row visibility
  auth.uid() = owner_id
  OR share_token IS NOT NULL
);
```

### Realtime Subscriptions (Future)

```typescript
useEffect(() => {
    const channel = supabase
        .channel(`bank:${bankId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'questions',
                filter: `bank_id=eq.${bankId}`,
            },
            (payload) => {
                // Update local state
            }
        )
        .subscribe();

    return () => supabase.removeChannel(channel);
}, [bankId]);
```

---

## Migration Patterns

### Schema Changes

```sql
-- Always reversible
ALTER TABLE questions ADD COLUMN group_id UUID REFERENCES question_groups(id);

-- Rollback
ALTER TABLE questions DROP COLUMN group_id;
```

### Data Migrations

```typescript
// Migrate Tiptap v1 → v2 format
const questions = await supabase.from('questions').select('*');

for (const q of questions) {
    const migratedPrompt = migrateTiptapJSON(q.prompt);
    await supabase
        .from('questions')
        .update({ prompt: migratedPrompt })
        .eq('id', q.id);
}
```

---

## Performance Patterns

### Lazy Loading

```typescript
// Load banks on demand
const { data: banks } = await supabase
    .from('banks')
    .select('id, title, question_count')
    .range(0, 19); // First 20 only
```

### Debounced Auto-Save

```typescript
const debouncedSave = useMemo(
    () => debounce((bank) => saveBankSnapshot(bank), 30000),
    []
);

useEffect(() => {
    debouncedSave(bank);
}, [bank]);
```

### Optimistic Reordering

```typescript
// Drag-and-drop question reordering
const reorderQuestions = (fromIndex, toIndex) => {
    set((state) => {
        const [moved] = state.questions.splice(fromIndex, 1);
        state.questions.splice(toIndex, 0, moved);
        // Update positions optimistically
        state.questions.forEach((q, i) => (q.position = i));
    });

    // Sync to server (async)
    updatePositions(questions).catch(rollback);
};
```

---

## Security Patterns

### Input Validation

```typescript
import { z } from 'zod';

const BankSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
});

export async function createBank(input: unknown) {
    const data = BankSchema.parse(input); // Throws if invalid
    // ...
}
```

### Rate Limiting (Future)

```typescript
// Vercel middleware
export async function middleware(request: NextRequest) {
    const ip = request.ip ?? 'anonymous';
    const { success } = await ratelimit.limit(ip);

    if (!success) {
        return new Response('Too many requests', { status: 429 });
    }

    return NextResponse.next();
}
```

---

## Testing Strategy (Future)

### Unit Tests

```typescript
// Component tests (Vitest + Testing Library)
test('QuestionEditor renders prompt', () => {
  render(<QuestionEditor question={mockQuestion} />);
  expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
});
```

### Integration Tests

```typescript
// Server Action tests
test('createBank creates bank in database', async () => {
    const bank = await createBank({ title: 'Test Bank' });
    expect(bank.id).toBeDefined();
    expect(bank.title).toBe('Test Bank');
});
```

### E2E Tests (Playwright, Future)

```typescript
test('user can create and edit bank', async ({ page }) => {
    await page.goto('/banks');
    await page.click('text=Create Bank');
    await page.fill('input[name="title"]', 'My Bank');
    await page.click('text=Save');
    await expect(page).toHaveURL(/\/banks\/[a-z0-9-]+/);
});
```

---

## Deployment Patterns

### Environment Variables

```env
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Server-only

# Vercel (production)
# Add same variables in Vercel dashboard
```

### Build Optimization

```typescript
// next.config.js
module.exports = {
    images: {
        domains: ['xxx.supabase.co'], // Allow Supabase Storage images
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb', // For CSV imports
        },
    },
};
```

---

## Lessons Learned (Will Update)

### Decision: Table-Based Storage

- **Why**: Need querying, RLS, real-time subscriptions
- **Trade-off**: JSONB size limits (not an issue for this scale)
- **Outcome**: Correct choice—fast to build, works well

### Decision: Pessimistic Locking (MVP)

- **Why**: Avoid concurrent edit conflicts without complex merge logic
- **Trade-off**: Single editor at a time (less collaborative)
- **Outcome**: TBD (will evaluate in MVP testing)

---

## Future Architectural Changes

### When to Add Real-Time (Yjs)

- **Trigger**: Multiple users requesting simultaneous editing
- **Effort**: High (WebSocket server, CRDT integration, conflict UI)
- **Impact**: Major (changes state management, requires new infra)

### When to Migrate to Event Sourcing

- **Trigger**: Need granular history ("who changed what when")
- **Effort**: Medium (action logs, replay logic, migration script)
- **Impact**: Medium (improves history, complicates queries)

### When to Add Hybrid Storage (Metadata + Files)

- **Trigger**: Banks exceed 10K questions (JSONB limits)
- **Effort**: Medium (file storage, sync logic, metadata table)
- **Impact**: Low (most features still work, export changes)

---

**End of CLAUDE.md**

This file captures long-term architectural decisions and patterns.  
Update when patterns solidify or architecture shifts significantly.
