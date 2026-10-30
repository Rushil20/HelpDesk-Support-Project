# Helpdesk Lite – Support Ticket Tracker Backend API

Helpdesk Lite is a production-ready, lightweight REST API backend for a support ticket management system built with Node.js LTS, Express, TypeScript, and MongoDB (Mongoose).

---

## Features

- **Authentication & Security**: Argon2id password hashing, JWT Bearer tokens, Helmet security headers, CORS origin protection, rate limiting, and request sanitization.
- **Three Fixed User Roles**: `employee`, `agent`, and `admin` using a simple string enum on the user document. No dynamic RBAC or complex permission matrices.
- **Idempotent User Seeding**: Automated startup seeding creates default `admin`, `agent`, and `employee` accounts safely without overwriting existing data.
- **User Management (Admin)**: Full CRUD on users with pagination, regex searching, role/status filtering, and dedicated Employee ⇄ Agent promotion/demotion API.
- **Ticket Management**:
  - Employees create and view only their own tickets.
  - Agents create tickets on behalf of employees, view all tickets, assign tickets, and update status/priority.
  - Admins have full oversight.
  - Deterministic filtering, pagination, sorting, and soft deletion (`deletedAt`).
  - **Transaction-Guaranteed Uniqueness**: Prevents duplicate active tickets with the same title per user using MongoDB transactions and partial unique indexing.
- **Ticket Comments & Conversation Model**:
  - One `comments` collection storing text messages, attachment-only messages, or both.
  - Chronological ordering using `{ ticketId: 1, createdAt: 1, _id: 1 }`.
  - Read/unread status management.
  - Attachment metadata tracking (compatible with future S3 / object storage integration).
- **Validation & Error Handling**: Strict schema validation with Zod on body, query, and path parameters, centralized error handling with custom `ApiError` and `ApiResponse`.
- **Automated Test Suite**: 45 unit and integration tests powered by Vitest, Supertest, and MongoMemoryServer.

---

## Technology Stack

- **Runtime**: Node.js v20+ LTS
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js v5
- **Database**: MongoDB 8 (via Mongoose v9)
- **Authentication**: JWT (`jsonwebtoken`)
- **Password Hashing**: Argon2id (`argon2`)
- **Validation**: Zod v4
- **Security**: Helmet, CORS, `express-rate-limit`
- **Logging**: Winston
- **Testing**: Vitest, Supertest, `mongodb-memory-server`

---

## Architecture & Directory Structure

```
src/
├── config/
│   ├── constants.ts         # Enums: UserRole, UserStatus, TicketPriority, TicketStatus
│   ├── env.ts               # Zod-validated environment configuration
│   └── seed.ts              # Idempotent default user seeding
├── connection/
│   └── mongodb.ts           # Mongoose connection & lifecycle handlers
├── controllers/
│   ├── auth.controller.ts   # Auth handlers (register, login, me)
│   ├── user.controller.ts   # User CRUD & role change handlers
│   ├── ticket.controller.ts # Ticket CRUD & assignment handlers
│   └── comment.controller.ts# Comment message & read status handlers
├── helpers/
│   ├── auth.helper.ts       # User sanitization
│   ├── ticket.helper.ts     # Resource ownership & authorization checks
│   └── index.ts
├── middlewares/
│   ├── auth.middleware.ts   # JWT verification & fresh user DB lookup
│   ├── role.middleware.ts   # Simple enum-based role authorization
│   ├── validation.middleware.ts # Zod request validation
│   ├── error.middleware.ts  # Centralized error handler
│   └── notFound.middleware.ts# 404 handler
├── models/
│   ├── user.model.ts        # User schema (Argon2id, role enum)
│   ├── ticket.model.ts      # Ticket schema (soft-delete, references)
│   └── comment.model.ts     # Comment/message schema with attachments
├── routes/
│   ├── auth.routes.ts       # /api/v1/auth
│   ├── user.routes.ts       # /api/v1/users
│   ├── ticket.routes.ts     # /api/v1/tickets & nested /comments
│   ├── comment.routes.ts    # /api/v1/comments
│   └── index.ts             # Aggregator router & /health
├── services/
│   ├── auth.service.ts      # Auth business logic
│   ├── user.service.ts      # User management queries & business rules
│   ├── ticket.service.ts    # Ticket lifecycle & ownership enforcement
│   └── comment.service.ts   # Comment ordering & read status logic
├── types/
│   ├── auth.types.ts
│   ├── common.types.ts
│   └── express.d.ts
├── utils/
│   ├── ApiError.ts
│   ├── ApiResponse.ts
│   ├── asyncHandler.ts
│   ├── jwt.ts
│   ├── logger.ts
│   ├── password.ts
│   └── index.ts
├── validators/
│   ├── auth.validator.ts
│   ├── user.validator.ts
│   ├── ticket.validator.ts
│   └── comment.validator.ts
├── app.ts                   # Express application setup
└── server.ts                # Application startup & graceful shutdown
```

