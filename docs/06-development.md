# Development Guide

Instructions for setting up, running, and contributing to RoomSync locally.

## Prerequisites

- **Node.js** 18+ (check: `node --version`)
- **npm** 9+ (check: `npm --version`)
- **MongoDB Atlas** account (or local MongoDB instance)
- **Git** (for version control)
- A code editor (VS Code recommended)

---

## Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/notvirain/RoomSync.git
cd RoomSync
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Create Environment File
```bash
# Copy example env
cp .env.example .env

# Edit .env with your values:
# MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/roomsync
# JWT_SECRET=your_secret_key_here
# PORT=5000
```

#### Verify MongoDB Connection
```bash
# Test connection
node -e "require('./src/config/db.js')"
```

#### Start Backend Server
```bash
# Development (with nodemon auto-restart)
npm run dev

# Or production build
npm start
```

**Output**:
```
Server running on http://localhost:5000
MongoDB connected
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Create Environment File
```bash
# Create .env.local
echo "VITE_API_BASE_URL=http://localhost:5000" > .env.local
```

#### Start Development Server
```bash
npm run dev
```

**Output**:
```
Local:   http://localhost:5173/
```

### 4. Open in Browser

Navigate to `http://localhost:5173/` and you should see the RoomSync login page.

---

## Development Workflow

### Running Both Servers

#### Option 1: Two Terminal Tabs
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

#### Option 2: Using npm-run-all
```bash
npm install -D npm-run-all

# In root package.json scripts:
"dev": "npm-run-all -p dev:backend dev:frontend"
"dev:backend": "cd backend && npm run dev"
"dev:frontend": "cd frontend && npm run dev"
```

### Making Changes

#### Backend Changes
- Edit files in `backend/src/`
- Server auto-restarts (nodemon)
- Test with REST client (Postman, Insomnia) or curl

#### Frontend Changes
- Edit files in `frontend/src/`
- Browser auto-refreshes (Vite HMR)
- Check browser console for errors

### Testing Your Changes

#### Backend API Testing
```bash
# Example: Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "alice_01", "password": "password"}'
```

Use Postman/Insomnia for easier testing.

#### Frontend Testing
- Manual browser testing
- Check browser DevTools (F12)
- Redux DevTools for context inspection (if added)

---

## Project Structure Deep Dive

### Backend

```
backend/
├── src/
│   ├── app.js                   # Express setup, middleware
│   ├── server.js                # Entry point, server start
│   ├── config/
│   │   └── db.js                # MongoDB connection logic
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Group.js             # Group schema with joinRequests
│   │   └── Expense.js           # Expense schema
│   ├── controllers/             # Business logic
│   │   ├── authController.js    # Auth: register, login, profile
│   │   ├── groupController.js   # Groups, join requests, approvals
│   │   ├── expenseController.js # Expense CRUD
│   │   └── balanceController.js # Balance calculations
│   ├── routes/                  # API endpoints
│   │   ├── authRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── expenseRoutes.js
│   │   └── balanceRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── errorMiddleware.js   # Error handling
│   │   └── validateObjectId.js  # Mongoose ID validation
│   └── utils/
│       └── generateToken.js     # JWT token creation
├── .env                         # Environment variables (local only)
├── .env.example                 # Template for .env
├── package.json                 # Dependencies & scripts
└── node_modules/                # Installed packages
```

### Frontend

```
frontend/
├── src/
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Vite entry point
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── GroupDetailsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── GroupsPage.jsx
│   ├── components/
│   │   ├── TopNav.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── Icon.jsx
│   │   ├── SkeletonLoader.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   ├── AuthContext.jsx      # Auth state (token, user, login)
│   │   ├── ThemeContext.jsx     # Theme state (light/dark)
│   │   └── AppContext.jsx       # App state (groups, expenses)
│   ├── api/
│   │   └── axios.js             # Axios client setup
│   ├── styles.css               # Global styles
│   └── index.html               # HTML template
├── vite.config.js               # Vite configuration
├── package.json                 # Dependencies & scripts
└── dist/                        # Production build (generated)
```

---

## Key Technologies

### Backend

#### Express
- Web framework for routing & middleware
- Key packages:
  - `express-cors`: Handle CORS
  - `express.json()`: Parse JSON requests

#### Mongoose
- MongoDB ORM/ODM
- Schema validation
- Key methods:
  - `findById()`, `findOne()`, `find()`
  - `create()`, `save()`, `updateOne()`, `deleteOne()`

#### bcryptjs
```javascript
// Hashing password
const hashedPassword = await bcryptjs.hash(password, 10);

// Comparing password
const isMatch = await bcryptjs.compare(password, user.password);
```

#### jsonwebtoken (JWT)
```javascript
// Create token
const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Frontend

#### React Hooks
- `useState`: Component state
- `useEffect`: Side effects (fetch, cleanup)
- `useContext`: Access context values
- `useRef`: Direct DOM access
- `useReducer`: Complex state logic (optional)

#### Vite
- Fast development server
- Instant HMR (hot module reload)
- Optimized production build
- ESM native support

#### React Router
```javascript
import { useNavigate, useParams } from "react-router-dom";

