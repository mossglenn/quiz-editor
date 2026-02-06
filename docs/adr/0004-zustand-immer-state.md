# ADR-0004: Use Zustand + Immer for State Management

## Status
**Accepted** - 2025-02-04

## Context

Quiz Editor needs client-side state management for:
- Current project and bank selection
- Question list and editing state
- Undo/redo functionality
- Auto-save coordination
- UI state (selections, modals, etc.)

**Requirements:**
- Type-safe state updates
- Immutable updates (for React rendering)
- Simple API (low learning curve)
- Undo/redo support
- Devtools for debugging
- Performance (frequent updates during editing)

**Key Scenarios:**

**Question Editing:**
```typescript
// User types in editor → update state → re-render
// Happens on every keystroke (must be fast)
```

**Undo/Redo:**
```typescript
// User clicks undo → restore previous state
// Must work across all state changes
```

**Auto-Save:**
```typescript
// State changes → debounce → persist to storage
// Coordinated with editing state
```

**Comparison of Popular Solutions:**

| Feature | Redux Toolkit | Zustand | MobX | Jotai |
|---------|--------------|---------|------|-------|
| Boilerplate | Medium | Low | Low | Low |
| Learning Curve | Steep | Gentle | Medium | Medium |
| TypeScript | Excellent | Excellent | Good | Excellent |
| Immutability | Required | Required | Not required | Required |
| DevTools | Excellent | Good | Good | Minimal |
| Bundle Size | 43 KB | 3 KB | 78 KB | 7 KB |
| Middleware | Rich | Simple | Custom | Limited |

**Problem:**
Which state library best balances simplicity, type safety, and features?

## Decision

**Use Zustand with Immer middleware for state management.**

### Zustand Overview

```typescript
import { create } from 'zustand';

interface AppState {
  count: number;
  increment: () => void;
}

const useStore = create<AppState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}));

// Usage in components
function Counter() {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);
  
  return <button onClick={increment}>{count}</button>;
}
```

### Immer Middleware

**Without Immer (manual immutability):**
```typescript
updateQuestion: (id, updates) => 
  set((state) => ({
    questions: state.questions.map(q =>
      q.id === id ? { ...q, ...updates } : q
    )
  }))
```

**With Immer (mutable-looking code):**
```typescript
import { immer } from 'zustand/middleware/immer';

const useStore = create(
  immer<AppState>((set) => ({
    questions: [],
    
    updateQuestion: (id, updates) => 
      set((state) => {
        const question = state.questions.find(q => q.id === id);
        if (question) {
          Object.assign(question, updates); // Looks mutable!
        }
      })
  }))
);
```

Immer produces immutable updates under the hood via structural sharing.

### Our Implementation

**Core Store (Framework Level):**
```typescript
/**
 * Core Framework state store
 */
interface CoreState {
  projects: Project[];
  currentProject: Project | null;
  
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
}

export const useCoreStore = create(
  immer<CoreState>((set) => ({
    projects: [],
    currentProject: null,
    
    setProjects: (projects) =>
      set((state) => {
        state.projects = projects;
      }),
    
    setCurrentProject: (project) =>
      set((state) => {
        state.currentProject = project;
      })
  }))
);
```

**Quiz Editor Store (Tool Specific):**
```typescript
/**
 * Quiz Editor state store
 */
interface QuizEditorState {
  currentBank: QuizBank | null;
  questions: QuizQuestion[];
  selectedQuestionId: string | null;
  
  loadBank: (bank: QuizBank) => void;
  updateQuestion: (id: string, updates: Partial<QuizQuestion['data']>) => void;
  addQuestion: (question: QuizQuestion) => void;
  deleteQuestion: (id: string) => void;
}

export const useQuizEditorStore = create(
  immer<QuizEditorState>((set) => ({
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
        const question = state.questions.find(q => q.id === id);
        if (question) {
          Object.assign(question.data, updates);
          question.metadata.modified_at = new Date().toISOString();
        }
      }),
    
    addQuestion: (question) =>
      set((state) => {
        state.questions.push(question);
      }),
    
    deleteQuestion: (id) =>
      set((state) => {
        state.questions = state.questions.filter(q => q.id !== id);
      })
  }))
);
```

## Consequences

### Positive

✅ **Simple API**
- Minimal boilerplate
- No actions, reducers, or constants
- Direct state updates
- Easy to learn

