# ADR-0003: Use Tiptap JSON for Rich Text

## Status
**Accepted** - 2025-02-04

## Context

Instructional designers need rich text formatting for:
- Question prompts (bold, italic, lists, images)
- Answer choices (formatted text)
- Feedback messages (structured content)
- Learning objectives (emphasis, links)

**Requirements:**
- WYSIWYG editing experience
- Structured (not HTML soup)
- Version-able and diff-able
- Editor-agnostic storage
- Safe (no XSS vulnerabilities)

**Use Cases:**

**Basic Formatting:**
```
What is photosynthesis?
```
Needs to support:
- **Bold** and *italic* text
- Inline code: `chlorophyll`
- Links: [Learn more](https://example.com)

**Complex Content:**
```
Consider the following scenario:

1. Plant receives sunlight
2. Chloroplasts absorb light energy
3. Chemical reaction produces glucose

Which step requires chlorophyll?
```

Needs to support:
- Multiple paragraphs
- Ordered/unordered lists
- Nested content
- Structured formatting

**Challenge:**
How do we store rich text that:
- Works with any editor (not locked to specific WYSIWYG)
- Can be validated and transformed
- Survives export/import
- Enables semantic analysis (future AI features)

## Decision

**Store all rich text content as Tiptap JSON format, not HTML strings.**

### Tiptap JSON Structure

```typescript
/**
 * Root document node
 */
export interface TiptapJSON {
  type: 'doc';
  content: TiptapNode[];
}

/**
 * Node in document tree
 */
export interface TiptapNode {
  type: string;                    // 'paragraph', 'heading', 'list'
  content?: TiptapNode[];          // Nested nodes
  text?: string;                   // Text content (text nodes only)
  marks?: TiptapMark[];            // Formatting (bold, italic, link)
  attrs?: Record<string, unknown>; // Node-specific attributes
}

/**
 * Inline formatting mark
 */
export interface TiptapMark {
  type: string;                    // 'bold', 'italic', 'link'
  attrs?: Record<string, unknown>; // Mark-specific attributes
}
```

### Example: Simple Paragraph

**Visual:**
```
What is **photosynthesis**?
```

**Storage (Tiptap JSON):**
```json
{
  "type": "doc",
  "content": [{
    "type": "paragraph",
    "content": [
      { "type": "text", "text": "What is " },
      { 
        "type": "text", 
        "text": "photosynthesis",
        "marks": [{ "type": "bold" }]
      },
      { "type": "text", "text": "?" }
    ]
  }]
}
```

### Example: Complex Structure

**Visual:**
```
Consider the following:

1. Step one
2. Step two
   - Sub-item A
   - Sub-item B

See [reference](https://example.com)
```

**Storage (Tiptap JSON):**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Consider the following:" }
      ]
    },
    {
      "type": "orderedList",
      "content": [
        {
          "type": "listItem",
          "content": [{
            "type": "paragraph",
            "content": [{ "type": "text", "text": "Step one" }]
          }]
        },
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "Step two" }]
            },
            {
              "type": "bulletList",
              "content": [
                {
                  "type": "listItem",
                  "content": [{
                    "type": "paragraph",
                    "content": [{ "type": "text", "text": "Sub-item A" }]
                  }]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "See " },
        {
          "type": "text",
          "text": "reference",
          "marks": [{
            "type": "link",
            "attrs": { "href": "https://example.com" }
          }]
        }
      ]
    }
  ]
}
```

### Empty Document

```typescript
const emptyDocument: TiptapJSON = {
  type: 'doc',
  content: []
};
```

## Consequences

### Positive

✅ **Structured Format**
- Can validate structure
- Query content programmatically
- Transform systematically
- Parse without HTML parsing

✅ **Version Control Friendly**
- JSON diff shows meaningful changes
- Git merge conflicts understandable
- Can track formatting changes

✅ **Editor Agnostic**
- Not locked to Tiptap editor
- Can render with any system
- Export to HTML/Markdown/LaTeX
- Future editor swaps possible

✅ **Type Safe**
- TypeScript interfaces available
- Compile-time validation
- IDE autocomplete works
- Reduced runtime errors

✅ **XSS Safe**
- No HTML injection possible
- Controlled node types
- Validated attribute schemas
- Secure by default

✅ **Future AI Features**
- Semantic analysis possible
- Content extraction easy
- Automated transformations
- NLP processing enabled

### Negative

❌ **Tiptap Coupling (Partial)**
- Schema matches Tiptap's structure
- Must understand Tiptap concepts
- Migration if Tiptap abandoned
- Learning curve for contributors

❌ **Verbose Storage**
- More bytes than HTML
- Nested structure overhead
- Repeated type fields
- Could compress for storage

❌ **Conversion Required**
- Must convert to/from HTML
- Plain text extraction needed
- Export formats require transformation
- Additional processing layer

### Mitigation Strategies

**For Tiptap coupling:**
- Document format independently of Tiptap
- Provide JSON schema for validation
- Create conversion utilities (JSON ↔ HTML)
- Consider ProseMirror JSON (Tiptap's base) as standard

**For verbose storage:**
- Store as JSONB in Postgres (native compression)
- Use JSON.stringify without whitespace
- Consider compression for large documents
- Trade storage for query-ability (worth it)

**For conversion overhead:**
- Cache HTML rendering where needed
- Lazy conversion (only when displaying)
- Utility functions for common operations
- Libraries exist (Tiptap provides converters)

## Alternatives Considered

### Alternative 1: HTML Strings

**Approach:**
```typescript
{
  prompt: '<p>What is <strong>photosynthesis</strong>?</p>'
}
```

**Pros:**
- Simple to store (single string)
- Native browser rendering
- Compact representation
- Familiar format

**Cons:**
- XSS vulnerabilities (need sanitization)
- Unstructured (can't query)
- Diff unfriendly (HTML parsing required)
- Editor-specific HTML quirks
- Can't validate structure

**Why Rejected:**
Security concerns (XSS) and lack of structure. HTML is an output format, not a data model. Would need HTML sanitizer, structural validation, and HTML-to-JSON conversion anyway.

### Alternative 2: Markdown

**Approach:**
```typescript
{
  prompt: 'What is **photosynthesis**?'
}
```

**Pros:**
- Human readable
- Version control friendly
- Compact
- Standard format

**Cons:**
- Limited formatting (no colors, complex layouts)
- Parsing required for rendering
- Ambiguous edge cases
- Can't represent all HTML features
- Syntax conflicts (e.g., underscores in code)

**Why Rejected:**
Markdown is great for documentation but insufficient for rich instructional content. Can't represent:
- Font colors (for emphasis)
- Inline images with positioning
- Complex tables
- Custom components

We'd end up inventing Markdown extensions, defeating the purpose.

### Alternative 3: ProseMirror JSON (Tiptap's Base)

**Approach:**
Use ProseMirror document format directly.

**Pros:**
- Tiptap built on ProseMirror
- More editor implementations exist
- Established standard
- Rich ecosystem

**Cons:**
- More complex schema
- Harder to document
- Tiptap is simpler subset
- Still editor coupling

**Why Considered:**
This is a viable alternative. Tiptap JSON IS ProseMirror JSON with Tiptap-specific extensions. We're implicitly using ProseMirror format. If Tiptap becomes problematic, we can migrate to pure ProseMirror with minimal changes.

**Decision:** Use Tiptap JSON for now (it's ProseMirror under hood), document as "ProseMirror-compatible" for future flexibility.

### Alternative 4: Custom JSON Schema

**Approach:**
```typescript
{
  blocks: [
    { type: 'text', value: 'What is ', bold: false },
    { type: 'text', value: 'photosynthesis', bold: true },
    { type: 'text', value: '?', bold: false }
  ]
}
```

**Pros:**
- Fully custom (total control)
- Optimized for our needs
- No dependencies

**Cons:**
- Reinventing wheel
- No editor support
- Must build everything
- No ecosystem

**Why Rejected:**
Not invented here syndrome. Tiptap JSON is a mature, well-designed format with editor support. Building custom would delay MVP significantly.

## Implementation Notes

### Conversion Utilities

**Plain Text Extraction:**
```typescript
/**
 * Extract plain text from Tiptap JSON
 */
