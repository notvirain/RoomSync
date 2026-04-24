# RoomSync (Roommate Expense Splitter)

RoomSync is a clean full-stack web app to manage shared expenses between roommates.

## Tech Stack

- Frontend: React (hooks, Context API) + Axios
- Backend: Node.js + Express (MVC)
- Database: MongoDB Atlas (Mongoose ODM)
- Authentication: JWT + bcrypt password hashing

## Features

- User registration and login
- Group creation and member management
- Shared expense creation with equal split
- Group-wise balances where:
  - positive balance means user should receive money
  - negative balance means user owes money

## Project Structure

- backend: Express API with MVC structure (routes, controllers, models, middleware)
- frontend: React app with pages for Login/Register, Dashboard, Group Details

## API Endpoints

- POST /auth/register
- POST /auth/login
- POST /groups
- GET /groups
- POST /groups/:id/add-member
- POST /expenses
- GET /expenses/:groupId
- GET /balances/:groupId

Protected routes require:
- Authorization: Bearer <token>

## Local Development Setup

### 1) Backend

1. Open terminal and move to backend:
   - cd backend
2. Create .env from example:
   - copy .env.example .env
3. Update .env values:
   - PORT=5000
   - MONGO_URI=your_mongodb_connection
   - JWT_SECRET=your_secure_secret
   - JWT_EXPIRES_IN=7d
4. Install and run:
   - npm install
   - npm run dev

### 2) Frontend

1. Open a new terminal and move to frontend:
   - cd frontend
2. Create .env from example:
   - copy .env.example .env
3. Set API URL in frontend env:
   - VITE_API_BASE_URL=http://localhost:5000
4. Install and run:
   - npm install
   - npm run dev

## Deployment Guide

### Database: MongoDB Atlas

1. Create Atlas cluster.
2. Create DB user and password.
3. Add network access for your backend host (or allow all for initial testing).
4. Copy Atlas connection string and use it as backend MONGO_URI.

### Backend: Render or Railway

1. Push repository to GitHub.
2. Create backend service from repo.
3. Set service root directory to backend.
4. Build command:
   - npm install
5. Start command:
   - npm start
6. Set backend environment variables:
   - NODE_ENV=production
   - MONGO_URI=your_atlas_uri
   - JWT_SECRET=your_secure_secret
   - JWT_EXPIRES_IN=7d
7. Deploy and verify health endpoint:
   - GET /

### Frontend: Vercel

1. Import repository in Vercel.
2. Set root directory to frontend.
3. Build command:
   - npm run build
4. Output directory:
   - dist
5. Add frontend environment variable:
   - VITE_API_BASE_URL=https://your-backend-domain
6. Deploy.

Note: Vercel SPA rewrite config is included so refreshing routes like /dashboard or /groups/:groupId works.

## Balance Logic

For each expense:

- splitAmount = totalAmount / numberOfUsersInSplit
- For each user in splitAmong except paidBy:
  - payer balance += splitAmount
  - split user balance -= splitAmount

## Production Checklist

- Backend deployed and connected to Atlas
- Frontend points to deployed backend via VITE_API_BASE_URL
- CORS configured appropriately in backend
- Register/Login flow works in production
- Group, Expense, and Balance flows are working

## Academic Evaluation Notes

- Code is intentionally minimal and modular.
- Backend follows MVC with clean separation of concerns.
- Input validations and auth protections are included.
