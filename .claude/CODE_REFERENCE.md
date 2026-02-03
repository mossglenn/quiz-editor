# Code Session Quick Reference

**Project**: Quiz Editor  
**Location**: `/Users/amosglenn/Dev/quiz-editor`

---

## Starting a Code Session

### 1. Read Context Files First

```
Read .claude/PROJECT_CONTEXT.md and .claude/SESSION.md to understand the project.
```

**What you'll find**:

- PROJECT_CONTEXT.md: Full tech stack, architecture, database schema, implementation plan
- SESSION.md: Current state, what's done, what's next, recent decisions

### 2. Check Current Phase

Look at SESSION.md → "Current State" → "What's Next" to see what to build.

### 3. Start Building

Ask Code to help implement the next item from "What's Next".

---

## Tech Stack Reminders

### Framework & Tools

- **Next.js 14+** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Supabase** for database + auth
- **Tiptap** for WYSIWYG editing
- **Zustand + Immer** for state management
- **papaparse** for CSV import/export

### Key Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run type-check       # Check TypeScript errors
npm run lint             # Run ESLint

# Git
git status               # Check what's changed
git add .                # Stage all changes
git commit -m "..."      # Commit with message
git log --oneline        # See recent commits

# Supabase (when set up)
npx supabase status      # Check Supabase connection
npx supabase migration new <name>  # Create new migration
```

---

## File Structure

```
quiz-editor/
├── .claude/                    # AI context & workflows
│   ├── PROJECT_CONTEXT.md      # Full project context
│   ├── SESSION.md              # Work log
│   ├── CLAUDE.md               # Patterns & decisions
│   └── prompts/                # Workflow prompts
├── src/
│   ├── app/                    # Next.js pages (App Router)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── banks/              # Bank routes
│   │   │   ├── page.tsx        # List banks
│   │   │   ├── [id]/page.tsx   # View bank
│   │   │   └── [id]/edit/page.tsx  # Edit bank
│   │   └── actions/            # Server Actions
│   │       └── banks.ts        # Bank CRUD actions
│   ├── components/
│   │   ├── ui/                 # shadcn primitives
│   │   └── banks/              # Domain components
│   ├── lib/
│   │   ├── supabase/           # Supabase clients
│   │   │   ├── server.ts       # Server client
│   │   │   └── client.ts       # Client client
│   │   ├── utils.ts            # Utilities
│   │   └── validations.ts      # Zod schemas
│   └── types/
│       ├── database.ts         # Supabase types
│       └── question.ts         # Domain types
├── .env.local                  # Environment variables
└── package.json
```

---

## Coding Conventions (from CLAUDE.md)

### TypeScript

```typescript
// ✅ Good
export async function createBank(data: BankInput): Promise<Bank> {
    const validated = BankSchema.parse(data);
    // ...
}

// ❌ Bad
export async function createBank(data: any) {
    // ...
}
```

### React Components

```typescript
// ✅ Good (Server Component by default)
export default async function BanksPage() {
  const banks = await fetchBanks();
  return <BankList banks={banks} />;
}

// ✅ Good (Client Component when needed)
'use client';
export function BankCard({ bank }: BankCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  // ...
}
```

### Server Actions

```typescript
// ✅ Good
'use server';
export async function createBank(formData: FormData) {
    const title = formData.get('title') as string;
    // Validate with Zod
    const data = BankSchema.parse({ title });
    // Insert to Supabase
    const { data: bank } = await supabase.from('banks').insert(data);
    // Revalidate & redirect
    revalidatePath('/banks');
    redirect(`/banks/${bank.id}`);
}

// ❌ Bad (API route instead of Server Action)
export async function POST(request: Request) {
    // Don't use API routes for mutations
}
```

### Styling

```typescript
// ✅ Good (Tailwind utilities)
<Card className="hover:shadow-lg transition-shadow">
  <CardTitle className="text-2xl font-bold">
    {bank.title}
  </CardTitle>
</Card>

// ❌ Bad (custom CSS)
<Card style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
```

---

## Common Patterns

### Fetching Data (Server Component)

```typescript
export default async function BanksPage() {
  const supabase = createClient(); // from lib/supabase/server

  const { data: banks, error } = await supabase
    .from('banks')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) return <ErrorMessage error={error} />;

  return <BankList banks={banks} />;
}
```

### Form Submission (Server Action)

```typescript
// Server Action
'use server';
export async function createBank(formData: FormData) {
  // Extract data
  const title = formData.get('title') as string;

  // Validate
  const validated = BankSchema.parse({ title });

  // Insert
  const { data: bank } = await supabase
    .from('banks')
    .insert(validated)
    .select()
    .single();

  // Revalidate & redirect
  revalidatePath('/banks');
  redirect(`/banks/${bank.id}`);
}

