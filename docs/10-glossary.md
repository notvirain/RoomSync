# Glossary

Technical and domain-specific terminology used in RoomSync.

---

## A

**API (Application Programming Interface)**
- A set of rules and protocols that allow different software to communicate
- RoomSync uses a REST API for frontend-backend communication
- Endpoints accept HTTP requests (GET, POST, PATCH, DELETE) and return JSON

**Approval Threshold**
- Minimum number of group members who must approve a join request before the user is automatically added
- Calculated as: `ceil(group.members.length / 2)`
- Example: 4 members = threshold of 2
- Owner can bypass this (auto-approved)

**Atlas (MongoDB Atlas)**
- Cloud-hosted MongoDB service used by RoomSync
- Provides database hosting, backups, and scaling
- Offers free tier (M0 Sandbox) with 512MB storage

**Authorization Header**
- HTTP header that contains the JWT token for API authentication
- Format: `Authorization: Bearer <token>`
- Required for all protected endpoints

---

## B

**Backend**
- Server-side code that handles business logic, database operations, and API endpoints
- RoomSync backend: Node.js + Express
- Runs on Render.com in production
- Communicates with frontend via REST API

**Backdrop Filter**
- CSS property that applies visual effects (blur, brightness) to elements behind it
- Used in RoomSync for glass-morphism effect
- Example: `backdrop-filter: blur(16px)`

**bcryptjs**
- JavaScript library for hashing and comparing passwords
- Passwords hashed with salt (cost factor: 10)
- Prevents plain-text password storage in database

**Blur (CSS)**
- Visual effect that makes elements or backgrounds fuzzy
- Part of glass-morphism design
- Specified in `--blur` CSS variable

**Breadcrumb**
- Navigation aid showing user's current location (not currently used in RoomSync)
- Example: Home > Groups > Apartment 4B > Details

---

## C

**CORS (Cross-Origin Resource Sharing)**
- HTTP standard that allows restricted resources to be requested from domains other than the originating domain
- RoomSync frontend (Vercel) requests API from backend (Render)
- Backend must explicitly allow CORS for frontend domain

**Context (React)**
- React API for managing global state without prop drilling
- RoomSync uses: AuthContext, ThemeContext, AppContext
- Provides: state values and functions to update state

**Controller**
- Express function that handles a specific HTTP request
- Contains business logic (validation, calculations, database queries)
- Example: `authController.register(req, res)`

**CSS Variables**
- Custom properties that store values (colors, sizes, etc.)
- Declared in `:root` or component selectors
- Used with `var(--variable-name)`
- Enables theme switching (light/dark)

---

## D

**Dark Mode**
- Visual theme with dark backgrounds and light text
- RoomSync dark theme: `body[data-theme="dark"]`
- Reduces eye strain in low-light environments

**Data Attribute (HTML)**
- Custom attribute on HTML elements for storing data
- Format: `data-*="value"`
- Example: `<div data-theme="dark">`
- Accessible from CSS and JavaScript

**Database**
- Persistent storage of application data
- RoomSync uses MongoDB
- Stores users, groups, expenses, etc.

**Debounce**
- Technique to delay function execution until user stops triggering it
- Used for search, auto-save, etc.
- Reduces unnecessary function calls

**Deployment**
- Process of putting code into production
- RoomSync: Frontend to Vercel, Backend to Render, Database to MongoDB Atlas
- Usually triggered by git push to main branch

**DTO (Data Transfer Object)**
- Object that carries data between different layers
- Example: API response containing user info
- Reduces tightly-coupled dependencies

---

## E

**Endpoint**
- Specific URL + HTTP method that performs an action
- Example: `POST /groups` creates a group
- RoomSync has 20+ endpoints across auth, groups, expenses

**Environment Variables**
- Configuration values stored outside code
- Examples: `MONGO_URI`, `JWT_SECRET`, `PORT`
- Set via `.env` file (development) or platform settings (production)

**Expense**
- Single transaction that one group member paid
- Contains: description, amount, payer, date, group
- Automatically split equally among group members
- Can be deleted within retention period

**Expense Retention**
- Time period before old expenses are automatically deleted
- Configurable per group (default: 30 days)
- Prevents database bloat

---

## F

**Frontend**
- Client-side code that users interact with in browser
- RoomSync frontend: React + Vite
- Runs on Vercel in production
- Makes API calls to backend

**Full-Stack**
- Complete web application including frontend and backend
- RoomSync is a full-stack app
- Includes database, server, and user interface

---

## G

**Glass-Morphism**
- Design trend using translucency, blur, and gradients to create frosted-glass effect
- RoomSync theme: translucent cards, backdrop blur, subtle borders
- Apple-inspired visual style

