# RoomSync Documentation

Welcome to the complete RoomSync documentation. This folder contains everything you need to understand, use, develop, and deploy RoomSync.

---

## 📚 Documentation Index

### For Users
- **[01-overview.md](01-overview.md)** — What is RoomSync? Core features, tech stack, and file structure
- **[02-user-guide.md](02-user-guide.md)** — How to register, create groups, add expenses, view balances, and more

### For Developers
- **[03-architecture.md](03-architecture.md)** — System architecture, data flow, technology stack, API structure
- **[04-feature-deep-dive.md](04-feature-deep-dive.md)** — Detailed explanation of features: expenses, balances, join requests, theme, CSV export, retention, search
- **[05-api-reference.md](05-api-reference.md)** — Complete REST API documentation with all endpoints, request/response examples
- **[06-development.md](06-development.md)** — Local setup, development workflow, adding features, debugging, git workflow
- **[08-testing.md](08-testing.md)** — Unit tests, integration tests, E2E tests, manual testing, CI/CD setup

- **[30-page-academic-report-template.md](30-page-academic-report-template.md)** — Fillable 30-page academic report template

### For DevOps / Deployment
- **[07-deployment.md](07-deployment.md)** — Deploying to MongoDB Atlas, Render.com (backend), Vercel (frontend), environment variables, monitoring

### For Support
- **[09-troubleshooting.md](09-troubleshooting.md)** — Common issues and solutions for users and developers
- **[10-glossary.md](10-glossary.md)** — Technical terminology and acronyms

---

## 🚀 Quick Start

