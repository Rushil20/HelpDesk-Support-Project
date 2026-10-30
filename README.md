# Helpdesk Lite – Support Ticket Management System

Complete, production-ready, full-stack Support Ticket Tracker consisting of a **Node.js/Express/MongoDB REST API Backend** and a **React/TypeScript/Vite Material UI Frontend**.

---

## 1. Project Overview

- **Backend (`backend/`)**:
  - Node.js LTS, Express 5, TypeScript, MongoDB & Mongoose.
  - JWT Authentication, Argon2id password hashing, Zod validation.
  - Three fixed user roles (`employee`, `agent`, `admin`) with simple enum-based RBAC.
  - MongoDB transaction-backed ticket creation preventing duplicate active titles per creator.
  - Ticket management (assignment, status lifecycle, priority, soft-delete).
  - Conversation comments and attachments.
  - Admin user management with employee-to-agent role promotion and protected admin role.
  - Automated seeding logic on startup.
  - **47 Vitest backend test cases passing (100%)**.

- **Frontend (`frontend/`)**:
  - React 18, TypeScript, Vite SPA (Single Page Application).
  - Material UI (MUI v6) with Emotion and custom palette (light/dark mode).
  - React Router v6 with `ProtectedRoute`, `PublicOnlyRoute`, and `RoleGuard`.
  - TanStack Query v5 for client caching and optimistic mutation workflows.
  - Zustand stores for authentication and UI preferences.
  - React Hook Form + Zod for type-safe form validations.
  - Role-tailored dashboards for Employee, Support Agent, and Administrator (with Recharts).
  - **36 Vitest frontend test cases passing (100%)**.

---

## 2. Quick Start

### 1. Start the Backend API

```bash
cd backend
npm install
npm test          # Verify 47 backend tests
npm run dev       # Starts server at http://localhost:5000
```

### 2. Start the Frontend SPA

```bash
cd frontend
npm install
npm test          # Verify 36 frontend tests
npm run dev       # Starts Vite dev server at http://localhost:3000
```

---

## 3. Pre-configured Credentials

The backend automatically seeds initial test users on first launch:

| Role | Username | Email | Password |
|---|---|---|---|
| **Admin** | `admin` | `admin@yopmail.com` | `Admin@123` |
| **Agent** | `agent` | `agent@yopmail.com` | `Agent@123` |
| **Employee** | `employee` | `employee@yopmail.com` | `Employee@123` |
