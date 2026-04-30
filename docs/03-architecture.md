# Architecture

## System Architecture Overview

RoomSync follows a **three-tier architecture** with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/Vite)                    │
│              Vercel (CDN + Static Hosting)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS REST API
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                 Backend (Node/Express)                      │
│                  Render.com (Cloud)                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ Mongoose Driver
                           ↓
┌─────────────────────────────────────────────────────────────┐
│            Database (MongoDB Atlas)                         │
│                  Cloud-Hosted                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack
- **React 18** (UI library)
- **Vite** (build tool & dev server)
- **React Router** (client-side routing)
- **Axios** (HTTP client)
- **CSS** (styling with variables and modern techniques)

### Project Structure

```
frontend/
├── src/
│   ├── App.jsx                 # Root component, theme provider
│   ├── main.jsx                # Entry point
│   ├── pages/                  # Page components
│   │   ├── LoginPage.jsx       # Auth: login by email/username
│   │   ├── RegisterPage.jsx    # Auth: registration
│   │   ├── DashboardPage.jsx   # Home: groups, pending requests
│   │   ├── GroupDetailsPage.jsx # Group: members, expenses, balances
│   │   ├── ProfilePage.jsx     # User profile & account settings
│   │   └── GroupsPage.jsx      # Browse/list all groups
│   ├── components/
│   │   ├── TopNav.jsx          # Navigation bar with search
│   │   ├── ThemeToggle.jsx     # Dark/light mode switcher
│   │   ├── Icon.jsx            # SVG icon library
│   │   ├── SkeletonLoader.jsx  # Loading placeholder
│   │   ├── LoadingSpinner.jsx  # Spinner component
│   │   └── ProtectedRoute.jsx  # Route guard for auth
│   ├── context/
│   │   ├── AuthContext.jsx     # Authentication state & methods
│   │   ├── ThemeContext.jsx    # Theme state (light/dark)
│   │   └── AppContext.jsx      # Global app state (groups, expenses)
│   ├── api/
│   │   └── axios.js            # Axios instance with interceptors
│   ├── styles.css              # Global styles, tokens, animations
│   └── index.html              # HTML template
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies
└── dist/                        # Production build output
```

### Key Components

#### **App.jsx**
- Root component
- Provides AuthContext, ThemeContext, AppContext
- Manages routing
- Includes TopNav, ThemeToggle

#### **Pages**
- **LoginPage**: Form-based login with email/username
- **RegisterPage**: Account creation with validation
- **DashboardPage**: Home screen, group cards, pending requests
- **GroupDetailsPage**: Group expenses, balances, members, approvals
- **ProfilePage**: User info, update/delete account

#### **Contexts**
- **AuthContext**: `token`, `user`, `login()`, `register()`, `logout()`, `updateProfile()`, `deleteProfile()`
- **ThemeContext**: `theme`, `accent`, `toggleTheme()` → persists to localStorage
- **AppContext**: `groups`, `expenses`, `createGroup()`, `joinGroup()`, `addMemberToGroup()`, `approveJoinRequest()`, `fetchJoinRequests()`

### Data Flow

```
User Action (click button)
  ↓
Component calls Context method
  ↓
Context method calls API via Axios
  ↓
Backend responds with data
  ↓
Context updates state
  ↓
React re-renders affected components
```

### State Management
- **React Contexts** for global state (no Redux/Zustand)
- **useState** for local component state
- **localStorage** for theme persistence
- **axios interceptors** for automatic JWT token injection

---

## Backend Architecture

### Technology Stack
- **Node.js** (runtime)
- **Express** (web framework)
- **Mongoose** (ODM for MongoDB)
- **bcryptjs** (password hashing)
- **jsonwebtoken** (JWT for auth)

### Project Structure

```
backend/
├── src/
│   ├── app.js              # Express app setup, middleware
│   ├── server.js           # Server start, port binding
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── models/
│   │   ├── User.js         # User schema & methods
│   │   ├── Group.js        # Group schema with joinRequests
│   │   └── Expense.js      # Expense schema
│   ├── controllers/
│   │   ├── authController.js        # Auth logic (register, login, profile)
│   │   ├── groupController.js       # Group operations & join requests
│   │   ├── expenseController.js     # Expense CRUD
│   │   └── balanceController.js     # Balance calculations
│   ├── routes/
│   │   ├── authRoutes.js            # /auth/* endpoints
│   │   ├── groupRoutes.js           # /groups/* endpoints
│   │   ├── expenseRoutes.js         # /expenses/* endpoints
│   │   └── balanceRoutes.js         # /balances/* endpoints
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification
│   │   ├── errorMiddleware.js       # Error handling
│   │   └── validateObjectId.js      # Mongoose ID validation
│   └── utils/
│       └── generateToken.js         # JWT generation
├── .env                    # Environment variables
├── .env.example            # Example env file
├── package.json            # Dependencies
└── node_modules/           # Installed packages
```

### Database Models

#### **User Schema**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  username: String (unique, lowercase),
  memberCode: String (unique, auto-generated),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