**Group**
- Collection of users sharing expenses
- Contains: members, expenses, join requests, settings
- Owner can invite members and manage group
- Members can view/add expenses and see balances

**Group ID**
- MongoDB ObjectId that uniquely identifies a group
- Used in API endpoints: `/groups/:id`
- Example: `507f1f77bcf86cd799439012`

---

## H

**Hash (Password)**
- One-way encryption of password
- Original password can't be recovered from hash
- Verified by hashing input and comparing to stored hash
- bcryptjs used in RoomSync

**Hot Module Reload (HMR)**
- Vite feature that refreshes browser when code changes
- No page reload needed (preserves state)
- Speeds up development

**HTTP Methods**
- Verbs describing action on resource
- `GET`: Retrieve data
- `POST`: Create new resource
- `PATCH`: Partially update resource
- `DELETE`: Remove resource

---

## I

**Icon**
- Small SVG graphic representing action or concept
- RoomSync Icon component provides reusable icons
- Examples: search, group, settings, etc.

**Invite Code**
- Unique string that allows users to join a group
- Generated when group created
- Format: 8-12 character alphanumeric string
- Example: `ABC123XYZ`

**Interceptor (Axios)**
- Middleware function that runs before/after HTTP requests
- RoomSync uses request interceptor to add JWT token to headers
- Can modify requests/responses

---

## J

**JWT (JSON Web Token)**
- Stateless authentication token
- Contains encoded user info (usually userId)
- Verified by backend using secret key
- Sent in `Authorization` header

**Join Request**
- Request from user wanting to join a group
- Waits for approval from owner or members
- Contains: userId, source (self/invite), approvals list
- Auto-converted to membership when threshold met

---

## K

**Keyboard Navigation**
- Using keyboard instead of mouse to interact with app
- Tab: move focus forward
- Shift+Tab: move focus backward
- Enter: activate button
- Escape: close modal

---

## L

**Light Mode**
- Visual theme with light backgrounds and dark text
- RoomSync light theme: `:root` default
- Standard for most web apps
- Default theme for new users

**Localhost**
- Loopback address (127.0.0.1) for local machine
- Development URL: `http://localhost:5173`
- Backend: `http://localhost:5000`

**localStorage**
- Browser API for storing data persistently
- Survives page reload and browser restart
- RoomSync stores: token, theme preference
- Cleared when cookies are cleared

---

## M

**Member**
- User who belongs to a group
- Can view expenses and balances
- Can add expenses
- Cannot change group settings (owner only)

**Member Code**
- Unique identifier for user (different from userId)
- Auto-generated on registration
- Used for display purposes (less technical than ObjectId)
- Example: `MEM001`

**Middleware**
- Function that processes HTTP request before reaching controller
- RoomSync middleware: auth, error handling, validation
- Can modify request/response or reject request

**Mongoose**
- MongoDB ODM (Object Document Mapper) for Node.js
- Provides: schema validation, queries, relationships
- RoomSync uses Mongoose for data modeling

**MongoDB**
- NoSQL database storing documents in JSON-like format
- Collections: users, groups, expenses
- Queries: find, create, update, delete
- Cloud version: MongoDB Atlas

---

## N

**Node.js**
- JavaScript runtime for server-side code
- Allows JavaScript outside browser
- RoomSync backend built with Node.js
- Version: 18+ required

**npm (Node Package Manager)**
- Package manager for JavaScript/Node.js
- Install packages: `npm install <package>`
- Run scripts: `npm run <script-name>`
- Manages dependencies in `package.json`

---

## O

**ObjectId (MongoDB)**
- Unique identifier for documents in MongoDB
- 24-character hexadecimal string
- Auto-generated on document creation
- Example: `507f1f77bcf86cd799439011`

**Owner (Group)**
- User who created the group
- Can delete group and manage settings
- Auto-approved when joining own group
- Has full permissions on group

---

## P

**Pagination**
- Splitting large result set into smaller "pages"
- Parameters: `limit` (items per page), `skip` (offset)
- Improves performance and UX
- Future feature: not currently used in RoomSync

