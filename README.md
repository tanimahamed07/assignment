# Preorders Management API

A Next.js 16 application with a fully functional REST API for managing preorders. Built with TypeScript, Prisma ORM, and SQLite database.

## 🚀 Features

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Prisma 7** ORM with SQLite database
- **RESTful API** with full CRUD operations
- **Filtering & Sorting** capabilities
- **Pagination** support
- **Comprehensive validation** and error handling

## 📋 Prerequisites

- Node.js 18+
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Generate Prisma Client:**

   ```bash
   npx prisma generate
   ```

3. **Run database migrations:**

   ```bash
   npx prisma migrate dev
   ```

4. **Seed the database:**
   ```bash
   npx prisma db seed
   ```
   This will create 18 sample preorder records with a mix of active/inactive statuses.

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 📚 API Endpoints

### 1. List Preorders

**POST** `/api/preorders/list`

Get a paginated, filtered, and sorted list of preorders.

**Request Body:**

```json
{
  "filter": "all", // "all" | "active" | "inactive"
  "sortBy": "name", // "name" | "products" | "startsAt"
  "sortOrder": "asc", // "asc" | "desc"
  "page": 1, // Page number (default: 1)
  "limit": 10 // Items per page (default: 10, max: 100)
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/preorders/list \
  -H "Content-Type: application/json" \
  -d '{"filter": "active", "sortBy": "products", "sortOrder": "desc"}'
```

### 2. Update Preorder Status

**PUT** `/api/preorders/{id}`

Update the status of a specific preorder.

**Request Body:**

```json
{
  "status": true // true = Active, false = Inactive
}
```

**Example:**

```bash
curl -X PUT http://localhost:3000/api/preorders/1 \
  -H "Content-Type: application/json" \
  -d '{"status": false}'
```

### 3. Delete Preorder

**DELETE** `/api/preorders/{id}`

Delete a specific preorder.

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/preorders/1
```

## 🧪 Testing

Test scripts are provided to verify all endpoints:

### Test List Endpoint

```bash
npx tsx test-api.ts
```

### Test Update Endpoint

```bash
npx tsx test-update-api.ts
```

### Test Delete Endpoint

```bash
npx tsx test-delete-api.ts
```

### Test All Endpoints

```bash
npx tsx test-all-apis.ts
```

**Note:** The delete test will remove preorders. Restore with:

```bash
npx prisma db seed
```

## 📊 Database Schema

### Preorder Model

| Field        | Type      | Description                                  |
| ------------ | --------- | -------------------------------------------- |
| id           | Int       | Primary key, auto-increment                  |
| name         | String    | Preorder name                                |
| products     | Int       | Number of products                           |
| preorderWhen | Enum      | When to allow preorder (regardless_of_stock) |
| startsAt     | DateTime  | Preorder start date                          |
| endsAt       | DateTime? | Preorder end date (nullable)                 |
| status       | Boolean   | Active (true) or Inactive (false)            |
| createdAt    | DateTime  | Record creation timestamp                    |

## 🗂️ Project Structure

```
├── app/
│   ├── api/
│   │   └── preorders/
│   │       ├── [id]/
│   │       │   └── route.ts       # PUT & DELETE endpoints
│   │       └── list/
│   │           └── route.ts       # POST list endpoint
│   ├── layout.tsx
│   └── page.tsx
├── prisma/
│   ├── migrations/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Database seeding script
├── test-api.ts                    # List endpoint tests
├── test-update-api.ts             # Update endpoint tests
├── test-delete-api.ts             # Delete endpoint tests
├── test-all-apis.ts               # Comprehensive tests
├── API_DOCUMENTATION.md           # Detailed API docs
└── README.md
```

## 🔧 Database Management

### View Database

```bash
npx prisma studio
```

Opens a visual database browser at `http://localhost:5555`

### Reset Database

```bash
npx prisma migrate reset
```

This will drop the database, recreate it, and run seeds.

### Create New Migration

```bash
npx prisma migrate dev --name migration_name
```

## 📖 Documentation

Detailed API documentation with examples is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🛡️ Error Handling

All endpoints include comprehensive error handling:

- **400 Bad Request** - Invalid parameters or request body
- **404 Not Found** - Resource doesn't exist
- **500 Internal Server Error** - Server-side errors

Error responses include helpful messages:

```json
{
  "error": "Invalid ID. Must be a positive integer"
}
```

## 🎯 Sample Data

The seed includes 18 diverse preorders:

- 14 active preorders
- 4 inactive preorders
- Various products (phones, gaming consoles, laptops, etc.)
- Different date ranges and product counts

## 📝 License

This project is for demonstration purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!