function tiptapToPlainText(doc: TiptapJSON): string {
  return doc.content
    .map(node => extractText(node))
    .join('\n');
}

function extractText(node: TiptapNode): string {
  if (node.text) return node.text;
  if (node.content) {
    return node.content.map(extractText).join('');
  }
  return '';
}
```

**HTML Conversion:**
```typescript
/**
 * Convert Tiptap JSON to HTML
 * (Tiptap provides generateHTML utility)
 */
import { generateHTML } from '@tiptap/html';

const html = generateHTML(tiptapJSON, extensions);
```

**Storyline Export:**
```typescript
/**
 * Convert to plain text for Storyline CSV
 * (Storyline doesn't support rich text in CSV)
 */
function exportToStoryline(question: QuizQuestion): string {
  return tiptapToPlainText(question.data.prompt);
}
```

### Validation Schema

```typescript
/**
 * Validate Tiptap JSON structure
 */
const TiptapNodeSchema = z.object({
  type: z.string(),
  content: z.array(z.lazy(() => TiptapNodeSchema)).optional(),
  text: z.string().optional(),
  marks: z.array(z.object({
    type: z.string(),
    attrs: z.record(z.unknown()).optional()
  })).optional(),
  attrs: z.record(z.unknown()).optional()
});

const TiptapJSONSchema = z.object({
  type: z.literal('doc'),
  content: z.array(TiptapNodeSchema)
});
```

### Storage Considerations

**Postgres JSONB:**
- Stored as JSONB column (native JSON with indexing)
- Can query JSON structure with Postgres operators
- Automatic compression
- Efficient storage

**Example query:**
```sql
-- Find questions mentioning 'photosynthesis' in prompt
SELECT * FROM artifacts
WHERE type = 'quiz-question'
  AND data->'prompt'->>'content' @> '[{"text": "photosynthesis"}]';
