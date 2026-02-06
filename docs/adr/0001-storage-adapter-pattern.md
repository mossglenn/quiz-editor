# ADR-0001: Use Storage Adapter Pattern

## Status
**Accepted** - 2025-02-04

## Context

We need to support multiple storage backends across different deployment scenarios:

**MVP (Cloud Edition):**
- Supabase (Postgres + Auth + RLS)
- Web-based storage
- Multi-user with permissions

**Future (Desktop Edition):**
- SQLite (local database)
- Single-user, offline-first
- File system integration

**Requirements:**
- Swap backends without rewriting UI code
- Test with mock storage in isolation
- Same data model works everywhere
- UI code independent of storage implementation

**Problem:**
Without abstraction, every component would directly call Supabase APIs. This creates:
- Tight coupling to specific backend
- Difficult testing (requires real database)
- Desktop app would require complete UI rewrite
- Can't swap providers (vendor lock-in)

## Decision

**Implement a StorageAdapter interface that abstracts all data persistence operations.**

```typescript
/**
 * Universal storage adapter interface.
 * All data access goes through this interface.
 */
export interface StorageAdapter {
  // Projects
  getProjects(): Promise<Project[]>
  getProject(id: string): Promise<Project | null>
  createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project>
  updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'description'>>): Promise<Project>
  deleteProject(id: string): Promise<void>

  // Artifacts
  getArtifacts(projectId: string, type?: string): Promise<Artifact[]>
  getArtifact(id: string): Promise<Artifact | null>
  saveArtifact(artifact: Artifact): Promise<void>
  deleteArtifact(id: string): Promise<void>

  // Links
  getLinks(projectId: string): Promise<ArtifactLink[]>
  saveLink(link: ArtifactLink): Promise<void>
  deleteLink(id: string): Promise<void>
}
```

**Implementation approach:**
1. UI components only import the interface
2. Concrete implementations (SupabaseAdapter, SQLiteAdapter) implement interface
3. Dependency injection at app initialization
4. Test with MockStorageAdapter

**Example usage:**
```typescript
// Component code (no backend coupling)
import { storageAdapter } from '@/lib/storage';

async function loadProjects() {
  const projects = await storageAdapter.getProjects();
  useCoreStore.getState().setProjects(projects);
}

// App initialization (inject implementation)
import { SupabaseStorageAdapter } from '@/lib/storage/supabase';

const storageAdapter = new SupabaseStorageAdapter({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
```

## Consequences

### Positive

✅ **Backend Independence**
- UI code works with any backend
- Swap Supabase → SQLite by changing one line
- No UI rewrite needed for desktop app

✅ **Testability**
- Test UI with mock storage
- No database needed for unit tests
- Faster test execution

✅ **Type Safety**
- Single interface ensures consistency
- TypeScript catches mismatches
- Clear contract for implementations

✅ **Future-Proof**
- Easy to add new backends (Firebase, PouchDB)
- Can support multiple backends simultaneously
- Plugin architecture ready

✅ **Clear Boundaries**
- Storage logic separated from UI logic
- Single responsibility per layer
- Easier to reason about data flow

### Negative

❌ **Extra Abstraction Layer**
- More code to maintain
- Learning curve for contributors
- One more thing that can break

❌ **Can't Use Backend-Specific Features**
- Must stick to common denominator
- Supabase realtime requires workaround
- Some optimizations not possible

❌ **Interface Evolution**
- Breaking changes affect all implementations
- Must version interface carefully
- Migration path needed for updates

### Mitigation Strategies

**For abstraction complexity:**
- Comprehensive JSDoc documentation (✅ Done)
- Clear examples in documentation
- Test suite for adapter implementations

**For backend-specific features:**
- Document which features work with which backends
- Use optional methods for advanced features
- Provide adapter-specific escape hatches

**For interface evolution:**
- Use semantic versioning for interface
- Provide migration guides
- Maintain backward compatibility when possible

## Alternatives Considered

### Alternative 1: Direct Supabase Calls

**Approach:**
```typescript
// Components directly use Supabase
import { supabase } from '@/lib/supabase';

async function loadProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*');
  
  if (error) throw error;
  return data;
}
```

