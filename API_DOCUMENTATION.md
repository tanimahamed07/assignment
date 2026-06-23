# Preorders API Documentation

## Endpoints

1. **POST** `/api/preorders/list` - List preorders with filtering, sorting, and pagination
2. **POST** `/api/preorders/create` - Create a new preorder
3. **GET** `/api/preorders/{id}` - Get a single preorder by ID
4. **PUT** `/api/preorders/{id}` - Update preorder status only
5. **PUT** `/api/preorders/{id}/update` - Full update of all preorder fields
6. **DELETE** `/api/preorders/{id}` - Delete a preorder

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

## 2. Create Preorder

**POST** `/api/preorders/create`

Create a new preorder record.

### Request Body

| Parameter      | Type                      | Required | Description                                         |
| -------------- | ------------------------- | -------- | --------------------------------------------------- |
| `name`         | string                    | Yes      | Preorder name (non-empty)                           |
| `products`     | number                    | Yes      | Number of products (must be positive)               |
| `preorderWhen` | string                    | Yes      | Must be "regardless_of_stock"                       |
| `startsAt`     | string (ISO 8601)         | Yes      | Start date/time                                     |
| `endsAt`       | string (ISO 8601) or null | No       | End date/time (must be after startsAt)              |
| `status`       | boolean                   | No       | Active (true) or Inactive (false), defaults to true |

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Preorder created successfully",
  "data": {
    "id": 19,
    "name": "Test Product 2027",
    "products": 100,
    "preorderWhen": "regardless_of_stock",
    "startsAt": "2027-01-01T00:00:00.000Z",
    "endsAt": "2027-12-31T23:59:59.000Z",
    "status": true,
    "createdAt": "2026-06-23T03:00:00.000Z"
  }
}
```

### Error Responses

**400 Bad Request - Missing/Invalid Fields:**

```json
{
  "error": "Name is required and must be a non-empty string"
}
```

```json
{
  "error": "Products is required and must be a positive number"
}
```

```json
{
  "error": "endsAt must be after startsAt"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to create preorder",
  "message": "Error details here"
}
```

### Example Requests

#### 1. Create preorder with all fields

```bash
curl -X POST http://localhost:3000/api/preorders/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product 2027",
    "products": 150,
    "preorderWhen": "regardless_of_stock",
    "startsAt": "2027-01-01T00:00:00Z",
    "endsAt": "2027-12-31T23:59:59Z",
    "status": true
  }'
```

#### 2. Create preorder without end date

```bash
curl -X POST http://localhost:3000/api/preorders/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Open-ended Preorder",
    "products": 100,
    "preorderWhen": "regardless_of_stock",
    "startsAt": "2027-06-01T00:00:00Z"
  }'
```

### JavaScript/TypeScript Example

```typescript
const response = await fetch("http://localhost:3000/api/preorders/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "New Product 2027",
    products: 150,
    preorderWhen: "regardless_of_stock",
    startsAt: "2027-01-01T00:00:00Z",
    endsAt: "2027-12-31T23:59:59Z",
    status: true,
  }),
});

const result = await response.json();

if (result.success) {
  console.log("Created preorder ID:", result.data.id);
  console.log("Name:", result.data.name);
} else {
  console.error("Error:", result.error);
}
```

### Validation Rules

- **name**: Non-empty string (trimmed)
- **products**: Positive integer
- **preorderWhen**: Must be exactly "regardless_of_stock"
- **startsAt**: Valid ISO 8601 date string
- **endsAt**: Valid ISO 8601 date string or null; if provided, must be after startsAt
- **status**: Boolean, defaults to true if not provided

### Testing the Create Endpoint

```bash
npx tsx test-create-api.ts
```

---

## 3. Get Single Preorder

**GET** `/api/preorders/{id}`

Get a single preorder record by ID for viewing or editing.

### Path Parameters

| Parameter | Type   | Required | Description                 |
| --------- | ------ | -------- | --------------------------- |
| `id`      | number | Yes      | The preorder ID to retrieve |

### Success Response (200 OK)

```json
{
  "success": true,
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
  "error": "Failed to fetch preorder",
  "message": "Error details here"
}
```

### Example Requests

#### 1. Get preorder by ID

```bash
curl -X GET http://localhost:3000/api/preorders/1
```

#### 2. Get preorder for editing

```bash
curl -X GET http://localhost:3000/api/preorders/5
```

### JavaScript/TypeScript Example

```typescript
// Get preorder with ID 1
const response = await fetch("http://localhost:3000/api/preorders/1", {
  method: "GET",
});