✅ **Mutable-Looking Code (Immer)**
- Write updates like mutations
- Immer handles immutability
- Less cognitive overhead
- Fewer bugs from manual spreading

✅ **Type Safety**
- Full TypeScript support
- Inferred types work well
- IDE autocomplete excellent
- Compile-time validation

✅ **Performance**
- Tiny bundle (3 KB)
- Fast updates (structural sharing)
- Efficient re-renders (selector-based)
- No wrapper components needed

✅ **React Integration**
- Hook-based API (modern React)
- Works with React 19
- Server Components compatible
- Suspense ready

✅ **DevTools Support**
- Redux DevTools compatible
- Time-travel debugging
- State inspection
- Action replay

✅ **Undo/Redo Ready**
- Easy to implement with middleware
- Snapshot-based history
- Configurable history size

### Negative

❌ **Less Ecosystem**
- Fewer middleware options than Redux
- Smaller community
- Less Stack Overflow answers
- Fewer learning resources

❌ **No Official Patterns**
- More flexibility = more decisions
- Team must establish conventions
- Can lead to inconsistent patterns

❌ **Immer Performance (Edge Cases)**
- Slight overhead for very large objects
- Deep cloning can be slow
- Not ideal for huge arrays (10k+ items)
- Our use case: small/medium state (fine)

❌ **Testing Complexity**
- Mocking Zustand stores requires setup
- Not as straightforward as plain reducers
- Need test utilities

### Mitigation Strategies

**For smaller ecosystem:**
- Document our patterns in CLAUDE.md
- Create reusable middleware
- Share learnings in team docs
- Leverage Redux DevTools ecosystem

**For pattern consistency:**
- Establish naming conventions (✅ Done in docs)
- Code review for state patterns
- Example stores as templates
- Store organization guidelines

**For Immer performance:**
- Monitor state size (stay small)
- Profile if performance issues
- Can disable Immer if needed
- Use selectors to limit re-renders

**For testing:**
- Create test utilities
- Mock storage layer (not state)
- Test components with real store
- Integration tests over unit tests

## Alternatives Considered

### Alternative 1: Redux Toolkit

**Approach:**
```typescript
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1; // Immer built-in
    }
  }
});
```

**Pros:**
- Industry standard (huge ecosystem)
- Excellent DevTools
- Rich middleware (thunks, saga, etc.)
- Immer built-in (Redux Toolkit)
- Lots of learning resources

**Cons:**
- More boilerplate (slices, actions, reducers)
- Steeper learning curve
- Larger bundle (~43 KB)
- More concepts to learn
- Overkill for our use case

**Why Rejected:**
Redux is powerful but heavy. We don't need:
- Time-travel debugging at Redux scale
- Complex async middleware
- Global action log
- Centralized reducer patterns

Zustand provides 80% of value with 20% of complexity.

### Alternative 2: React Context + useReducer

**Approach:**
```typescript
const StateContext = createContext<State>(null);
const DispatchContext = createContext<Dispatch>(null);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
  }
}

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}
```

**Pros:**
- Built into React (no dependencies)
- Familiar pattern
- Type-safe with TypeScript
- Simple for small apps

**Cons:**
- Manual immutability (verbose)
- Performance issues (all consumers re-render)
- No devtools
- No middleware ecosystem
- Boilerplate for selectors

**Why Rejected:**
Context is great for dependency injection, not state management. Every state change causes all consumers to re-render. Would need manual optimization with useMemo everywhere.

### Alternative 3: MobX

**Approach:**
```typescript
class Store {
  @observable count = 0;
  
  @action increment() {
    this.count++; // Truly mutable
  }
}

const store = new Store();

// Usage
const Counter = observer(() => (
  <button onClick={() => store.increment()}>
    {store.count}
  </button>
));
```

**Pros:**
- Truly mutable (no Immer needed)
- Automatic reactivity
- Less boilerplate than Redux
- Good performance

**Cons:**
- Decorators (TS config required)
- Class-based (not modern React)
- Magic reactivity (harder to debug)
- Larger bundle (~78 KB)
- Less TypeScript friendly

**Why Rejected:**
MobX's auto-reactivity is powerful but "magical". Harder to reason about what triggers updates. Class-based approach feels dated compared to modern React hooks. Zustand's explicit updates are clearer.

### Alternative 4: Jotai

