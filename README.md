# HackSphere 🚀

> **"One platform. Every hackathon. Zero chaos."**

A full-stack MERN hackathon management platform replacing the Google Forms + WhatsApp + Excel chaos with a centralized, role-based system for Admins, Organizers, Participants, and Judges.

---

## Table of Contents
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Roles & Access](#roles--access)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Seeding Admin](#seeding-admin)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19 (Vite), React Router v7, Tailwind CSS v4, Framer Motion, Recharts, React Hook Form + Zod, Socket.io Client |
| **Backend** | Node.js, Express.js, Socket.io, Multer |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (HttpOnly cookies + Authorization header), bcrypt |
| **Email** | Nodemailer |
| **File Uploads** | Multer (local `/uploads`) |

---

## Features

- ✅ **4-role auth system** — Admin / Organizer (approval-gated) / Participant / Judge (approval-gated)
- ✅ **Hackathon lifecycle** — Create → Register → Team up → Submit → Judge → Leaderboard
- ✅ **Team system** — 6-character join codes, leader controls, member management
- ✅ **Live leaderboard** — Socket.io real-time score updates as judges submit reviews
- ✅ **Judging rubric** — Configurable per-hackathon criteria with per-criterion scores
- ✅ **Analytics dashboards** — Recharts charts for Admins (registrations over time, user breakdown, submissions by status) and Organizers (per-hackathon stats)
- ✅ **Countdown timers** — Live countdowns on hackathon cards (registration deadline / event end)
- ✅ **Email notifications** — Nodemailer on registration confirmed, organizer/judge approved/rejected
- ✅ **Skeleton loaders** — Dashboard skeletons while data loads
- ✅ **Empty states** — Zero-data screens with clear messaging

---

## Roles & Access

| Role | Registration | Access |
|---|---|---|
| **Participant** | Self-register, instant access | Browse, register for hackathons, team up, submit, view leaderboard |
| **Organizer** | Self-register → pending Admin approval | Create/edit/delete hackathons, assign judges, view teams & submissions |
| **Judge** | Self-register → pending Admin approval + assigned by Organizer | View assigned submissions only, score & provide feedback |
| **Admin** | Seeded via script (not self-registrable) | Full platform control, approve/reject/block any user |

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas cluster (or local MongoDB)

### 1. Clone & Install

```bash
# Clone
git clone <your-repo-url>
cd hacksphere

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment Variables

See [Environment Variables](#environment-variables) section below.

### 3. Seed Admin User

```bash
cd server
node seeds/seedAdmin.js
```

This creates an admin with the credentials defined in your `.env`.

### 4. Run in Development

```bash
# Terminal 1 — Backend (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

### `server/.env`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/hacksphere

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

# Admin seed credentials
ADMIN_EMAIL=admin@hacksphere.io
ADMIN_PASSWORD=Admin@1234
ADMIN_NAME=HackSphere Admin

# Nodemailer (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM="HackSphere <no-reply@hacksphere.io>"
```

### `client/.env`

```env
VITE_SERVER_URL=http://localhost:5000
```

---

## Seeding Admin

The platform requires at least one Admin account — Admins are **not** self-registrable.

```bash
cd server
node seeds/seedAdmin.js
```

The script reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` from `server/.env`.

---

## API Reference

All responses follow: `{ success, data, message }` on success; `{ success: false, message, error }` on failure.

### Auth — `/api/v1/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/signup` | Public | Register new user |
| POST | `/login` | Public | Login, returns JWT |
| POST | `/logout` | Auth | Clear session |
| GET | `/me` | Auth | Get current user |
| PUT | `/me` | Auth | Update profile |
| PUT | `/change-password` | Auth | Change password |

### Admin — `/api/v1/admin`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/requests` | Admin | Pending organizer/judge requests |
| PATCH | `/users/:id/approve` | Admin | Approve organizer or judge |
| PATCH | `/users/:id/reject` | Admin | Reject with reason |
| PATCH | `/users/:id/block` | Admin | Block user |
| PATCH | `/users/:id/unblock` | Admin | Unblock user |
| GET | `/users` | Admin | All users (filterable) |
| DELETE | `/users/:id` | Admin | Delete user |
| GET | `/analytics` | Admin | Platform analytics |
| DELETE | `/hackathons/:id` | Admin | Delete any hackathon |

### Hackathons — `/api/v1/hackathons`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List all (search, filter, paginate) |
| GET | `/featured` | Public | Featured for homepage |
| GET | `/:id` | Public | Single hackathon detail |
| POST | `/` | Organizer, Admin | Create hackathon |
| PUT | `/:id` | Organizer (own), Admin | Update hackathon |
| DELETE | `/:id` | Organizer (own), Admin | Delete hackathon |
| GET | `/my/all` | Organizer, Admin | My hackathons with stats |
| POST | `/:id/register` | Participant | Register for hackathon |
| GET | `/judges/pool` | Organizer, Admin | Approved judges list |
| POST | `/:id/judges` | Organizer, Admin | Assign judge |
| GET | `/:id/teams` | Organizer, Admin | Teams in hackathon |
| POST | `/:id/bookmark` | Auth | Toggle bookmark |

### Teams — `/api/v1/teams`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Participant | Create team (generates join code) |
| POST | `/join` | Participant | Join team via join code |
| GET | `/my/:hackathonId` | Participant | My team for a hackathon |
| GET | `/:id` | Auth | Get team details |
| PUT | `/:id` | Team Leader | Update team info |
| DELETE | `/:id` | Team Leader | Delete team |
| POST | `/:id/regenerate-code` | Team Leader | Regenerate join code |
| DELETE | `/:id/members/:userId` | Team Leader | Remove member |
| POST | `/:id/leave` | Participant | Leave team |
| PATCH | `/:id/transfer` | Team Leader | Transfer leadership |

### Submissions — `/api/v1/submissions`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Participant | Submit project |
| GET | `/my/:hackathonId` | Participant | My submission for hackathon |
| GET | `/hackathon/:hackathonId` | Organizer, Admin | All submissions for hackathon |
| GET | `/:id` | Auth | Single submission |
| PUT | `/:id` | Participant (pre-deadline) | Update submission |

### Reviews — `/api/v1/reviews`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Judge | Submit/update review |
| GET | `/judge-dashboard` | Judge | Judge dashboard data |
| GET | `/submission/:submissionId` | Judge | My review for a submission |
| GET | `/submission/:submissionId/all` | Organizer, Admin | All reviews for submission |
| GET | `/leaderboard/:hackathonId` | Public | Live leaderboard |

---

## Database Schema

### `Users`
```
_id, name, email, password (bcrypt), role (admin|organizer|participant|judge),
status (pending|approved|blocked), rejectionReason, bio, avatar, bookmarks[], createdAt
```

### `Hackathons`
```
_id, title, description, theme, mode (Online|Offline|Hybrid), venue, 
startDate, endDate, registrationDeadline, bannerImage, prizePool, 
maxTeamSize, rules, judgingCriteria[{name, maxMarks, description}], 
status (draft|upcoming|ongoing|completed|cancelled), organizer (ref:User), 
judges[] (ref:User), createdAt
```

### `Teams`
```
_id, name, hackathon (ref:Hackathon), leader (ref:User), 
members[] (ref:User), joinCode (6-char alphanumeric, unique), createdAt
```

### `Registrations`
```
_id, participant (ref:User), hackathon (ref:Hackathon), createdAt
```

### `Submissions`
```
_id, hackathon (ref:Hackathon), team (ref:Team), submittedBy (ref:User),
projectName, problemStatement, solutionDescription, githubRepo, liveDemoUrl,
techStack[], screenshots[], presentationPdf, demoVideoLink,
status (pending|under review|approved|rejected), createdAt
```

### `Reviews`
```
_id, submission (ref:Submission), judge (ref:User), hackathon (ref:Hackathon),
scores {criterionName: {marks, comment}}, totalScore, generalFeedback,
isSubmitted (bool), createdAt
```

---

## Socket.io Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `join:hackathon` | Client → Server | `hackathonId` | Join room for live updates |
| `leave:hackathon` | Client → Server | `hackathonId` | Leave room |
| `leaderboard:update` | Server → Client | `leaderboard[]` | Emitted when judge submits review |

---

## License

MIT — built for capstone evaluation purposes.
