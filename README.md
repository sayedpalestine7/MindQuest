
# MindQuest — Interactive Course Builder

An interactive learning platform for technical topics (data structures, algorithms, etc.) featuring animated lessons, mini-games, quizzes, and progress tracking. This repository contains the full-stack source (backend, frontend, and mobile clients) and supporting project artifacts for a graduation project.

---

**Contents**
- **Backend**: API server, database models (Postgres + Prisma and MongoDB), authentication, file uploads, payments, and business logic. See [backend](backend/).
- **Frontend**: React + Vite single-page app using Tailwind CSS for the web UI. See [frontend](frontend/).
- **Mobile**: React Native / Expo app for mobile interaction. See [mobile](mobile/).
- **Graduation report**: Documentation and chapters. See [graduation-report](graduation-report/).

---

**Key Features**
- User authentication (signup, login, JWT)
- Interactive lessons with step-by-step animations
- Quizzes per lesson, progress tracking, and achievements
- Course, lesson, and quiz management (admin/teacher flows)
- Real-time features (chat, sockets) and file uploads
- Payment endpoints for premium features (Stripe integration notes in backend/STRIPE_SETUP.md)

---

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express
- Databases: PostgreSQL (via Prisma) for relational data; MongoDB for content (courses, lessons, animations)
- Other: Socket.io for realtime, Stripe for payments, Multer for file uploads

---

## Repo Structure (top-level)
- [backend](backend/) — Express API and service layer
- [frontend](frontend/) — React web client (Vite)
- [mobile](mobile/) — React Native / Expo mobile client
- [graduation-report](graduation-report/) — Project documentation and chapters

See each package's README for more details.

---

## Setup & Run (Development)

Prerequisites: Node.js (16+), npm, local MongoDB and Postgres instances (or Docker).

1) Backend

 - Copy the example env and set values: create `backend/.env` with:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mindquest
POSTGRES_URL=postgresql://USER:PASSWORD@localhost:5432/mindquest
JWT_SECRET=replace_with_a_secure_secret
STRIPE_SECRET=sk_test_...
```

 - Install and initialize:

```bash
cd backend
npm install
npm run dev
```

2) Frontend (web)

```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173 (Vite default) or the URL printed in terminal
```

3) Mobile (optional)

```bash
cd mobile
npm install
# Use Expo CLI / run in simulator or Expo Go
npm start
```

---

## Testing
- Backend: run available tests or use Postman collections in `backend/mindquest.rest` and `backend/seedCourseRequests.rest` for API exploration.
- Frontend: standard `npm run test` (if configured) or manual QA in browser.

---

## Development Notes
- The project uses both Postgres (Prisma) for transactional/user data and MongoDB for content flexibility. See `backend/prisma/schema.prisma` and `backend/src/models` for schema and model details.
- Environment-specific configuration is read from `backend/.env`.
- Payment integration notes are in `backend/STRIPE_SETUP.md`.

---

## Contributing
- Create issues for bugs or feature requests.
- Fork, add a branch, implement, and open a PR. Keep changes scoped and include tests where appropriate.

---

## Useful Links
- API examples: [backend/mindquest.rest](backend/mindquest.rest)
- Seed scripts: [backend/scripts](backend/scripts)

---

## License
This project is released under the MIT License.

---

## Authors
- Sayed Qutob
- Ahmad Dardouk

If you'd like, I can also update the individual package READMEs (`backend/README.md`, `frontend/README.md`, `mobile/README.md`) with step-by-step developer instructions.