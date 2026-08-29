# Service Delivery CRM

A CRM built for tracking service delivery: the contracts you deliver, the
external/subcontractor contracts that support them, the people involved,
meetings, activity updates, and staff holiday/availability — all in one
place.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript, Turbopack)
- [Prisma](https://www.prisma.io) + PostgreSQL
- [Auth.js / NextAuth v5](https://authjs.dev) (credentials login, JWT sessions)
- Tailwind CSS

## Data model

- **Contract** — a contract your organisation delivers to a client.
- **ExternalContract** — a subcontractor/supplier contract linked to a parent Contract.
- **Contact** — a person (client, subcontractor, internal, or other), linkable to any number of contracts.
- **Meeting** — logged against a contract, with staff and contact attendees.
- **ActionItem** — a task tracked against a contract (optionally raised from a meeting).
- **Update** — a free-text activity log entry against a contract.
- **Holiday** — a staff holiday/leave request with approval workflow.
- **User** — a team member with a role (`ADMIN`, `MANAGER`, `STAFF`).

Roles: `ADMIN` manages the team (add/deactivate users) in addition to everything a `MANAGER` can do; `MANAGER` can create/edit contracts, external contracts, and approve holidays; `STAFF` can view everything, log meetings/updates/action items, and request their own holiday.

## Getting started

### 1. Prerequisites

- Node.js 20.9+
- A PostgreSQL database

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `DATABASE_URL` with your Postgres connection string, and generate an
`AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Set up the database

```bash
npx prisma migrate dev
npm run db:seed
```

The seed script creates three accounts (all with password `ChangeMe123!` —
**change these before deploying anywhere real**):

| Role    | Email                                       |
| ------- | -------------------------------------------- |
| Admin   | `michael.broderick@fccenvironment.co.uk`      |
| Manager | `manager@example.com`                         |
| Staff   | `staff@example.com`                           |

It also creates a sample contract, external contract, contacts, a meeting,
an update, an action item, and a holiday record so the app isn't empty on
first login.

### 5. Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and sign in with one of
the seeded accounts above.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint the codebase
- `npm run db:seed` — (re-)run the seed script
- `npx prisma studio` — browse/edit the database with Prisma's GUI
- `npx prisma migrate dev` — create/apply a new migration after changing `prisma/schema.prisma`

## Project structure

```
prisma/schema.prisma        Data model
prisma/seed.ts              Seed data
src/auth.ts                 NextAuth configuration
src/proxy.ts                Route protection (redirects unauthenticated users to /login)
src/lib/actions/            Server actions (mutations), grouped by feature
src/lib/prisma.ts           Prisma client singleton
src/app/login/              Sign-in page
src/app/(dashboard)/        Authenticated app shell + feature pages
  contracts/                 Contracts + external contracts, contacts, meetings, updates, action items
  contacts/                  People directory
  meetings/                  Cross-contract meetings list
  holidays/                  Holiday requests, approvals, team availability
  team/                      User management (admin only)
```
