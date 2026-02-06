# Refactor Tracking: IDIDE vs Quiz Editor

## Known Coupling Points (For Tool #2 Extraction)

### 1. Type System ✅ RESOLVED

- [x] Separated into `types/idide/` and `types/quiz-editor/`
- [x] Quiz types have `Quiz` prefix
- [x] Common types extracted to `idide/common.ts`

### 2. Store Architecture ✅ RESOLVED

- [x] Separated into `idide-store.ts` and `quiz-editor-store.ts`
- [x] Old `app-store.ts` deleted
- [x] Clear boundaries maintained

### 3. Component Organization ⏳ TODO

- [ ] Create `components/idide/` directory
- [ ] Create `components/quiz-editor/` directory
- [ ] Name components with `Quiz` prefix

### 4. Route Structure ⏳ TODO

- Current: `/projects/[id]` → directly to banks (Quiz Editor-specific)
- Future: `/projects/[id]` → tool selector
- Document in route files when creating them

### 5. Storage Adapter ✅ READY

- [x] Interface uses framework types
- [ ] Implement SupabaseAdapter (next step)

## Refactor Trigger: Building Tool #2

When we start building a second tool:

1. Extract shared patterns to `@idide/core` package
2. Move Quiz Editor to `@idide/plugin-quiz-editor`
3. Update imports
4. Create plugin manifest system