**Pros:**
- Simpler code (fewer layers)
- Can use all Supabase features
- No abstraction overhead

**Cons:**
- Locks us into Supabase
- Desktop app requires complete rewrite
- Hard to test (needs real database)
- Supabase code scattered everywhere

**Why Rejected:**
Too much coupling. Desktop edition is a core feature (Phase 4), not optional. Rewriting all UI for desktop would be prohibitively expensive.

### Alternative 2: Repository Pattern with ORM

**Approach:**
```typescript
// Use traditional repository pattern
class ProjectRepository {
  constructor(private orm: ORM) {}
  
  async findAll(): Promise<Project[]> {
    return this.orm.projects.findMany();
  }
}
```

**Pros:**
- Industry standard pattern
- Rich ecosystem (TypeORM, Prisma)
- Built-in migrations

**Cons:**
- Heavy dependencies
- Learning curve
- Overengineered for our needs
- Still need abstraction over ORM

**Why Rejected:**
Too heavyweight. We need a thin abstraction that doesn't impose patterns. ORMs work great for traditional backends but add complexity for our dual Supabase/SQLite approach.

### Alternative 3: Dual Implementation from Start

**Approach:**
Build both SupabaseAdapter and SQLiteAdapter immediately.

**Pros:**
- Proves abstraction works
- No future surprises
- Clear contract from day one

**Cons:**
- Premature optimization
- Delays MVP
- SQLite requirements unknown
- May abstract wrong things

**Why Rejected:**
We don't know SQLite requirements yet. Better to build Supabase adapter, learn from it, then extract interface based on real needs. Will build SQLite adapter when starting desktop work (Phase 4).

## Implementation Notes

### Current Status (as of 2025-02-06)

**✅ Completed:**
- Storage interface defined with comprehensive JSDoc
- Type definitions for Artifact, Project, ArtifactLink
- Documentation with 31 examples
- Clear contract for implementations

**🚧 In Progress:**
- SupabaseStorageAdapter implementation
- Error handling patterns
- Testing strategy

**📋 Planned:**
- MockStorageAdapter for testing
- SQLiteAdapter (Phase 4)
- Migration utilities

### Design Principles

1. **Returns null (not undefined)** when entity not found
2. **Throws errors** on failures (not error objects)
3. **Async by default** (all methods return Promises)
4. **Transactions handled internally** by implementations
5. **RLS enforcement** in Supabase implementation

### Testing Approach

```typescript
// Mock adapter for testing
export class MockStorageAdapter implements StorageAdapter {
  private projects: Map<string, Project> = new Map();
  private artifacts: Map<string, Artifact> = new Map();
  
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async saveArtifact(artifact: Artifact): Promise<void> {
    this.artifacts.set(artifact.id, artifact);
  }
  
  // ... implement all methods
}
```

### Migration Strategy (Future)

When adding breaking changes to interface:

1. Create `StorageAdapterV2` interface
2. Implement adapters for both versions
3. Provide migration guide
4. Deprecate V1, maintain for 2 major versions
5. Remove V1 after adoption

## References

- **Interface Documentation:** [src/lib/storage/interface.ts](../../src/lib/storage/interface.ts)
- **Architecture Overview:** [.claude/CLAUDE.md](../../.claude/CLAUDE.md#3-offline-first-storage)
- **Type System:** [src/types/core/](../../src/types/core/)

## Related Decisions

- **ADR-0002:** Semantic Artifact Typing - Works with storage adapter
- **ADR-0005:** Core Framework Separation - Storage is framework-level

## Success Criteria

**This decision is successful if:**

1. ✅ Can implement SupabaseAdapter matching interface
2. 📋 UI components use interface (not concrete implementation)
3. 📋 Can swap to MockAdapter for testing
4. 📋 Can implement SQLiteAdapter (Phase 4) without changing UI
5. 📋 Interface accommodates both cloud and local storage

**Failure signals:**

- Interface doesn't support required operations
- Backend-specific code leaks into UI
- Testing still requires real database
- Desktop app requires UI changes

## Review Schedule

- **Next Review:** When implementing SQLiteAdapter (Phase 4)
- **Revisit If:** Major new storage requirements emerge
- **Success Validation:** After SupabaseAdapter proves pattern works
