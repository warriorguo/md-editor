# Markdown Editor API Reference

Base URL: `http://md-editor.local.playquota.com` (override with `MD_EDITOR_URL` env var)

All endpoints are prefixed with `/api`.

---

## Health Check

### `GET /health`

Check service availability.

**Response:**

```json
{ "status": "ok" }
```

---

## Projects

### `POST /api/projects`

Create a new project. Automatically creates an empty document attached to it.

**Request:**

```json
{
  "name": "string (required, 1-255 characters)"
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "name": "string",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- `400` - Name is missing or exceeds 255 characters

---

### `GET /api/projects`

List all projects, ordered by creation date (newest first). Soft-deleted projects are excluded.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-based) |
| `pageSize` | integer | 20 | Items per page |

**Response (200):**

```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "string",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "totalCount": 42,
  "page": 1,
  "pageSize": 20
}
```

---

### `GET /api/projects/:id`

Get a single project by ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Project ID |

**Response (200):**

```json
{
  "id": "uuid",
  "name": "string",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- `404` - Project not found or soft-deleted

---

### `PATCH /api/projects/:id`

Update a project's name.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Project ID |

**Request:**

```json
{
  "name": "string (required, 1-255 characters)"
}
```

**Response (200):**

```json
{
  "id": "uuid",
  "name": "string (updated)",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:01Z"
}
```

**Errors:**
- `400` - Name is missing or exceeds 255 characters
- `404` - Project not found or soft-deleted

---

### `DELETE /api/projects/:id`

Soft-delete a project and its associated document.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Project ID |

**Response:** `204 No Content`

**Errors:**
- `404` - Project not found or already deleted

---

## Documents

### `GET /api/projects/:id/document`

Get the document belonging to a project.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Project ID (not document ID) |

**Response Headers:**

| Header | Description |
|--------|-------------|
| `X-Document-Version` | Current document version number (integer) |

**Response (200):**

```json
{
  "id": "uuid (document ID)",
  "projectId": "uuid",
  "contentMd": "string (markdown content)",
  "version": 1,
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- `404` - Project not found, soft-deleted, or has no document

---

### `PUT /api/documents/:id`

Update a document's markdown content. Uses optimistic locking via the version header.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Document ID (not project ID) |

**Request Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-Document-Version` | Yes | Expected current version number |
| `Content-Type` | Yes | Must be `application/json` |

**Request:**

```json
{
  "contentMd": "string (new markdown content)"
}
```

**Response Headers:**

| Header | Description |
|--------|-------------|
| `X-Document-Version` | New version number after update |

**Response (200):**

```json
{
  "id": "uuid",
  "projectId": "uuid",
  "contentMd": "string (updated content)",
  "version": 2,
  "updatedAt": "2024-01-01T00:00:01Z"
}
```

**Errors:**
- `400` - Missing version header or invalid request body
- `404` - Document not found
- `409` - Version conflict (document was modified since last read)

---

## Data Model

### Project

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `name` | string | Project name (1-255 chars) |
| `createdAt` | timestamp | ISO 8601 with timezone |
| `updatedAt` | timestamp | ISO 8601 with timezone |

### Document

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `projectId` | UUID | Foreign key to project (unique, 1:1) |
| `contentMd` | string | Markdown content (may be empty) |
| `version` | integer | Optimistic lock version, starts at 1 |
| `updatedAt` | timestamp | ISO 8601 with timezone |

### Relationships

- Each **project** has exactly **one document** (created automatically with the project)
- Deleting a project cascades to its document
- Projects support soft delete (`deletedAt` field)

---

## Optimistic Locking Flow

```
Client A                    Server                    Client B
   |                          |                          |
   |--- GET document -------->|                          |
   |<-- version: 1 ----------|                          |
   |                          |<-- GET document ---------|
   |                          |--- version: 1 ---------->|
   |                          |                          |
   |--- PUT (version: 1) --->|                          |
   |<-- version: 2 ----------|                          |
   |                          |                          |
   |                          |<-- PUT (version: 1) -----|
   |                          |--- 409 Conflict -------->|
   |                          |                          |
   |                          |<-- GET document ---------|
   |                          |--- version: 2 ---------->|
   |                          |<-- PUT (version: 2) -----|
   |                          |--- version: 3 ---------->|
```

To resolve a conflict:
1. Re-fetch the document to get the latest version and content
2. Merge your changes with the latest content
3. Retry the PUT with the new version number