const result = await response.json();

if (result.success) {
  console.log("Preorder:", result.data);
  console.log("Name:", result.data.name);
  console.log("Status:", result.data.status ? "Active" : "Inactive");
  console.log("Products:", result.data.products);
} else {
  console.error("Error:", result.error);
}
```

### Use Cases

- **Load data for editing:** Fetch the current state before showing an edit form
- **View details:** Display complete information about a preorder
- **Verify existence:** Check if a preorder exists before performing operations
- **Get current state:** Retrieve the latest data after updates

### Testing the GET Endpoint

Run the development server:

```bash
npm run dev
```

Then run the GET test script:

```bash
npx tsx test-get-api.ts
```

This will test:

- Successful retrieval by valid ID
- All fields are present in response
- Multiple preorders can be fetched individually
- Invalid ID formats
- Non-existent IDs
- Data type validation
- Integration with update operations

---

## 4. Update Preorder Status

**PUT** `/api/preorders/{id}`

Update only the status of a specific preorder.

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

```bash
npx tsx test-update-api.ts
```

---

## 5. Full Update Preorder

**PUT** `/api/preorders/{id}/update`

Update all fields of a specific preorder.

### Path Parameters

| Parameter | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| `id`      | number | Yes      | The preorder ID to update |

### Request Body

| Parameter      | Type                      | Required | Description                            |
| -------------- | ------------------------- | -------- | -------------------------------------- |
| `name`         | string                    | Yes      | Preorder name (non-empty)              |
| `products`     | number                    | Yes      | Number of products (must be positive)  |
| `preorderWhen` | string                    | Yes      | Must be "regardless_of_stock"          |
| `startsAt`     | string (ISO 8601)         | Yes      | Start date/time                        |
| `endsAt`       | string (ISO 8601) or null | No       | End date/time (must be after startsAt) |
| `status`       | boolean                   | Yes      | Active (true) or Inactive (false)      |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Preorder updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Product Name",
    "products": 250,
    "preorderWhen": "regardless_of_stock",
    "startsAt": "2027-01-01T00:00:00.000Z",
    "endsAt": "2027-12-31T23:59:59.000Z",
    "status": false,
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

**400 Bad Request - Invalid Field:**

```json
{
  "error": "Name is required and must be a non-empty string"
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

#### 1. Full update of all fields

```bash
curl -X PUT http://localhost:3000/api/preorders/1/update \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product 2027",
    "products": 200,
    "preorderWhen": "regardless_of_stock",
    "startsAt": "2027-06-01T00:00:00Z",
    "endsAt": "2027-12-31T23:59:59Z",
    "status": false
  }'
```

#### 2. Update with null end date

```bash
curl -X PUT http://localhost:3000/api/preorders/5/update \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Open-ended Product",
    "products": 150,
    "preorderWhen": "regardless_of_stock",
    "startsAt": "2027-03-01T00:00:00Z",
    "endsAt": null,
    "status": true
  }'
```

### JavaScript/TypeScript Example

```typescript
// Full update of preorder with ID 1
const response = await fetch("http://localhost:3000/api/preorders/1/update", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Updated Product 2027",
    products: 200,
    preorderWhen: "regardless_of_stock",
    startsAt: "2027-06-01T00:00:00Z",
    endsAt: "2027-12-31T23:59:59Z",
    status: false,
  }),
});

const result = await response.json();

if (result.success) {
  console.log("Updated:", result.data.name);
  console.log("All fields updated");
} else {
  console.error("Error:", result.error);
}
```

### Validation Rules

Same as Create endpoint:

- **name**: Non-empty string (trimmed)
- **products**: Positive integer
- **preorderWhen**: Must be exactly "regardless_of_stock"
- **startsAt**: Valid ISO 8601 date string
- **endsAt**: Valid ISO 8601 date string or null; if provided, must be after startsAt
- **status**: Boolean (required for full update)

### Testing the Full Update Endpoint

```bash
npx tsx test-full-update-api.ts
```

---

## 6. Delete Preorder

**DELETE** `/api/preorders/{id}`

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

## 4. Delete Preorder

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
