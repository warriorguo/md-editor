---
name: md-editor
description: >
  A persistent note record system for capturing and retrieving knowledge.
  Use this skill in two scenarios:
  (1) When you need to RECORD information — meeting notes, research findings, decisions,
  technical learnings, problem solutions, or any knowledge worth preserving. Before creating
  a new note, always check if a semantically similar topic already exists and append to it.
  (2) When you need to RECALL previous notes — search by topic to retrieve past records,
  look up decisions, reference earlier research, or review accumulated knowledge on a subject.
compatibility: Requires network access to the note service. Uses curl for HTTP requests.
allowed-tools: Bash(curl:*)
metadata:
  author: warriorguo
  version: "2.0"
  service-url: "http://md-editor.local.playquota.com"
---

# Note Record System

A persistent note service for recording and retrieving knowledge. Notes are organized by **topic** (the project name) with each topic holding one document of markdown content.

## Configuration

```
Base URL: http://md-editor.local.playquota.com
Override:  MD_EDITOR_URL environment variable
```

All API endpoints are prefixed with `/api`. Use `Content-Type: application/json` for request bodies.

---

## When to Use This Skill

### Scenario 1: Recording Notes

Use when you need to persist information — research results, decisions, meeting summaries, debugging insights, learned patterns, or anything the user may want to reference later.

**Workflow — think before you write:**

1. **Abstract the topic and content** — Before touching the API, determine:
   - What is the **topic**? (a short, descriptive title, e.g. "Auth Architecture Decisions", "Sprint 12 Retrospective", "PostgreSQL Performance Tuning")
   - What is the **content**? (the actual information to record, in well-structured markdown)

2. **Check for existing topics** — List all current topics and look for a **semantically similar** one:
   - "API Design Notes" and "API Design Decisions" are the same topic
   - "React Performance" and "Frontend Performance Optimization" overlap significantly
   - "Q1 OKRs" and "Q2 OKRs" are different topics

3. **Decide: update or create**
   - **Match found** → Read the existing note, then **append or merge** your new content into it
   - **No match** → Create a new topic and write the content

### Scenario 2: Recalling Previous Notes

Use when you need to look up information that was previously recorded — past decisions, research findings, accumulated knowledge on a subject.

**Workflow:**

1. **Identify what you're looking for** — a topic keyword, a subject area, or a time period
2. **List and scan topics** — Browse topic names to find relevant notes
3. **Read matching notes** — Fetch the content of relevant topics
4. **Synthesize if needed** — Information may be spread across multiple related topics

---

## API Quick Reference

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List topics | GET | `/api/projects?page=1&pageSize=100` |
| Create topic | POST | `/api/projects` |
| Rename topic | PATCH | `/api/projects/:id` |
| Delete topic | DELETE | `/api/projects/:id` |
| Read note | GET | `/api/projects/:id/document` |
| Write note | PUT | `/api/documents/:id` |

---

## Workflow 1: Record a Note

### Step 1 — List existing topics

```bash
curl -s "${MD_EDITOR_URL:-http://md-editor.local.playquota.com}/api/projects?page=1&pageSize=100"
```

Response:

```json
{
  "projects": [
    { "id": "uuid-1", "name": "Auth Architecture Decisions", "updatedAt": "..." },
    { "id": "uuid-2", "name": "PostgreSQL Performance Tuning", "updatedAt": "..." }
  ],
  "totalCount": 2,
  "page": 1,
  "pageSize": 100
}
```

Review the `name` field of each project. These are your existing topics. Perform **semantic matching** — do not just check for exact string equality. Consider synonyms, abbreviations, and overlapping subject areas.

> If `totalCount` exceeds `pageSize`, fetch additional pages to see all topics.

### Step 2a — Matching topic found: Append to existing note

Read the current content:

```bash
curl -s -D - "${MD_EDITOR_URL:-http://md-editor.local.playquota.com}/api/projects/<project-id>/document"
```

Note the `X-Document-Version` response header and the `id` and `contentMd` fields. Then **merge your new content** into the existing markdown (append a new section, update an existing section, etc.) and write it back:

```bash
curl -s -X PUT "${MD_EDITOR_URL:-http://md-editor.local.playquota.com}/api/documents/<doc-id>" \
  -H "Content-Type: application/json" \
  -H "X-Document-Version: <current-version>" \
  -d '{"contentMd": "<merged markdown content>"}'
```

### Step 2b — No matching topic: Create a new note

Create the topic:

```bash
curl -s -X POST "${MD_EDITOR_URL:-http://md-editor.local.playquota.com}/api/projects" \
  -H "Content-Type: application/json" \
  -d '{"name": "Your Topic Title"}'
```

Get the new (empty) document:

```bash
curl -s -D - "${MD_EDITOR_URL:-http://md-editor.local.playquota.com}/api/projects/<project-id>/document"
```

Write the content:

```bash
curl -s -X PUT "${MD_EDITOR_URL:-http://md-editor.local.playquota.com}/api/documents/<doc-id>" \
  -H "Content-Type: application/json" \
  -H "X-Document-Version: 1" \
  -d '{"contentMd": "# Your Topic Title\n\n## Context\n\n...\n\n## Details\n\n..."}'
```

---

## Workflow 2: Recall a Previous Note

### Step 1 — List and search topics

```bash
curl -s "${MD_EDITOR_URL:-http://md-editor.local.playquota.com}/api/projects?page=1&pageSize=100"
```

Scan the topic names for keywords related to what you're looking for. Consider:
- Direct keyword matches ("performance" in "PostgreSQL Performance Tuning")
- Semantic relevance ("database optimization" could relate to "PostgreSQL Performance Tuning")
- Broader categories (looking for "auth" could match "Auth Architecture Decisions", "OAuth2 Setup Guide", etc.)

### Step 2 — Read relevant notes

For each matching topic, fetch its content:

```bash
curl -s "${MD_EDITOR_URL:-http://md-editor.local.playquota.com}/api/projects/<project-id>/document"
```

The `contentMd` field holds the full markdown content of the note.

### Step 3 — Synthesize across topics

If information is spread across multiple notes, read all relevant ones and synthesize a coherent answer for the user.

---

## Content Guidelines

When recording notes, structure them well for future retrieval:

```markdown
# Topic Title

## Context
Why this note exists, what prompted it.

## Key Points
- Point 1
- Point 2

## Details
In-depth content...

## References
Links, related topics, sources.

---
*Recorded: 2024-01-15*
```

When **appending** to an existing note, add a clear section separator:

```markdown
---

## [New Section Title]
*Added: 2024-02-20*

New content here...
```

---

## Error Handling

| Status | Meaning | Action |
|--------|---------|--------|
| 400 | Invalid input | Check request body and topic name (1-255 chars) |
| 404 | Topic not found | Verify the ID; topic may have been deleted |
| 409 | Version conflict | Re-fetch note, merge changes, retry with new version |
| 500 | Server error | Retry after a moment |

## Notes

- Topic names (project names) must be 1-255 characters
- All IDs are UUIDs
- Each topic holds exactly one note document (1:1)
- Deleted topics are soft-deleted and excluded from listings
- Documents use optimistic locking — always send `X-Document-Version` header when writing

See [references/API.md](references/API.md) for the complete API reference with full request/response schemas.
