# Full-Stack Job Application Tracker

A complete, self-contained, full-stack Job Application Tracker built with React, Node.js Express, TypeScript, and SQLite with Prisma ORM.

Runs **100% locally** without any external cloud accounts, paid services, or third-party API keys.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React, Axios, React Router
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, bcryptjs, jsonwebtoken, CORS
- **Database**: SQLite stored locally at `server/prisma/dev.db`
- **Authentication**: JWT authentication with local development token signing

---

## 📂 Project Structure

```text
job-application-tracker/
├── client/                     # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Reusable Button, Input, Select, Modal, StatusBadge, Loader, EmptyState
│   │   │   ├── layout/         # Navbar, Sidebar, Main Layout
│   │   │   └── ui/             # Reusable UI controls
│   │   ├── context/            # AuthContext (login, register, logout, session persistence)
│   │   ├── pages/              # Dashboard, Applications, ApplicationForm, Login, Register
│   │   ├── services/           # Axios API client with JWT interceptor
│   │   └── types/              # TypeScript interfaces
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma data model for SQLite
│   │   ├── seed.ts             # Demo user and 12 realistic job applications
│   │   └── dev.db              # Local SQLite database
│   ├── src/
│   │   ├── middleware/         # JWT authentication & centralized error handler
│   │   ├── routes/             # Auth, Applications (CRUD + pagination/filters), Dashboard stats
│   │   ├── app.ts              # Express configuration & CORS
│   │   ├── prisma.ts           # Prisma client singleton
│   │   └── server.ts           # Server entry point on port 5000
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

Follow these step-by-step commands to get the application running on your computer:

### Step 1: Start the Backend Server

```bash
cd server
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

The backend server will start on **`http://localhost:5000`** with CORS enabled for **`http://localhost:5173`**.

### Step 2: Start the Frontend Client

In a new terminal window:

```bash
cd ../client
npm install
npm run dev
```

The frontend will start on **`http://localhost:5173`** and communicate with **`http://localhost:5000/api`**.

---

## 🔑 Demo Credentials

A demo account is automatically provisioned by the seed script:

- **Email**: `demo@example.com`
- **Password**: `password123`

You can also click the **"Fill credentials"** button directly on the login page for 1-click access.

---

## 🌟 Features

1. **Authentication & User Scoping**:
   - Register new account with validation
   - Login with encrypted bcrypt password verification
   - Secure JWT token saved in localStorage
   - Strict ownership isolation: users can only view, create, edit, or delete their own applications

2. **Job Application Management (13 Core Fields)**:
   - `id`, `companyName`, `jobTitle`, `location`, `jobType`, `status`, `appliedDate`, `salaryRange`, `jobUrl`, `contactName`, `notes`, `createdAt`, `updatedAt`
   - **Job Types**: Full-time, Part-time, Internship, Contract, Remote
   - **Statuses**: Wishlist, Applied, Interview, Offer, Rejected

3. **Analytics Dashboard**:
   - Total applications counter
   - Breakdown counters for each status (Wishlist, Applied, Interview, Offer, Rejected)
   - Recharts interactive Pie Chart with custom colors and tooltips
   - Recharts Bar Chart visualizing employment arrangements
   - Recent applications feed with direct quick links

4. **Applications Directory**:
   - **Table View** and **Card View** toggles
   - Real-time search across company name, job title, and location
   - Filter by application status and job type
   - Sort by Applied Date, Company Name, or Date Created (Ascending / Descending)
   - Full pagination support
   - Quick "View Details" modal showing all fields
   - Delete confirmation dialog protecting against accidental deletion

5. **Form Validation & UI Feedback**:
   - Client-side and server-side validation
   - Loading skeletons and animated spinners
   - Helpful empty states with direct call-to-action buttons
   - Dismissible success and error notifications

---

## 📡 API Reference

All protected endpoints require the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Log in and receive JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/applications` | Query applications (search, filter, sort, paginate) |
| `POST` | `/api/applications` | Create a new job application |
| `GET` | `/api/applications/:id` | Retrieve single application details |
| `PUT` | `/api/applications/:id` | Update an existing application |
| `DELETE` | `/api/applications/:id` | Delete an application |
| `GET` | `/api/dashboard/stats` | Aggregate dashboard statistics & charts data |