### For Users
1. Visit [RoomSync App](https://roomsync.vercel.app)
2. Register with email, username, and password
3. Create a group or join with invite code
4. Add expenses and see who owes whom

See **[02-user-guide.md](02-user-guide.md)** for detailed instructions.

### For Developers

#### Local Development
```bash
# Clone repo
git clone https://github.com/notvirain/RoomSync.git
cd RoomSync

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with MongoDB URI and JWT secret
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:5000" > .env.local
npm run dev
```

Visit `http://localhost:5173/` in browser.

See **[06-development.md](06-development.md)** for complete setup.

#### Deploying
1. Backend → Render.com
2. Frontend → Vercel
3. Database → MongoDB Atlas

See **[07-deployment.md](07-deployment.md)** for step-by-step instructions.

---

## 📖 How to Use This Documentation

### I want to...

**Understand the app**
→ Start with [01-overview.md](01-overview.md)

**Learn how to use RoomSync**
→ Read [02-user-guide.md](02-user-guide.md)

**Understand how RoomSync works internally**
→ Read [03-architecture.md](03-architecture.md)

**Deep dive into a feature**
→ Check [04-feature-deep-dive.md](04-feature-deep-dive.md)

**Use the API**
→ Reference [05-api-reference.md](05-api-reference.md)

**Set up development environment**
→ Follow [06-development.md](06-development.md)

**Deploy to production**
→ Follow [07-deployment.md](07-deployment.md)

**Write tests**
→ Check [08-testing.md](08-testing.md)

**Solve a problem**
→ Search [09-troubleshooting.md](09-troubleshooting.md)

**Understand terminology**
→ Check [10-glossary.md](10-glossary.md)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│          Frontend (React + Vite)                    │
│       Deployed on Vercel CDN                        │
│       https://roomsync.vercel.app                   │
└────────────────────┬────────────────────────────────┘
                     │ HTTP/REST API
                     ↓
┌─────────────────────────────────────────────────────┐
│       Backend (Node.js + Express)                   │
│       Deployed on Render.com                        │
│    https://roomsync-2b16.onrender.com               │
└────────────────────┬────────────────────────────────┘
                     │ Mongoose Driver
                     ↓
┌─────────────────────────────────────────────────────┐
│      Database (MongoDB Atlas)                       │
│         Cloud-Hosted                                │
│    Stores: Users, Groups, Expenses                  │
└─────────────────────────────────────────────────────┘
```

---

## 💡 Key Concepts

### Groups
- Container for shared expenses
- Has members, expenses, join requests
- Owner manages invitations and settings
- Members split expenses equally

### Expenses
- Single transaction one member paid
- Automatically split among all group members
- Deleted after retention period (default: 30 days)
- Can be exported to CSV

### Balances
- Real-time calculation of who owes whom
- Sum of (paid - owed_portion) for each member
- Updated automatically when expenses added/deleted
- Shows settlement suggestions

### Join Requests
- Members request to join a group
- Owner or quorum of members must approve
- Prevents unauthorized access
- Shows progress to requester on dashboard

### Theme System
- Light and dark mode support
- Glass-morphism design (Apple-inspired)
- Persisted to browser storage
- Respects reduced-motion preferences

---

## 🛠️ Technology Stack

### Frontend
- **React 18** — UI library
- **Vite** — Build tool & dev server
- **React Router** — Client-side routing
- **Axios** — HTTP client
- **CSS** — Styling with variables

### Backend
- **Node.js 18+** — Runtime
- **Express** — Web framework
- **MongoDB** — Database
- **Mongoose** — ODM
- **bcryptjs** — Password hashing
- **JWT** — Authentication

### Deployment
- **Vercel** — Frontend hosting
- **Render.com** — Backend hosting
- **MongoDB Atlas** — Database hosting

---

## 📊 Feature Checklist

### Core Features
- ✅ User authentication (email/username + password)
- ✅ Group creation and management
- ✅ Join request approval workflow
- ✅ Expense tracking and splitting
- ✅ Real-time balance calculation
- ✅ Dark/light theme toggle
- ✅ CSV export
- ✅ Auto-delete old expenses
- ✅ Search functionality
- ✅ Profile management

### Advanced Features
- ✅ Glass-morphism UI design
- ✅ Skeleton loaders
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Protected routes
- ✅ JWT authentication
- ✅ CORS handling
- ✅ Error handling & validation

### Planned Features
- ⏳ Token expiration & refresh
- ⏳ Payment integration (Paytm/GPay)
- ⏳ WebSocket real-time updates
- ⏳ Custom expense split
- ⏳ Expense categories
- ⏳ Receipt uploads
- ⏳ Multi-currency support
- ⏳ Mobile app

---

## 📞 Support & Contributions

### Getting Help
- Check [09-troubleshooting.md](09-troubleshooting.md) for common issues
- Search [10-glossary.md](10-glossary.md) for terminology
- Open issue on [GitHub](https://github.com/notvirain/RoomSync/issues)

### Contributing
1. Fork repository
2. Create feature branch (`git checkout -b feature/xyz`)
3. Make changes and test locally
4. Commit with clear message
5. Push and create pull request

See [06-development.md](06-development.md) for git workflow details.

---

## 📋 Document Statistics

| Document | Lines | Topics |
|----------|-------|--------|
| 01-overview.md | ~150 | Project intro, features, tech stack |
| 02-user-guide.md | ~350 | User workflows, FAQs |
| 03-architecture.md | ~400 | System design, data flow |
| 04-feature-deep-dive.md | ~500 | Feature details, algorithms |
| 05-api-reference.md | ~450 | All endpoints, request/response |
| 06-development.md | ~500 | Local setup, development workflow |
| 07-deployment.md | ~400 | Deployment instructions |
| 08-testing.md | ~450 | Testing strategies |
| 09-troubleshooting.md | ~450 | Common issues & solutions |
| 10-glossary.md | ~350 | Terminology & acronyms |
| **Total** | **~3,800** | **Comprehensive coverage** |

---

## ✅ Documentation Checklist

When adding new features, update:
- [ ] [01-overview.md](01-overview.md) — Add to features section
- [ ] [02-user-guide.md](02-user-guide.md) — Add user instructions
- [ ] [03-architecture.md](03-architecture.md) — Add to data flow
- [ ] [04-feature-deep-dive.md](04-feature-deep-dive.md) — Detailed explanation
- [ ] [05-api-reference.md](05-api-reference.md) — Document endpoints
- [ ] [06-development.md](06-development.md) — Add setup steps if needed
- [ ] [08-testing.md](08-testing.md) — Add test examples
- [ ] [09-troubleshooting.md](09-troubleshooting.md) — Add common issues
- [ ] [10-glossary.md](10-glossary.md) — Add new terms

---

## 🔗 Quick Links

### External Resources
- [React Docs](https://react.dev/)
- [Express Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Vite Docs](https://vitejs.dev/)
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)

### Project Links
- [GitHub Repository](https://github.com/notvirain/RoomSync)
- [Live App](https://roomsync.vercel.app)
- [Backend API](https://roomsync-2b16.onrender.com)

---

**Documentation Version**: 1.0.0  
**Last Updated**: 2026-04-29  
**Maintained By**: Virain

---

## 📖 Reading Guide

**First Time Here?**
1. Start with [01-overview.md](01-overview.md) (10 min read)
2. Check [02-user-guide.md](02-user-guide.md) if you're a user (15 min read)
3. Read [06-development.md](06-development.md) if you're a developer (20 min read)

**Full Deep Dive?**
1. [01-overview.md](01-overview.md) — Project overview
2. [03-architecture.md](03-architecture.md) — System design
3. [04-feature-deep-dive.md](04-feature-deep-dive.md) — Feature details
4. [05-api-reference.md](05-api-reference.md) — API documentation
5. [06-development.md](06-development.md) — Development setup
6. [08-testing.md](08-testing.md) — Testing strategies

**Just Need Help?**
→ Go to [09-troubleshooting.md](09-troubleshooting.md)

---

Happy coding! 🚀
