# RoomSync Overview

## What is RoomSync?

**RoomSync** is a full-stack web application designed to streamline shared expense management among roommates or group members. It provides an intuitive platform for tracking who spent what, automatically calculating balances, and settling up debts fairly.

## Core Purpose

RoomSync solves the common problem of shared living expenses: groceries, utilities, rent contributions, entertainment, and other costs that multiple people split. Instead of keeping mental notes or sending confusing PayPal requests, RoomSync centralizes all transactions and provides real-time balance insights.

## Key Features

### 🏠 Group Management
- Create and manage multiple expense-sharing groups
- Invite members via unique invite codes
- Join-request workflow: members can request to join, and group owner/members approve
- View all group members and their contribution history

### 💸 Expense Tracking
- Add expenses with detailed descriptions
- Assign expenses to specific groups
- Support for different cost-split strategies
- Filter and search expenses by date, member, or category
- CSV export for record-keeping
- Auto-delete expenses after a configurable retention period

### 📊 Balance Calculation
- Real-time balance summaries showing who owes whom
- Dropdown view with detailed breakdown per person
- Transparent math: exactly how much each person contributed vs. owes

### 🔐 Authentication & Security
- Secure registration and login
- Support for login via email or username
- Password hashing with bcryptjs
- JWT-based session management
- Protected routes ensuring only authenticated users access sensitive data

### 🎨 Modern UI & Theme System
- Dark and light theme toggle
- Apple-inspired glass-morphism design
- Fluid animations and micro-interactions
- Skeleton loaders for smooth data loading
- Responsive design for mobile and desktop

### 💬 Smart Approvals
- Join requests with approval workflow
- Owner immediate-approval or quorum-based approvals
- Requester-visible pending request status
- Threshold = ceil(members.length / 2)

## Tech Stack

### Frontend
- **React 18** with Vite for fast development and production builds
- **React Router** for client-side navigation
- **Axios** for HTTP requests with custom interceptors
- **CSS** with CSS variables and modern layout techniques (Flexbox, Grid)

### Backend
- **Node.js** + **Express** for REST API
- **MongoDB Atlas** for cloud-hosted database
- **Mongoose** for schema validation and ORM
- **bcryptjs** for password hashing
- **jsonwebtoken (JWT)** for authentication
- **Deployed on Render.com** for 24/7 availability

## Architecture Highlights

```
RoomSync
├── Frontend (React/Vite) → Vercel
├── Backend (Node/Express) → Render.com
└── Database (MongoDB Atlas) → Cloud
```

- **REST API** with 20+ endpoints covering auth, groups, expenses, and balances
- **Stateless backend** allowing horizontal scaling
- **Database-driven** with Mongoose schemas for User, Group, and Expense models
- **Middleware layers** for auth, error handling, and validation

## Quick Stats

- **Users**: Register with name, email, and unique username
- **Groups**: Support unlimited members per group
- **Expenses**: Unlimited expense entries with timestamps
- **Scalability**: Cloud-based infrastructure ready for production use

## File Structure

```
RoomSync/
├── backend/
│   ├── src/
│   │   ├── models/       # Mongoose schemas
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth, errors, validation
│   │   ├── config/       # Database config
│   │   └── utils/        # Helpers (JWT generation, etc.)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React Contexts (Auth, Theme, App)
│   │   ├── api/          # Axios client setup
│   │   └── styles.css    # Global styles
│   └── package.json
└── docs/                 # This folder
```

## Getting Started

- **Users**: Visit the app, register, create or join groups, and start tracking expenses
- **Developers**: See [06-development.md](06-development.md) for setup and contribution guidelines
- **Deployment**: See [07-deployment.md](07-deployment.md) for hosting and CI/CD information

## Why Choose RoomSync?

✅ **Simple**: Clean, intuitive interface—no learning curve  
✅ **Fair**: Transparent math—everyone knows exactly what's owed  
✅ **Collaborative**: Approve members, control who joins your group  
✅ **Modern**: Glass-morphism design with dark/light themes  
✅ **Scalable**: Cloud infrastructure built for growth  

---

**Version**: 1.0.0 | **Last Updated**: 2026-04-29
