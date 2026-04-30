# Testing Guide

Comprehensive testing strategies for RoomSync.

## Testing Levels

```
Unit Tests ──────→ Component Tests ──────→ Integration Tests ──────→ E2E Tests
  (Models)          (Pages/Components)        (Flows)              (User Workflows)
```

---

## Frontend Testing

### Unit Tests: Components

#### Setup
```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

#### Example: Icon Component
```javascript
// frontend/src/__tests__/components/Icon.test.jsx
import { render, screen } from "@testing-library/react";
import Icon from "../../components/Icon";

describe("Icon Component", () => {
  test("renders search icon", () => {
    render(<Icon name="search" size={20} />);
    const svg = screen.getByRole("img", { hidden: true });
    expect(svg).toBeInTheDocument();
  });

  test("respects custom size prop", () => {
    const { container } = render(<Icon name="search" size={30} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "30");
  });
});
```

#### Example: ThemeToggle
```javascript
// frontend/src/__tests__/components/ThemeToggle.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "../../context/ThemeContext";
import ThemeToggle from "../../components/ThemeToggle";

describe("ThemeToggle", () => {
  test("toggles theme on click", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Light Mode");
    
    fireEvent.click(button);
    expect(button).toHaveTextContent("Dark Mode");
  });
});
```

#### Run Tests
```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
```

### Integration Tests: Pages

#### Example: LoginPage
```javascript
// frontend/src/__tests__/pages/LoginPage.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import LoginPage from "../../pages/LoginPage";
import * as axios from "../../api/axios";

jest.mock("../../api/axios");

