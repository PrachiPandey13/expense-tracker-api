# Expense Tracker API (Node.js + Express + TypeScript)

A production-ready **API-only backend** for an expense tracker with **JWT-based authentication** and a **PostgreSQL (Neon)** database. The application is deployed on **Render** and tested end-to-end using Postman.

---

## Live API

Base URL:  
https://expense-tracker-api-zlez.onrender.com

Health check endpoints:
- `GET /` → `{ "ok": true, "service": "expense-tracker-api" }`
- `GET /health` → `{ "ok": true }`

> This is a backend-only API (no frontend UI). Endpoints are intended to be consumed by a frontend application or tested using tools like Postman or cURL.

---

## Features

- User signup and login
- JWT-based authentication
- Protected API routes
- Create, read, update, delete (CRUD) expenses
- Expense summaries:
  - Category-wise summary
  - Top expenses
- Production deployment with hosted PostgreSQL database

---

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL (Neon)
- JWT Authentication
- Zod (request validation)
- Docker
- Render (deployment)

---

## API Routes

### Public Routes

- `GET /` — Service status
- `GET /health` — Health check
- `POST /auth/signup` — Register a new user
- `POST /auth/login` — Login and receive JWT

---

### Protected Routes  
(All routes below require an Authorization header)

Base path: `/expenses`

- `POST /expenses` — Create a new expense
- `GET /expenses` — Get all expenses
- `PUT /expenses/:id` — Update an expense
- `DELETE /expenses/:id` — Delete an expense
- `GET /expenses/summary/categories` — Expense summary by category
- `GET /expenses/summary/top` — Top expenses

---

## Authentication & Usage Flow

### Step 1: Signup

**POST** `/auth/signup`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}

Step 2: Login

POST /auth/login

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}

Response:

{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": 1
}

Step 3: Access Protected Routes

For all protected routes, include the following header:

Authorization: Bearer <PASTE_JWT_TOKEN_HERE>


Example — Create an expense
POST /expenses

Request body:

{
  "title": "Coffee",
  "amount": 120,
  "category": "Food",
  "date": "2025-12-30"
}


Successful response:

{
  "id": 1,
  "user_id": 1,
  "amount": "120.00",
  "category": "Food",
  "description": null,
  "created_at": "2025-12-31T21:02:38.377Z"
}

Environment Variables
Required (Production)

DATABASE_URL — Neon PostgreSQL connection string

JWT_SECRET — Secret key used for JWT signing and verification

PORT — Automatically provided by Render

Optional (Local Development)

If DATABASE_URL is not set, the application can fall back to:

POSTGRES_HOST

POSTGRES_PORT

POSTGRES_DB

POSTGRES_USER

POSTGRES_PASSWORD

Running Locally
Install dependencies
npm install

Run in development mode
npm run dev

Build and run in production mode
npm run build
npm run start:prod

Project Structure (Overview)

src/tracker.ts — Application entry point and route mounting

src/routes/ — API route definitions

src/controllers/ — Request handlers

src/middleware/is-auth.ts — JWT authentication middleware

src/db/ — Database configuration and queries

Deployment

Backend deployed on Render

PostgreSQL hosted on Neon

Database migrations applied successfully

Environment variables configured via Render dashboard

Author

Prachi Pandey





