# Helpdesk Lite – Frontend Application

Production-ready, internal Support Ticket Management Single Page Application (SPA) built with **React**, **TypeScript**, **Vite**, **Material UI (MUI)**, **Emotion**, **React Router**, **TanStack Query**, **Zustand**, **React Hook Form**, and **Zod**.

---

## 1. Architectural Highlights

- **Client-Side Rendering (CSR) / SPA**: Pure Vite-based SPA engineered for internal enterprise responsiveness and speed. Zero Next.js/SSR overhead.
- **Enterprise Design System**: Designed with **Material UI v6 (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`)** with clean typography, custom responsive components, light/dark mode support, and zero Tailwind CSS dependency.
- **Strict Role-Based Access Control**:
  - `employee`: Ticket creation, tracking own tickets, and posting comments.
  - `agent`: Global ticket queue, status/priority triage, self & peer assignment, and on-behalf ticket creation.
  - `admin`: Full administrative control, system metrics analytics, staff management, and employee/agent role promotion (with admin protection).
- **Data Layer & Caching**: TanStack Query (React Query v5) with query key factory patterns, optimistic updates, and automatic invalidation.
- **Validation**: Strict schema validation powered by **Zod** integrated with **React Hook Form**.
- **State Management**: Lightweight Zustand stores for auth session persistence and UI state (theme mode & responsive sidebar).

---

## 2. Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx             # Root component with Providers & RouterProvider
│   │   ├── providers.tsx       # QueryClient, ThemeProvider, CssBaseline, Toaster
│   │   ├── query-client.ts     # TanStack Query client configuration
│   │   └── router.tsx          # React Router v6 tree with Protected & Role Guards
│   ├── components/
│   │   ├── common/             # Badges (UserRole, UserStatus), Error & 404 Pages
│   │   ├── confirm-dialog/     # Reusable action confirmation modal
│   │   ├── empty-state/        # Zero-state placeholder
│   │   ├── layout/             # AppHeader, AppSidebar, DashboardLayout
│   │   ├── loading-state/      # Accessible spinner and loading feedback
│   │   ├── page-header/        # Breadcrumb and page action header
│   │   ├── priority-badge/     # Low, Medium, High priority chips
│   │   └── status-badge/       # Open, In Progress, Resolved, Closed chips
│   ├── config/
│   │   └── navigation.ts       # Role-filtered navigation config
│   ├── features/
│   │   ├── auth/               # Login, Register, schemas, hooks, auth API
│   │   ├── conversations/      # Ticket comments, replies, attachments
│   │   ├── dashboard/          # Employee, Agent, Admin dashboards with Recharts
│   │   ├── profile/            # User profile view
│   │   ├── tickets/            # Ticket list, create ticket, detail, and triage
│   │   └── users/              # Admin staff management, role promotion
│   ├── lib/
│   │   ├── axios.ts            # Axios client with JWT interceptor & 401 handler
│   │   ├── constants.ts        # App-wide constants
│   │   ├── query-keys.ts       # Centralized React Query key hierarchy
│   │   └── utils.ts            # Formatting utilities (dates, initials, file sizes)
│   ├── stores/
│   │   ├── auth.store.ts       # Zustand authentication store
│   │   └── ui.store.ts         # Zustand UI store (light/dark mode, sidebar)
│   ├── test/                   # Vitest unit & component test suites (36 tests)
│   ├── theme/                  # MUI Palette, Typography, and component overrides
│   ├── types/                  # TypeScript interfaces for API, Auth, Tickets, Comments
│   ├── main.tsx                # Application bootstrap
│   └── vite-env.d.ts           # Environment type definitions
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

## 3. Environment Variables

Create `.env` in the `frontend/` directory (see `.env.example`):

```bash
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 4. Getting Started

### Install Dependencies
```bash
cd frontend
npm install
```

### Run in Development Mode
```bash
npm run dev
```
The application will start at `http://localhost:3000`.

### Build for Production
```bash
npm run build
```
Generates minified static assets in `dist/`.

### Run Test Suite
```bash
npm test
```
Runs 36 automated Vitest component & store tests in single-run mode.

---

## 5. Seed User Credentials for Testing

Use the seed accounts configured in the backend:

| Role | Username | Email | Password |
|---|---|---|---|
| **Admin** | `admin` | `admin@yopmail.com` | `Admin@123` |
| **Agent** | `agent` | `agent@yopmail.com` | `Agent@123` |
| **Employee** | `employee` | `employee@yopmail.com` | `Employee@123` |