// Component
<form action={createBank}>
  <Input name="title" required />
  <Button type="submit">Create</Button>
</form>
```

### Client State (Zustand + Immer)

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const useBankStore = create(
    immer<BankState>((set) => ({
        bank: null,
        selectedQuestionId: null,

        updateQuestion: (id, updates) =>
            set((state) => {
                const question = state.bank.questions.find((q) => q.id === id);
                Object.assign(question, updates);
            }),
    }))
);
```

---

## Getting Help During Code Session

### When Stuck

1. **Check PROJECT_CONTEXT.md** for architecture decisions
2. **Check CLAUDE.md** for established patterns
3. **Read error messages carefully** (TypeScript is helpful)
4. **Ask Code for clarification** (it has full context)

### When to Ask Questions

- "How should I structure this component?"
- "What's the pattern for [X]?"
- "Is there a better way to do this?"
- "Can you explain why we chose [Y]?"

### Before Committing

Use the commit message workflow:

```
"commit message please"
```

Code will analyze git diff and generate a proper conventional commit message.

---

## Database Schema Quick Reference

### Banks Table

```typescript
interface Bank {
    id: string; // UUID
    title: string; // Required
    description: string | null; // Optional
    owner_id: string | null; // null = anonymous (MVP)
    share_token: string; // UUID for sharing
    settings: object; // JSON (passing_grade, attempts, etc.)
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
}
```

### Questions Table

```typescript
interface Question {
    id: string; // UUID
    bank_id: string; // FK to banks
    type: QuestionType; // 'multiple_choice' | 'multiple_response' | 'true_false' | 'fill_in_blank'
    prompt: TiptapJSON; // Rich text (Tiptap format)
    answers: Answer[]; // Array of answer objects
    feedback: {
        correct: TiptapJSON;
        incorrect: TiptapJSON;
    };
    settings: object; // JSON (points, attempts, randomize, etc.)
    position: number; // Order within bank
    created_at: string;
    updated_at: string;
}
```

### Answer Object

```typescript
interface Answer {
    text: TiptapJSON; // Rich text
    correct: boolean; // Is this a correct answer?
}
```

---

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-only, never expose to client
```

---

## Supabase Quick Reference

### Server Client (Server Components, Server Actions)

```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = createClient();
const { data } = await supabase.from('banks').select('*');
```

### Client Client (Client Components)

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data } = await supabase.from('banks').select('*');
```

### Common Queries

```typescript
// Select all
const { data } = await supabase.from('banks').select('*');

// Select with filter
const { data } = await supabase
    .from('banks')
    .select('*')
    .eq('owner_id', userId);

// Insert
const { data } = await supabase
    .from('banks')
    .insert({ title: 'My Bank' })
    .select()
    .single();

// Update
const { data } = await supabase
    .from('banks')
    .update({ title: 'New Title' })
    .eq('id', bankId)
    .select()
    .single();

// Delete
const { error } = await supabase.from('banks').delete().eq('id', bankId);
```

---

## Troubleshooting

### TypeScript Errors

```bash
# Check all errors
npm run type-check

# Common fixes:
# - Add proper types (no 'any')
# - Import types from '@/types/database'
# - Use Zod for runtime validation
```

### Supabase Errors

```bash
# Check connection
npx supabase status

# Common issues:
# - Wrong env vars (.env.local)
# - Missing table (run migrations)
# - RLS policy blocking (check policies)
```

### Build Errors

```bash
# Clean and rebuild
rm -rf .next
npm run build

# Common issues:
# - Import paths wrong (use @/ aliases)
# - Server/Client component mismatch
# - Missing dependencies (npm install)
```

---

## Workflow Reminders

### During Code Session

- ✅ Commit frequently (every feature/fix)
- ✅ Use descriptive commit messages
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

## Quick Links

- **PROJECT_CONTEXT.md**: Full technical context
- **SESSION.md**: Current state and work log
- **CLAUDE.md**: Patterns and architectural decisions
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tiptap Docs**: https://tiptap.dev/docs
- **shadcn/ui**: https://ui.shadcn.com

---

**Remember**: This is a reference card, not a rulebook. When in doubt, ask Code for guidance—it has full context and can help you make the right decisions.
