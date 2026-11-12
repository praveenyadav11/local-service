# ServiceConnect: Local Service Booking Platform

A full-stack platform where customers find and book local service providers (plumbers, electricians, tutors and more), providers manage their schedule and requests, and admins oversee the platform.

## Features

- JWT authentication with role-based access (customer, provider, admin)
- Service categories and provider profiles with verification
- Weekly availability and one-hour slot generation
- Double-booking prevention via a partial unique index (race-condition safe)
- Booking status state machine (pending, confirmed, rejected, cancelled, completed)
- Location-based provider search (MongoDB 2dsphere, `$geoNear`)
- Real-time booking updates and notifications (Socket.IO)
- Reviews with automatic rating average
- Simulated payments (server-calculated amount)
- Admin dashboard: users, verification, analytics
- Security: bcrypt hashing, helmet, rate limiting, input validation, NoSQL injection checks

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Axios, Socket.IO client |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| Real-time | Socket.IO |
| Testing | Node test runner, Postman |

## Architecture

```
serviceconnect-backend/
  config/       database connection, env validation
  controllers/  request handling
  middleware/   auth, errors, rate limiting
  models/       Mongoose schemas
  routes/       URL to controller mapping
  services/     business logic (slots, notifications, analytics)
  sockets/      Socket.IO setup and rooms
  utils/        helpers (AppError, token, admin script)
  tests/        API tests
  app.js        Express app
  server.js     startup
serviceconnect-frontend/
  src/ api, context, components, pages, routes, hooks
```

Request flow: `route -> protect -> authorize -> controller -> response` (errors go to a central error handler).

## Setup

### Backend

```bash
cd serviceconnect-backend
npm install
cp .env.example .env   # fill in real values
npm run dev
```

### Frontend

```bash
cd serviceconnect-frontend
npm install
echo VITE_API_URL=http://localhost:5000/api > .env
npm run dev
```

### Create an admin

```bash
node utils/createAdmin.js "Site Admin" admin@example.com StrongPass123
```

### Tests

Set `MONGO_URI_TEST` to a separate database, then:

```bash
npm test
```

## API overview

| Area | Endpoints |
|---|---|
| Auth | POST /api/auth/register, POST /api/auth/login, GET /api/auth/me |
| Categories | GET/POST /api/categories, PUT/DELETE /api/categories/:id |
| Providers | GET /api/providers, /nearby, /:id, /:id/slots; POST/PUT /profile; GET /profile/me |
| Availability | PUT /api/availability, GET /api/availability/me |
| Bookings | POST /api/bookings; GET /my, /provider, /:id; PATCH /:id/status |
| Reviews | POST /api/reviews, GET /api/reviews/provider/:id |
| Notifications | GET /api/notifications, PATCH /read-all, /:id/read |
| Payments | POST /api/payments, GET /api/payments/my |
| Admin | GET /api/admin/users, /analytics; PATCH /users/:id/active, /providers/:id/verify |

## Design decisions

- Ownership comes from the JWT, never the request body (prevents IDOR).
- Fields are whitelisted on create/update (prevents mass assignment).
- Slot validity and payment amounts are computed on the server.
- Dates stored as `YYYY-MM-DD` strings to avoid timezone shifts.

## Possible improvements

Real payment gateway, password reset, refresh tokens, email notifications, CI pipeline.