#### **Group Schema**
```javascript
{
  _id: ObjectId,
  name: String,
  owner: ObjectId (ref: User),
  members: [ObjectId] (ref: User),
  inviteCode: String (unique, auto-generated),
  joinRequests: [
    {
      userId: ObjectId,
      source: String ("self" or "invite"),
      approvals: [ObjectId],
      createdAt: Date
    }
  ],
  expenses: [ObjectId] (ref: Expense),
  expenseRetentionDays: Number (default: 30),
  createdAt: Date,
  updatedAt: Date
}
```

#### **Expense Schema**
```javascript
{
  _id: ObjectId,
  group: ObjectId (ref: Group),
  description: String,
  amount: Number,
  paidBy: ObjectId (ref: User),
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints

#### Authentication
- `POST /auth/register` → Create account
- `POST /auth/login` → Login (email or username)
- `PATCH /auth/profile` → Update profile
- `DELETE /auth/profile` → Delete account

#### Groups
- `GET /groups` → List user's groups
- `POST /groups` → Create group
- `GET /groups/:id` → Group details
- `DELETE /groups/:id` → Delete group (owner only)
- `POST /groups/join` → Submit join request
- `GET /groups/join-requests` → Get user's pending requests
- `POST /groups/:id/add-member` → Send invite (creates join request)
- `POST /groups/:id/approve/:requestId` → Approve join request

#### Expenses
- `GET /groups/:id/expenses` → List group expenses
- `POST /groups/:id/expenses` → Add expense
- `DELETE /groups/:id/expenses/:expId` → Delete expense

#### Balances
- `GET /groups/:id/balances` → Calculate balances for group
- `POST /groups/:id/settle` → Settle up (optional tracking)
- `PATCH /groups/:id/retention` → Update retention days

### Middleware Pipeline

```
Request
  ↓
CORS Handler
  ↓
Body Parser (JSON/URL)
  ↓
Auth Middleware (verify JWT if needed)
  ↓
Route Handler (controller)
  ↓
Response
  ↓
Error Middleware (catch & format errors)
```

### Authentication Flow

```
User enters credentials
  ↓
POST /auth/login
  ↓
Backend verifies email/username & password
  ↓
Generate JWT token
  ↓
Return token to frontend
  ↓
Frontend stores token (localStorage or session)
  ↓
Subsequent requests include token in Authorization header
  ↓
Backend verifies token with authMiddleware
  ↓
If valid, request proceeds; if invalid, return 401
```

### Join Request & Approval Workflow

```
User clicks "Join Group" with invite code
  ↓
Frontend calls POST /groups/join
  ↓
Backend creates joinRequest in Group.joinRequests
  ↓
Frontend polls GET /groups/join-requests
  ↓
Owner or members can POST /groups/:id/approve/:requestId
  ↓
Backend increments approvals count
  ↓
If owner approves → instant add to members
  ↓
If threshold reached (ceil(members/2)) → auto-add to members
  ↓
Frontend detects user is now in group
```

---

## Data Flow: Creating an Expense

```
1. User fills expense form in GroupDetailsPage
2. Calls AppContext.addExpense(groupId, description, amount, paidBy)
3. AppContext calls POST /groups/:id/expenses via Axios
4. Backend validates data
5. Backend creates Expense document in MongoDB
6. Backend adds expense _id to Group.expenses array
7. Backend returns new expense
8. Frontend updates local state
9. Component re-renders with new expense in list
10. Other users' screens update on next fetch (polling or websocket in future)
```

---

## Deployment Architecture

### Frontend (Vercel)
- Static React build
- Automatic deployment on git push to main
- CDN-backed for fast global delivery
- Environment variables: `VITE_API_BASE_URL`

### Backend (Render.com)
- Node.js server
- Environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT`
- Auto-deploys on git push or manual trigger
- Free tier allows 1 instance (sleeps after 15 min inactivity)

### Database (MongoDB Atlas)
- Cloud-hosted MongoDB cluster
- Connection string: `MONGO_URI` with credentials
- IP whitelisting for security
- Automatic backups and replicas

---

## Security Considerations

✅ **Passwords**: Hashed with bcryptjs (salt rounds: 10)  
✅ **Tokens**: JWT signed with secret, no expiration (can add later)  
✅ **CORS**: Configured to allow frontend domain  
✅ **Input Validation**: Mongoose schemas + middleware checks  
✅ **Auth Guards**: Protected routes require valid JWT  
✅ **Error Handling**: Generic error messages (avoid info leakage)  

### Future Hardening
- Add token expiration & refresh tokens
- Implement rate limiting
- Add request logging & monitoring
- Encrypt sensitive fields in DB
- Implement role-based access control (RBAC)

---

## Scalability Notes

- **Stateless backend**: Can add more Node instances behind load balancer
- **Database indexing**: Indexes on userId, groupId, email, username for fast queries
- **Caching**: Redis can cache frequently accessed groups/balances
- **API pagination**: Can be added to large list endpoints
- **Real-time updates**: WebSocket or polling currently; can upgrade to Socket.io

---

**Version**: 1.0.0 | **Last Updated**: 2026-04-29
