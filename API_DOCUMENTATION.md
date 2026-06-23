# Preorders API Documentation

## Endpoints

1. **POST** `/api/preorders/list` - List preorders with filtering, sorting, and pagination
2. **PUT** `/api/preorders/{id}` - Update preorder status
3. **DELETE** `/api/preorders/{id}` - Delete a preorder

---

## 1. List Preorders

**POST** `/api/preorders/list`

## Request Body Parameters

All parameters are optional and have default values:

| Parameter   | Type   | Default  | Options                              | Description                |
| ----------- | ------ | -------- | ------------------------------------ | -------------------------- |
| `filter`    | string | `"all"`  | `"all"`, `"active"`, `"inactive"`    | Filter preorders by status |
| `sortBy`    | string | `"name"` | `"name"`, `"products"`, `"startsAt"` | Field to sort by           |
| `sortOrder` | string | `"asc"`  | `"asc"`, `"desc"`                    | Sort direction             |
| `page`      | number | `1`      | Min: 1                               | Page number for pagination |
| `limit`     | number | `10`     | Min: 1, Max: 100                     | Number of records per page |

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "iPhone 16 Pro Max",
      "products": 150,
      "preorderWhen": "regardless_of_stock",
      "startsAt": "2026-01-15T09:00:00.000Z",
      "endsAt": "2026-12-31T23:59:59.000Z",
      "status": true,
      "createdAt": "2026-06-23T02:40:47.858Z"
    }
    // ... more records
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 18,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "filter": "all",
  "sortBy": "name",
  "sortOrder": "asc"
}
```

### Error Response (400 Bad Request)

```json
{
  "error": "Invalid filter. Must be 'all', 'active', or 'inactive'"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Failed to fetch preorders",
  "message": "Error details here"
}
```

## Example Requests

### 1. Get all preorders (default)

```bash
curl -X POST http://localhost:3000/api/preorders/list \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 2. Get active preorders, sorted by products (descending)

```bash
curl -X POST http://localhost:3000/api/preorders/list \
  -H "Content-Type: application/json" \
  -d '{
    "filter": "active",
    "sortBy": "products",
    "sortOrder": "desc"
  }'
```

### 3. Get inactive preorders with pagination

```bash
curl -X POST http://localhost:3000/api/preorders/list \
  -H "Content-Type: application/json" \
  -d '{
    "filter": "inactive",
    "page": 1,
    "limit": 5
  }'
```

### 4. Sort by start date (earliest first)

```bash
curl -X POST http://localhost:3000/api/preorders/list \
  -H "Content-Type: application/json" \
  -d '{
    "sortBy": "startsAt",
    "sortOrder": "asc",
    "limit": 20
  }'
```

### 5. Get page 2 with custom limit

```bash
curl -X POST http://localhost:3000/api/preorders/list \
  -H "Content-Type: application/json" \
  -d '{
    "page": 2,
    "limit": 5
  }'
```

## JavaScript/TypeScript Example

```typescript
const response = await fetch("http://localhost:3000/api/preorders/list", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    filter: "active",
    sortBy: "products",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  }),
});

const result = await response.json();
console.log(result.data); // Array of preorders
console.log(result.pagination); // Pagination metadata
```

## Validation Rules

- `filter`: Must be one of: `"all"`, `"active"`, `"inactive"`
- `sortBy`: Must be one of: `"name"`, `"products"`, `"startsAt"`
- `sortOrder`: Must be one of: `"asc"`, `"desc"`
- `page`: Must be ≥ 1
- `limit`: Must be between 1 and 100 (inclusive)

## Testing

Run the development server:

```bash
npm run dev
```

Then run the test script:

```bash
npx tsx test-api.ts
```

This will test various combinations of filters, sorting, and pagination.

---

## 2. Update Preorder Status

**PUT** `/api/preorders/{id}`

### Path Parameters

| Parameter | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| `id`      | number | Yes      | The preorder ID to update |

### Request Body