const navigate = useNavigate();      // Programmatic navigation
const { id } = useParams();          // Route parameters
const navigate("-1");                 // Go back
```

#### Axios
```javascript
// Instance with interceptors
const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL
});

// Auto-attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## Common Tasks

### Add New API Endpoint

#### Backend

1. **Add controller method** (`backend/src/controllers/groupController.js`):
```javascript
export const getGroupStats = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);
    // ... logic ...
    res.json({ stats: { ... } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

2. **Add route** (`backend/src/routes/groupRoutes.js`):
```javascript
router.get("/:id/stats", authMiddleware, getGroupStats);
```

#### Frontend

1. **Add context method** (`frontend/src/context/AppContext.jsx`):
```javascript
const fetchGroupStats = async (groupId) => {
  const response = await axios.get(`/groups/${groupId}/stats`);
  return response.data.stats;
};
```

2. **Use in component**:
```javascript
const AppContext = useContext(AppContext);
const [stats, setStats] = useState(null);

useEffect(() => {
  AppContext.fetchGroupStats(groupId).then(setStats);
}, [groupId]);
```

### Add New Page

1. **Create component** (`frontend/src/pages/NewPage.jsx`):
```javascript
const NewPage = () => {
  return <div>New Page Content</div>;
};
export default NewPage;
```

2. **Add route** (`frontend/src/App.jsx`):
```javascript
<Route path="/newpage" element={<NewPage />} />
```

3. **Add navigation link** (TopNav or menu):
```javascript
<Link to="/newpage">New Page</Link>
```

### Add Styling

#### Component-Specific Styles
Use `styles.css` with class names:
```css
.my-component {
  display: flex;
  gap: 1rem;
  /* ... */
}
```

#### CSS Variables
Update `:root` in `styles.css`:
```css
:root {
  --my-color: #FF0000;
}

.component {
  color: var(--my-color);
}
```

---

## Debugging

### Backend Debugging

#### Logging
```javascript
console.log("User:", user);  // Basic logging
console.error("Error:", err); // Error logging
```

#### VS Code Debugger
Add `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Backend",
      "program": "${workspaceFolder}/backend/src/server.js",
      "restart": true,
      "runtimeArgs": ["--inspect"]
    }
  ]
}
```

### Frontend Debugging

#### Browser DevTools
- **Console**: Logs, errors, warnings
- **Network**: API requests, responses
- **Elements**: DOM inspection
- **Sources**: Breakpoints, stepping

#### React DevTools
- Browser extension for React inspection
- Component tree, state inspection
- Props tracking

---

## Testing

### Backend Unit Tests
```bash
npm install -D jest

# Create test file: backend/src/__tests__/models/User.test.js
npm test
```

### Frontend Component Tests
```bash
npm install -D vitest @testing-library/react

# Create test file: frontend/src/__tests__/pages/LoginPage.test.jsx
npm test
```

---

## Building for Production

### Frontend Build
```bash
cd frontend
npm run build

# Output in dist/
# Upload to Vercel or any static host
```

### Backend Build
```bash
# Create production .env
cp .env .env.production

# Deploy to Render.com or similar
# Set environment variables in hosting platform
```

---

## Performance Tips

### Frontend
- Use React.memo() for expensive components
- Lazy load routes with React.lazy()
- Optimize images
- Remove unused CSS

### Backend
- Index frequently queried fields
- Use pagination for large lists
- Cache results with Redis
- Monitor database query performance

---

## Git Workflow

### Feature Branch
```bash
git checkout -b feature/add-expense-filter
# Make changes
git add .
git commit -m "Add expense filter by date"
git push origin feature/add-expense-filter
# Create pull request on GitHub
```

### Keep Local Updated
```bash
git fetch origin
git pull origin main
```

### Revert Changes
```bash
git reset --hard HEAD          # Undo all local changes
git revert <commit-hash>       # Undo specific commit (creates new commit)
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### CORS Errors
- Ensure backend has correct CORS configuration
- Check `VITE_API_BASE_URL` matches backend URL

### Database Connection Issues
- Verify `MONGO_URI` in .env
- Check MongoDB Atlas IP whitelist
- Ensure network connectivity

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

---

## Code Style

### Naming Conventions
- **Files**: camelCase (e.g., `authController.js`)
- **Components**: PascalCase (e.g., `LoginPage.jsx`)
- **Variables**: camelCase (e.g., `userEmail`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

### Comments
```javascript
// Comment for single line
// Another comment

/**
 * Function description
 * @param {String} userId - User identifier
 * @returns {Promise<Object>} User object
 */
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/xyz`)
3. Make changes & test locally
4. Commit with clear message (`git commit -m "Add feature xyz"`)
5. Push to your fork (`git push origin feature/xyz`)
6. Create pull request to main

---

## Useful Resources

- [Node.js Docs](https://nodejs.org/docs/)
- [Express Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)

---

**Version**: 1.0.0 | **Last Updated**: 2026-04-29