describe("LoginPage", () => {
  test("submits login form with email and password", async () => {
    axios.default.post.mockResolvedValueOnce({
      data: {
        token: "mock-token",
        user: { email: "alice@example.com", username: "alice_01" }
      }
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const identifierInput = screen.getByPlaceholderText(/email or username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(identifierInput, { target: { value: "alice@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.default.post).toHaveBeenCalledWith("/auth/login", {
        identifier: "alice@example.com",
        password: "password123"
      });
    });
  });

  test("shows error message on failed login", async () => {
    axios.default.post.mockRejectedValueOnce({
      response: { data: { error: "Invalid credentials" } }
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });
});
```

### E2E Tests: User Workflows

#### Setup
```bash
npm install -D playwright @playwright/test
npx playwright install
```

#### Example: Create Group & Add Expense
```javascript
// frontend/e2e/create-expense.spec.js
import { test, expect } from "@playwright/test";

test.describe("Create Expense Workflow", () => {
  test("user can create group and add expense", async ({ page }) => {
    // Login
    await page.goto("http://localhost:5173/login");
    await page.fill('input[name="identifier"]', "alice_01");
    await page.fill('input[name="password"]', "password123");
    await page.click("button:has-text('Login')");
    
    // Wait for dashboard
    await page.waitForURL("http://localhost:5173/dashboard");
    expect(page).toHaveURL(/dashboard/);
    
    // Create group
    await page.click("button:has-text('Create Group')");
    await page.fill('input[placeholder="Group name"]', "Apartment");
    await page.click("button:has-text('Create')");
    
    // Check group appears
    await expect(page.locator("text=Apartment")).toBeVisible();
    
    // Click into group
    await page.click("[data-testid=group-card]");
    
    // Add expense
    await page.fill('input[placeholder="Description"]', "Groceries");
    await page.fill('input[placeholder="Amount"]', "100");
    await page.click("button:has-text('Add Expense')");
    
    // Verify expense
    await expect(page.locator("text=Groceries")).toBeVisible();
    await expect(page.locator("text=$100")).toBeVisible();
  });
});
```

#### Run E2E Tests
```bash
npx playwright test                  # Run all tests
npx playwright test --ui             # Interactive mode
npx playwright test --headed         # See browser
```

---

## Backend Testing

### Unit Tests: Models

#### Setup
```bash
cd backend
npm install -D jest mongodb-memory-server
```

#### Example: User Model
```javascript
// backend/src/__tests__/models/User.test.js
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../../models/User");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("User Model", () => {
  test("creates user with valid data", async () => {
    const user = await User.create({
      name: "Alice",
      email: "alice@example.com",
      username: "alice_01",
      password: "hashedpassword"
    });

    expect(user._id).toBeDefined();
    expect(user.email).toBe("alice@example.com");
    expect(user.memberCode).toBeDefined();
  });

  test("fails to create duplicate email", async () => {
    await User.create({
      name: "Alice",
      email: "alice@example.com",
      username: "alice_01",
      password: "hashed"
    });

    const duplicate = User.create({
      name: "Alice2",
      email: "alice@example.com",
      username: "alice_02",
      password: "hashed"
    });

    await expect(duplicate).rejects.toThrow();
  });
});
```

### Unit Tests: Controllers

#### Example: Auth Controller
```javascript
// backend/src/__tests__/controllers/authController.test.js
import bcryptjs from "bcryptjs";
import User from "../../models/User";
import { register, login } from "../../controllers/authController";
import * as generateToken from "../../utils/generateToken";

jest.mock("../../models/User");
jest.mock("../../utils/generateToken");
jest.mock("bcryptjs");

describe("Auth Controller", () => {
  test("register creates new user", async () => {
    const req = {
      body: {
        name: "Alice",
        email: "alice@example.com",
        username: "alice_01",
        password: "password123"
      }
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.create.mockResolvedValueOnce({
      _id: "user1",
      name: "Alice",
      email: "alice@example.com"
    });

    generateToken.mockReturnValueOnce("mock-token");

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(User.create).toHaveBeenCalled();
  });

  test("login returns token for valid credentials", async () => {
    const req = {
      body: {
        identifier: "alice_01",
        password: "password123"
      }
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findOne.mockResolvedValueOnce({
      _id: "user1",
      username: "alice_01",
      password: "hashedpassword"
    });

    bcryptjs.compare.mockResolvedValueOnce(true);
    generateToken.mockReturnValueOnce("mock-token");

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
```

### Integration Tests: API Endpoints

#### Example: Group Endpoints
```javascript
// backend/src/__tests__/routes/groupRoutes.test.js
import request from "supertest";
import app from "../../app";
import User from "../../models/User";
import Group from "../../models/Group";

let token, userId, groupId;

beforeAll(async () => {
  // Create test user
  const user = await User.create({
    name: "Test User",
    email: "test@example.com",
    username: "testuser",
    password: "hashed"
  });
  userId = user._id;
  token = generateToken(userId);
});

describe("Group Routes", () => {
  test("creates group", async () => {
    const response = await request(app)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Group" });

    expect(response.status).toBe(201);
    expect(response.body.group.name).toBe("Test Group");
    expect(response.body.group.owner).toBe(userId);
    groupId = response.body.group._id;
  });

  test("gets user's groups", async () => {
    const response = await request(app)
      .get("/groups")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.groups).toHaveLength(1);
    expect(response.body.groups[0]._id).toBe(groupId);
  });

  test("adds expense to group", async () => {
    const response = await request(app)
      .post(`/groups/${groupId}/expenses`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "Groceries",
        amount: 100,
        paidBy: userId
      });

    expect(response.status).toBe(201);
    expect(response.body.expense.description).toBe("Groceries");
  });
});
```

#### Run Backend Tests
```bash
npm test              # Run all tests
npm test:watch       # Watch mode
npm test:coverage    # Coverage report
```

---

## Manual Testing

### Test Scenarios

#### User Registration
- [ ] Register with valid data
- [ ] Register with duplicate email (fails)
- [ ] Register with duplicate username (fails)
- [ ] Register with weak password (fails)
- [ ] Password is hashed in database

#### User Login
- [ ] Login with email and password
- [ ] Login with username and password
- [ ] Login with invalid credentials (fails)
- [ ] Token stored in localStorage
- [ ] Can access protected routes with token

#### Group Creation
- [ ] Create group with valid name
- [ ] Group owner is current user
- [ ] Invite code is generated
- [ ] Cannot create duplicate group name

#### Adding Members
- [ ] Invite member by username
- [ ] Member receives join request
- [ ] Owner can approve request
- [ ] Member count increments
- [ ] Member can view group after approval

#### Expense Tracking
- [ ] Add expense with amount and payer
- [ ] Expense appears in list
- [ ] Balance updates correctly
- [ ] Cannot add expense with 0 or negative amount
- [ ] Expense retention deletes old expenses

#### Theme System
- [ ] Toggle between light and dark theme
- [ ] Theme persists after reload
- [ ] All components styled correctly in both themes
- [ ] Text contrast meets accessibility standards

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all buttons and links
- [ ] Enter key submits forms
- [ ] Escape closes modals/dropdowns
- [ ] Focus ring is visible

### Screen Reader
- [ ] Use NVDA (Windows) or VoiceOver (Mac)
- [ ] All text readable
- [ ] Images have alt text
- [ ] Form labels associated with inputs

### Color Contrast
- [ ] Use WAVE or Axe Chrome extension
- [ ] WCAG AA compliance (4.5:1 for text)
- [ ] WCAG AAA preferred (7:1 for text)

---

## Performance Testing

### Frontend
```bash
# Lighthouse audit
npm run build
npx lighthouse http://localhost:5173
```

### Load Testing (Backend)
```bash
# Install Apache Bench
ab -n 1000 -c 10 http://localhost:5000/

# Or use k6
npm install -g k6
k6 run load-test.js
```

#### Load Test Example
```javascript
// load-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "30s",
};

export default function () {
  const payload = JSON.stringify({
    identifier: "alice_01",
    password: "password123",
  });

  const response = http.post("http://localhost:5000/auth/login", payload, {
    headers: { "Content-Type": "application/json" },
  });

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

---

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      - run: cd backend && npm install && npm test

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      - run: cd frontend && npm install && npm test && npm run build
```

---

## Test Coverage Goals

| Area | Goal |
|------|------|
| Backend Controllers | 80%+ |
| Frontend Components | 70%+ |
| Critical Flows | 90%+ |
| Overall | 75%+ |

### Generate Coverage Report
```bash
npm test -- --coverage

# Output:
# File                        | Lines | Functions | Branches |
# ─────────────────────────────────────────────────────────
# backend/src/controllers     | 85%   | 82%       | 78%
# frontend/src/pages          | 72%   | 68%       | 65%
```

---

## Bug Reporting Template

```markdown
**Title**: [Bug] Brief description

**Environment**:
- Browser: Chrome 120 / Firefox 121 / Safari 17
- OS: Windows 11 / macOS / Ubuntu
- Backend version: 1.0.0

**Steps to Reproduce**:
1. Login with account
2. Create new group
3. Add expense
4. Observe issue

**Expected Behavior**:
Balance should update immediately

**Actual Behavior**:
Balance remains unchanged until page refresh

**Logs**:
[Paste any error logs from console]

**Screenshots**:
[Attach screenshots if visual issue]
```

---

**Version**: 1.0.0 | **Last Updated**: 2026-04-29