| Parameter | Type    | Required | Description                                        |
| --------- | ------- | -------- | -------------------------------------------------- |
| `status`  | boolean | Yes      | New status value (true = Active, false = Inactive) |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Preorder status updated to Active",
  "data": {
    "id": 1,
    "name": "iPhone 16 Pro Max",
    "products": 150,
    "preorderWhen": "regardless_of_stock",
    "startsAt": "2026-01-15T09:00:00.000Z",
    "endsAt": "2026-12-31T23:59:59.000Z",
    "status": true,
    "createdAt": "2026-06-23T02:40:47.858Z"
  }
}
```

### Error Responses

**400 Bad Request - Invalid ID:**

```json
{
  "error": "Invalid ID. Must be a positive integer"
}
```

**400 Bad Request - Invalid Status:**

```json
{
  "error": "Invalid status. Must be a boolean value (true or false)"
}
```

**404 Not Found:**

```json
{
  "error": "Preorder with ID 99999 not found"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to update preorder",
  "message": "Error details here"
}
```

### Example Requests

#### 1. Activate a preorder

```bash
curl -X PUT http://localhost:3000/api/preorders/1 \
  -H "Content-Type: application/json" \
  -d '{"status": true}'
```

#### 2. Deactivate a preorder

```bash
curl -X PUT http://localhost:3000/api/preorders/5 \
  -H "Content-Type: application/json" \
  -d '{"status": false}'
```

### JavaScript/TypeScript Example

```typescript
// Activate preorder with ID 1
const response = await fetch("http://localhost:3000/api/preorders/1", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    status: true,
  }),
});

const result = await response.json();
console.log(result.message); // "Preorder status updated to Active"
console.log(result.data); // Updated preorder object
```

### Testing the Update Endpoint

Run the development server:

```bash
npm run dev
```

Then run the update test script:

```bash
npx tsx test-update-api.ts
```

This will test:

- Valid status updates
- Toggling status back and forth
- Invalid ID formats
- Non-existent IDs
- Invalid status types
- Missing status field
- Multiple sequential updates

---

## 3. Delete Preorder

**DELETE** `/api/preorders/{id}`

### Path Parameters

| Parameter | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| `id`      | number | Yes      | The preorder ID to delete |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Preorder \"iPhone 16 Pro Max\" successfully deleted",
  "data": {
    "id": 1,
    "name": "iPhone 16 Pro Max",
    "products": 150,
    "preorderWhen": "regardless_of_stock",
    "startsAt": "2026-01-15T09:00:00.000Z",
    "endsAt": "2026-12-31T23:59:59.000Z",
    "status": true,
    "createdAt": "2026-06-23T02:40:47.858Z"
  }
}
```

### Error Responses

**400 Bad Request - Invalid ID:**

```json
{
  "error": "Invalid ID. Must be a positive integer"
}
```

**404 Not Found:**

```json
{
  "error": "Preorder with ID 99999 not found"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to delete preorder",
  "message": "Error details here"
}
```

### Example Requests

#### 1. Delete a preorder

```bash
curl -X DELETE http://localhost:3000/api/preorders/1
```

#### 2. Delete with error handling

```bash
curl -X DELETE http://localhost:3000/api/preorders/99999
# Returns 404 if not found
```

### JavaScript/TypeScript Example

```typescript
// Delete preorder with ID 1
const response = await fetch("http://localhost:3000/api/preorders/1", {
  method: "DELETE",
});

const result = await response.json();

if (result.success) {
  console.log(result.message); // "Preorder \"iPhone 16 Pro Max\" successfully deleted"
  console.log("Deleted:", result.data); // Deleted preorder object
} else {
  console.error("Error:", result.error);
}
```

### Testing the Delete Endpoint

Run the development server:

```bash
npm run dev
```

Then run the delete test script:

```bash
npx tsx test-delete-api.ts
```

This will test:

- Successful deletion
- Verification that deletion persisted
- Attempting to delete already deleted record
- Invalid ID formats
- Non-existent IDs
- Count verification after deletions

**⚠️ Warning:** The delete test will remove 2 preorders from the database. To restore the original seed data, run:

```bash
npx prisma db seed
```