**Props**
- Data passed from parent component to child component
- Read-only (child can't modify)
- Trigger re-render if changed

**Protected Route**
- Route that requires authentication to access
- RoomSync: `/dashboard`, `/groups`, etc. are protected
- `ProtectedRoute` component checks for valid token

---

## Q

**Query (Database)**
- Request for data from database
- Examples: `db.users.find()`, `db.groups.findById(id)`
- Mongoose makes queries with JavaScript methods

**Query Parameter**
- Key-value pair in URL after `?`
- Example: `/expenses?limit=50&skip=0`
- Used for filtering, sorting, pagination

---

## R

**Render.com**
- Cloud platform for hosting Node.js applications
- RoomSync backend hosted here
- Auto-deploys on git push
- Free tier available

**REST API**
- Architectural style for web APIs
- Uses HTTP methods and URL paths
- Stateless (no session required)
- RoomSync follows REST principles

**Route**
- Map from URL path to controller/handler
- Frontend route: `/dashboard` → DashboardPage component
- Backend route: `POST /groups` → createGroup controller

**React**
- JavaScript library for building user interfaces
- Component-based (reusable UI pieces)
- State management (useState, useContext)
- RoomSync frontend built with React

**React Router**
- Library for client-side routing in React apps
- Maps URLs to components
- `<Route>`, `<Link>`, `useNavigate()`, `useParams()`

---

## S

**Schema (Mongoose)**
- Definition of data structure for collection
- Specifies fields, types, validation rules
- Example: User schema has name (String), email (String, unique)
- Ensures data consistency

**Skeleton Loader**
- Placeholder UI that mimics content shape while loading
- Shows shimmer animation
- Improves perceived performance
- RoomSync: used in group list, expense list

**Semantic HTML**
- HTML elements that describe meaning (not just appearance)
- Examples: `<button>`, `<form>`, `<nav>`
- Better accessibility and SEO

**Settlement (Expense)**
- Process of paying off debt / finalizing transactions
- User marks debt as settled
- Balances remain for record (can archive later)
- Currently manual (UI only, no payment processing)

**Stagger Animation**
- Animation where elements appear in sequence with delay
- Each element has `animation-delay: calc(--i * 60ms)`
- Creates cascading effect
- RoomSync: group cards stagger in on load

**State (Component)**
- Data that component manages internally
- Changed with `setState()` or `useState()`
- Re-renders when state changes
- Example: `isLoggedIn`, `isLoading`

---

## T

**Token (JWT)**
- Authentication credential containing user info
- Sent in API requests to prove identity
- Format: 3 base64-encoded parts separated by dots
- Example: `eyJhbG...ciJhb...XjkwN`

**Theme**
- Collection of colors, fonts, and styles
- RoomSync supports: Light (default), Dark
- Stored in CSS variables (`:root` and `body[data-theme="dark"]`)
- Persisted in localStorage

**Throttle**
- Technique to limit function execution frequency
- Different from debounce (debounce delays, throttle limits)
- Example: API rate limiting to 10 calls/second

**Translucency**
- Property of being semi-transparent
- Allows seeing through to elements behind
- RoomSync cards: `rgba(255,255,255,0.36)` in light mode
- Part of glass-morphism design

---

## U

**UI (User Interface)**
- Visual elements users interact with
- RoomSync UI: buttons, forms, cards, navigation
- Modern glass-morphism design with animations

**UX (User Experience)**
- Overall experience of using the app
- Includes: ease of use, performance, accessibility
- RoomSync focus: intuitive group/expense management

---

## V

**Vercel**
- Platform for deploying frontend web apps
- Auto-deploys on git push
- CDN for fast global delivery
- RoomSync frontend deployed here

**Vite**
- Frontend build tool and dev server
- Fast HMR (hot module reload)
- Optimized production build
- RoomSync uses Vite for React build

---

## W

**Webhook**
- Callback URL that receives HTTP POST when event occurs
- Not currently used in RoomSync
- Future: for real-time notifications

---

## X

**XML/JSON**
- Data format for API communication
- RoomSync uses JSON (human-readable)
- Example: `{ "name": "Alice", "email": "alice@example.com" }`

---

## Z

**Zone (CSS)**
- Not a standard term, but RoomSync uses "zones" conceptually
- Example: `topnav-pages` zone, `topnav-center` zone
- Helps organize layout structure

---

## Acronyms

| Acronym | Full Form |
|---------|-----------|
| API | Application Programming Interface |
| bcrypt | Blowfish cryptography |
| CDN | Content Delivery Network |
| CORS | Cross-Origin Resource Sharing |
| CSS | Cascading Style Sheets |
| DTO | Data Transfer Object |
| HMR | Hot Module Reload |
| HTTP | HyperText Transfer Protocol |
| JWT | JSON Web Token |
| MVC | Model-View-Controller |
| NoSQL | Not Only SQL |
| ODM | Object Document Mapper |
| ORM | Object Relational Mapping |
| REST | Representational State Transfer |
| SQL | Structured Query Language |
| SSL | Secure Sockets Layer |
| UI | User Interface |
| UX | User Experience |
| WCAG | Web Content Accessibility Guidelines |
| XSS | Cross-Site Scripting |

---

**Version**: 1.0.0 | **Last Updated**: 2026-04-29