```

### Editor Integration

```typescript
/**
 * Tiptap editor setup
 */
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
  extensions: [StarterKit],
  content: question.data.prompt, // TiptapJSON
  onUpdate: ({ editor }) => {
    const json = editor.getJSON(); // Get TiptapJSON
    updateQuestion({ prompt: json });
  }
});
```

## References

- **Tiptap Documentation:** https://tiptap.dev/guide/output#option-1-json
- **ProseMirror:** https://prosemirror.net/
- **Type Definitions:** [src/types/core/artifact.ts](../../src/types/core/artifact.ts)
- **Quiz Editor Types:** [src/types/quiz-editor/question.ts](../../src/types/quiz-editor/question.ts)

## Related Decisions

- **ADR-0002:** Semantic Artifact Typing - TiptapJSON used in v2.0.0 schema
- **ADR-0005:** Core Framework Separation - TiptapJSON in core types

## Success Criteria

**This decision is successful if:**

1. ✅ Can store formatted text in Tiptap JSON
2. 📋 Tiptap editor works with stored JSON
3. 📋 Can export to plain text (Storyline)
4. 📋 Can convert to HTML for display
5. 📋 Version control diffs are readable
6. 📋 Can validate JSON structure
7. 📋 XSS attacks prevented

**Failure signals:**

- Format can't represent needed content
- Conversion to/from HTML is lossy
- Storage overhead becomes problematic
- Editor coupling prevents flexibility
- Security vulnerabilities discovered

## Review Schedule

- **Next Review:** After implementing Tiptap editor (MVP)
- **Revisit If:** Format limitations discovered
- **Migration Decision:** If Tiptap abandoned or ProseMirror adoption grows
