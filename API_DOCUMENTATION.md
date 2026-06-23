# Preorders List API Documentation

## Endpoint

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
