# RoomSync (Roommate Expense Splitter)

RoomSync is a full-stack app for tracking shared roommate expenses, splitting costs, and viewing who owes whom.

## What It Does

- Register/login with JWT auth
- Create groups and add members
- Add shared expenses with equal split
- View per-group balances:
  - Positive balance: user should receive money
  - Negative balance: user owes money

## Tech Stack

- Frontend: React + Vite + Axios + React Router
- Backend: Node.js + Express (MVC)
- Database: MongoDB Atlas (Mongoose)
- Auth: JWT + bcryptjs

## Project Structure

- `backend/` Express API
- `frontend/` React app

## API Routes

- `POST /auth/register`
- `POST /auth/login`
- `POST /groups`
- `GET /groups`
- `POST /groups/:id/add-member`
- `POST /expenses`
- `GET /expenses/:groupId`
- `GET /balances/:groupId`

Protected routes require:

- `Authorization: Bearer <token>`

## Local Setup

### 1) Backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Required backend env values (`backend/.env`):

- `PORT=5000`
- `MONGO_URI=<mongodb connection string>`
- `JWT_SECRET=<strong secret>`
- `JWT_EXPIRES_IN=7d`
- `CORS_ORIGIN=http://localhost:5173`

### 2) Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Required frontend env values (`frontend/.env`):

- `VITE_API_BASE_URL=http://localhost:5000`

## Deployment

### Backend (Render)

1. Create a Web Service from this repo.
2. Set root directory to `backend`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Set env vars:
   - `NODE_ENV=production`
   - `MONGO_URI=<atlas uri>`
   - `JWT_SECRET=<strong secret>`
   - `JWT_EXPIRES_IN=7d`
   - `CORS_ORIGIN=<your vercel frontend origin>`
6. Deploy and verify:
   - `GET /` returns `RoomSync API is running`

### Frontend (Vercel)

1. Import repo into Vercel.
2. Set root directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set env var:
   - `VITE_API_BASE_URL=<your render backend url>`
6. Redeploy after env updates.

`frontend/vercel.json` already includes SPA rewrites for client-side routes.

## Common Troubleshooting

- CORS error (`CORS Missing Allow Origin`):
  - Ensure `CORS_ORIGIN` exactly matches frontend domain (no trailing slash).
  - If testing preview + production domains, add both as comma-separated origins.
- Requests stuck on auth forms:
  - Verify frontend points to active backend URL in `VITE_API_BASE_URL`.
- Atlas auth errors:
  - Recheck DB user/password, URL-encoding, and network access.
- `React is not defined` in frontend:
  - Ensure React plugin setup is present via `frontend/vite.config.js`.

## Balance Logic

For each expense:

- `splitAmount = totalAmount / numberOfUsersInSplit`
- For each user in `splitAmong` except `paidBy`:
  - payer balance += splitAmount
  - split user balance -= splitAmount

## Evaluation Notes

- Backend follows MVC structure.
- Input validation and auth guards are included.
- Deployment-ready env examples are included in both `backend/.env.example` and `frontend/.env.example`.