---

## Role & Authorization Rules

| Role | Permissions |
| --- | --- |
| **Employee** | - Self-registers.<br>- Automatically receives `employee` role.<br>- Creates tickets for self.<br>- Views and tracks own tickets only.<br>- Adds comments to own tickets.<br>- Cannot view other users' tickets or access admin routes.<br>- Cannot change own or other users' roles. |
| **Agent** | - Created/promoted by Admin.<br>- Creates tickets on behalf of employees.<br>- Views all tickets.<br>- Assigns tickets to self or other active agents.<br>- Updates ticket status and priority.<br>- Adds comments to any ticket.<br>- Cannot manage users or user roles. |
| **Admin** | - Default account seeded on startup.<br>- Manages users (list, create, update, deactivate).<br>- Promotes Employee to Agent / demotes Agent to Employee.<br>- Admin role is protected and cannot be assigned or changed.<br>- Full ticket management and comment deletion. |

---

## Environment Configuration

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| --- | --- | --- |
| `NODE_ENV` | Environment mode | `development` / `production` / `test` |
| `PORT` | HTTP Server port | `5000` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/helpdesk_lite` or Atlas URI |
| `JWT_ACCESS_SECRET` | Secret key for signing JWTs | min 16 characters |
| `JWT_ACCESS_EXPIRES_IN` | JWT token lifetime | `15m` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `SEED_ADMIN_PASSWORD` | Initial password for `admin@example.com` | `AdminPassword@123` |
| `SEED_AGENT_PASSWORD` | Initial password for `agent@example.com` | `AgentPassword@123` |
| `SEED_EMPLOYEE_PASSWORD` | Initial password for `employee@example.com` | `EmployeePassword@123` |

---

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Tests
The automated test suite runs completely in-memory using `mongodb-memory-server` without needing external MongoDB:
```bash
npm test
```

### 3. Development Server
```bash
npm run dev
```

### 4. Production Build & Start
```bash
npm run build
npm start
```

---

## API Endpoints & Examples

### Base URL: `/api/v1`

### 1. Authentication

#### Register (`POST /api/v1/auth/register`)
- **Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password@123"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "672224855a0f2b380bf9d0e1",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "employee",
    "status": "active",
    "createdAt": "2026-10-30T10:00:00.000Z",
    "updatedAt": "2026-10-30T10:00:00.000Z"
  }
}
```

#### Login (`POST /api/v1/auth/login`)
- **Request:**
```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "672224855a0f2b380bf9d0e1",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "employee",
      "status": "active"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User (`GET /api/v1/auth/me`)
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Current user retrieved successfully",
  "data": {
    "_id": "672224855a0f2b380bf9d0e1",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "employee",
    "status": "active"
  }
}
```

---