**Approach:**
```typescript
const countAtom = atom(0);
const incrementAtom = atom(
  (get) => get(countAtom),
  (get, set) => set(countAtom, get(countAtom) + 1)
);

function Counter() {
  const [count, increment] = useAtom(incrementAtom);
  return <button onClick={increment}>{count}</button>;
}
```

**Pros:**
- Atomic state (fine-grained)
- Bottom-up approach
- Small bundle (~7 KB)
- Modern API

**Cons:**
- Different mental model (atoms)
- Learning curve for atoms
- Composition can get complex
- Less mature ecosystem

**Why Rejected:**
Jotai's atomic approach is interesting but adds conceptual overhead. Our state is hierarchical (project → bank → questions), which maps naturally to a single store. Atoms work better for flat, independent state pieces.

## Implementation Notes

### Store Organization

**Separation by scope:**
```
store/
├── core-store.ts        # Framework-level state
└── quiz-editor-store.ts # Tool-specific state
```

**Why separate stores:**
- Core Framework state (projects) shared across tools
- Quiz Editor state (banks, questions) tool-specific
- Clear boundaries prevent coupling
- Can load stores independently

### Undo/Redo Implementation

```typescript
interface UndoableState extends QuizEditorState {
  history: string[]; // Serialized snapshots
  historyIndex: number;
  
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

const useQuizEditorStore = create(
  immer<UndoableState>((set, get) => ({
    // ... existing state
    
    history: [],
    historyIndex: -1,
    
    pushHistory: () =>
      set((state) => {
        const snapshot = JSON.stringify({
          questions: state.questions,
          currentBank: state.currentBank
        });
        
        // Trim future if not at end
        state.history = state.history.slice(0, state.historyIndex + 1);
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
      })
  }))
);
```

### DevTools Integration

```typescript
import { devtools } from 'zustand/middleware';

const useQuizEditorStore = create(
  devtools(
    immer<QuizEditorState>((set) => ({
      // ... state
    })),
    { name: 'QuizEditorStore' }
  )
);
```

**Enables Redux DevTools:**
- Time-travel debugging
- Action history
- State diff viewer
- Export/import state

### Selectors (Performance Optimization)

```typescript
// ❌ Bad: Re-renders on any state change
const state = useQuizEditorStore();

// ✅ Good: Only re-renders when questions change
const questions = useQuizEditorStore((state) => state.questions);

// ✅ Best: Computed selector
const questionCount = useQuizEditorStore(
  (state) => state.questions.length
);

// Advanced: Shallow equality
import { shallow } from 'zustand/shallow';

const { questions, selectedId } = useQuizEditorStore(
  (state) => ({
    questions: state.questions,
    selectedId: state.selectedQuestionId
  }),
  shallow
);
```

### Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useQuizEditorStore } from './quiz-editor-store';

describe('QuizEditorStore', () => {
  beforeEach(() => {
    // Reset store
    useQuizEditorStore.setState({
      questions: [],
      currentBank: null,
      selectedQuestionId: null
    });
  });
  
  it('adds question', () => {
    const { result } = renderHook(() => useQuizEditorStore());
    
    act(() => {
      result.current.addQuestion(mockQuestion);
    });
    
    expect(result.current.questions).toHaveLength(1);
  });
});
```

## References

- **Zustand Documentation:** https://zustand-demo.pmnd.rs/
- **Immer Documentation:** https://immerjs.github.io/immer/
- **Store Implementations:**
  - [src/store/core-store.ts](../../src/store/core-store.ts)
  - [src/store/quiz-editor-store.ts](../../src/store/quiz-editor-store.ts)

## Related Decisions

- **ADR-0001:** Storage Adapter Pattern - Stores coordinate with storage
- **ADR-0005:** Core Framework Separation - Separate stores per layer

## Success Criteria

**This decision is successful if:**

1. ✅ Stores implemented with Zustand + Immer
2. ✅ Type-safe state updates throughout
3. 📋 Undo/redo works smoothly
4. 📋 Performance is acceptable during editing
5. 📋 DevTools provide useful debugging
6. 📋 Contributors find state management easy to understand

**Failure signals:**

- Performance issues during editing
- State bugs from immutability mistakes
- Contributors struggle with patterns
- Need to migrate to different library
- Excessive re-renders

## Review Schedule

- **Next Review:** After MVP implementation (test performance)
- **Revisit If:** Performance problems emerge
- **Benchmark:** Compare to Redux if considering migration