### 2. User Management (Admin Only)

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/users` | Create user (role: `employee` or `agent`) |
| `GET` | `/api/v1/users` | List users (`?page=1&limit=10&role=agent&search=john`) |
| `GET` | `/api/v1/users/:id` | Get user details |
| `PATCH` | `/api/v1/users/:id` | Update profile (username, email, status) |
| `DELETE` | `/api/v1/users/:id` | Deactivate user (`status: inactive`) |
| `PATCH` | `/api/v1/users/:id/role` | Promote/demote user role |

#### Change User Role (`PATCH /api/v1/users/:id/role`)
- **Request:**
```json
{
  "role": "agent"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "_id": "672224855a0f2b380bf9d0e1",
    "username": "john_doe",
    "role": "agent",
    "status": "active"
  }
}
```

---

### 3. Ticket Management

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/tickets` | Create ticket |
| `GET` | `/api/v1/tickets` | List tickets (`?page=1&limit=10&status=open&priority=high&search=network`) |
| `GET` | `/api/v1/tickets/:id` | Get ticket details |
| `PATCH` | `/api/v1/tickets/:id` | Update title and description |
| `DELETE` | `/api/v1/tickets/:id` | Soft delete ticket (`deletedAt: Date`) |
| `PATCH` | `/api/v1/tickets/:id/assign` | Assign ticket to Agent/Admin |
| `PATCH` | `/api/v1/tickets/:id/status` | Update status (`open`, `in_progress`, `resolved`, `closed`) |
| `PATCH` | `/api/v1/tickets/:id/priority` | Update priority (`low`, `medium`, `high`) |

#### Create Ticket (`POST /api/v1/tickets`)
- **Request (Employee):**
```json
{
  "title": "Cannot connect to VPN",
  "description": "Getting error code 403 on VPN client since this morning.",
  "priority": "high"
}
```
- **Request (Agent on behalf of employee):**
```json
{
  "title": "Monitor flickering issue",
  "description": "HDMI connection drops intermittently.",
  "priority": "medium",
  "createdBy": "672224855a0f2b380bf9d0e1"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "_id": "672224855a0f2b380bf9d0e9",
    "title": "Cannot connect to VPN",
    "description": "Getting error code 403 on VPN client since this morning.",
    "priority": "high",
    "status": "open",
    "createdBy": {
      "_id": "672224855a0f2b380bf9d0e1",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "employee"
    },
    "assignedTo": null,
    "deletedAt": null,
    "createdAt": "2026-10-30T10:15:00.000Z",
    "updatedAt": "2026-10-30T10:15:00.000Z"
  }
}
```

#### Assign Ticket (`PATCH /api/v1/tickets/:id/assign`)
- **Headers:** `Authorization: Bearer <AGENT_OR_ADMIN_TOKEN>`
- **Request:**
```json
{
  "assignedTo": "672224855a0f2b380bf9d0e2"
}
```

---

### 4. Ticket Comments & Attachments

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/tickets/:id/comments` | Add message/attachment to ticket |
| `GET` | `/api/v1/tickets/:id/comments` | List comments (ordered by `createdAt asc, _id asc`) |
| `PATCH` | `/api/v1/comments/:id` | Edit comment (author or admin) |
| `DELETE` | `/api/v1/comments/:id` | Soft delete comment |
| `PATCH` | `/api/v1/comments/:id/read` | Mark comment as read (`isRead: true/false`) |

#### Post Message with Attachment (`POST /api/v1/tickets/:id/comments`)
- **Request:**
```json
{
  "message": "Here is the screenshot of the error message.",
  "attachments": [
    {
      "fileName": "vpn-error-3921.png",
      "originalName": "error_screen.png",
      "fileUrl": "https://storage.example.com/tickets/vpn-error-3921.png",
      "mimeType": "image/png",
      "size": 245120
    }
  ]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "_id": "672224855a0f2b380bf9d0f5",
    "ticketId": "672224855a0f2b380bf9d0e9",
    "authorId": {
      "_id": "672224855a0f2b380bf9d0e1",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "employee"
    },
    "message": "Here is the screenshot of the error message.",
    "attachments": [
      {
        "_id": "672224855a0f2b380bf9d0f6",
        "fileName": "vpn-error-3921.png",
        "originalName": "error_screen.png",
        "fileUrl": "https://storage.example.com/tickets/vpn-error-3921.png",
        "mimeType": "image/png",
        "size": 245120,
        "uploadedAt": "2026-10-30T10:20:00.000Z"
      }
    ],
    "isRead": false,
    "deletedAt": null,
    "createdAt": "2026-10-30T10:20:00.000Z",
    "updatedAt": "2026-10-30T10:20:00.000Z"
  }
}
```

---

## Centralized Error Handling

All errors return a uniform format:

```json
{
  "success": false,
  "message": "You are not authorized to access this ticket",
  "errors": []
}
```

Validation errors return field-level details:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "location": "body",
      "message": "Title must be between 5 and 120 characters"
    }
  ]
}
```

