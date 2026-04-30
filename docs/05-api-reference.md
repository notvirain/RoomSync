# API Reference

Complete documentation of all RoomSync REST endpoints.

## Base URL

- **Production**: `https://roomsync-2b16.onrender.com`
- **Local Dev**: `http://localhost:5000`

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained from the login endpoint and are valid indefinitely (future: add expiration).

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2026-04-29T10:30:00Z"
}
```

### Common Status Codes
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: No permission
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate entry (e.g., email exists)
- `500 Internal Server Error`: Server error

---

## Authentication Endpoints

### POST /auth/register

Create a new user account.

**Request Body**
```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "username": "alice_01",
  "password": "securepass123"
}
```

**Validation**
- `name`: Required, string, 2-100 chars
- `email`: Required, unique, valid email format
- `username`: Required, unique, 3-20 chars, lowercase alphanumeric + underscore
- `password`: Required, minimum 6 chars (will be hashed with bcryptjs)

**Response (201 Created)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "username": "alice_01",
    "memberCode": "MEM001"
  }
}
```

**Error Responses**
- `400`: Email already exists, Username already exists, Invalid email format
- `500`: Server error

---

### POST /auth/login

Authenticate user and receive JWT token.

**Request Body**
```json
{
  "identifier": "alice@example.com",
  "password": "securepass123"
}
```

Or use username:
```json
{
  "identifier": "alice_01",
  "password": "securepass123"
}
```

**Parameters**
- `identifier`: Email or username
- `password`: User's password (plain text, will be hashed for comparison)

**Response (200 OK)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "username": "alice_01",
    "memberCode": "MEM001"
  }
}
```

**Error Responses**
- `400`: Missing identifier or password
- `401`: Invalid credentials
- `404`: User not found

---

### PATCH /auth/profile

Update current user's profile.

**Request Body**
```json
{
  "name": "Alice Smith",
  "password": "newpass456"
}
```

**Parameters** (optional)
- `name`: New display name
- `password`: New password (will be hashed)

**Response (200 OK)**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "username": "alice_01",
    "memberCode": "MEM001"
  }
}
```

**Requires**: Valid JWT token

---

### DELETE /auth/profile

Permanently delete current user's account.

**Request Body**: Empty

**Response (200 OK)**
```json
{
  "message": "Account deleted successfully"
}
```

**Requires**: Valid JWT token

**Note**: Deletes user record; user's expenses/memberships remain for audit.

---

## Group Endpoints

### POST /groups

Create a new expense group.

**Request Body**
```json
{
  "name": "Apartment 4B"
}
```

**Parameters**
- `name`: Group name, required, 1-100 chars

**Response (201 Created)**
```json
{
  "group": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Apartment 4B",
    "owner": "507f1f77bcf86cd799439011",
    "members": ["507f1f77bcf86cd799439011"],
    "inviteCode": "ABC123XYZ",
    "joinRequests": [],
    "expenses": [],
    "expenseRetentionDays": 30,
    "createdAt": "2026-04-29T10:00:00Z"
  }
}
```

**Requires**: Valid JWT token

---

### GET /groups

List all groups for current user.

**Query Parameters**
- None currently

**Response (200 OK)**
```json
{
  "groups": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Apartment 4B",
      "owner": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Alice Johnson",
        "username": "alice_01"
      },
      "members": [
        {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Alice Johnson",
          "username": "alice_01"
        },
        {
          "_id": "507f1f77bcf86cd799439013",
          "name": "Bob Smith",
          "username": "bob_01"
        }
      ],
      "memberCount": 2,
      "expenseCount": 5,
      "joinRequests": [
        {
          "_id": "req001",
          "userId": "507f1f77bcf86cd799439014",
          "source": "self",
          "approvals": 1,
          "threshold": 1,
          "createdAt": "2026-04-29T09:00:00Z"
        }
      ]
    }
  ]
}
```

**Requires**: Valid JWT token

---

### GET /groups/:id

Get detailed information about a specific group.

**Parameters**
- `id`: Group ID (MongoDB ObjectId)

**Response (200 OK)**
```json
{
  "group": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Apartment 4B",
    "owner": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Alice Johnson"
    },
    "members": [...],
    "inviteCode": "ABC123XYZ",
    "joinRequests": [...],
    "expenses": [...],
    "expenseRetentionDays": 30
  }
}
```

**Requires**: User must be a member of the group

---

### DELETE /groups/:id

Delete a group (owner only).

**Parameters**
- `id`: Group ID

**Response (200 OK)**
```json
{
  "message": "Group deleted successfully"
}
```

**Requires**: User must be the group owner

**Error Responses**
- `403`: User is not the group owner
- `404`: Group not found

---

### POST /groups/join

Submit a request to join a group using an invite code.

**Request Body**
```json
{
  "inviteCode": "ABC123XYZ"
}
```

**Parameters**
- `inviteCode`: Unique code from group owner

**Response (201 Created)**
```json
{
  "message": "Join request submitted",
  "request": {
    "_id": "req001",
    "userId": "507f1f77bcf86cd799439014",
    "source": "self",
    "approvals": 0,
    "threshold": 1
  }
}
```

**Requires**: Valid JWT token

**Error Responses**
- `404`: Invite code not found
- `409`: User is already a member of this group

---

### GET /groups/join-requests

Get current user's pending join requests.

**Response (200 OK)**
```json
{
  "requests": [
    {
      "groupId": "507f1f77bcf86cd799439012",
      "groupName": "Apartment 4B",
      "requestId": "req001",
      "approvals": 1,
      "threshold": 2,
      "source": "self",
      "createdAt": "2026-04-29T09:00:00Z"
    }
  ]
}
```

**Requires**: Valid JWT token

---

### POST /groups/:id/add-member

Invite a member to join the group (owner/member).

**Parameters**
- `id`: Group ID

**Request Body**
```json
{
  "username": "bob_01"
}
```

**Response (201 Created)**
```json
{
  "message": "Invite sent",
  "request": {
    "_id": "req002",
    "userId": "507f1f77bcf86cd799439013",
    "source": "invite",
    "approvals": 0,
    "threshold": 2
  }
}
```

**Requires**: User must be a group member

---

### POST /groups/:id/approve/:requestId

Approve a join request (member can approve if threshold logic applies).

**Parameters**
- `id`: Group ID
- `requestId`: Join request ID

**Request Body**: Empty

**Response (200 OK)**
```json
{
  "message": "Approval recorded",
  "approvals": 2,
  "threshold": 2,
  "status": "added"  // or "pending"
}
```

If threshold met:
```json
{
  "message": "User added to group",
  "status": "added",
  "userId": "507f1f77bcf86cd799439014"
}
```

**Requires**: User must be a group member

---

### PATCH /groups/:id/retention

Update expense retention settings.

**Parameters**
- `id`: Group ID

**Request Body**
```json
{
  "expenseRetentionDays": 60
}
```

**Parameters**
- `expenseRetentionDays`: Number, range 7-365

**Response (200 OK)**
```json
{
  "group": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Apartment 4B",
    "expenseRetentionDays": 60
  }
}
```

**Requires**: User must be the group owner

---

## Expense Endpoints

### POST /groups/:id/expenses

Add an expense to a group.

**Parameters**
- `id`: Group ID

**Request Body**
```json
{
  "description": "Costco groceries",
  "amount": 120.50,
  "paidBy": "507f1f77bcf86cd799439011",
  "date": "2026-04-29"
}
```

**Parameters**
- `description`: Required, string, 1-200 chars
- `amount`: Required, number, > 0
- `paidBy`: Required, user ID who paid
- `date`: Optional, ISO date string (defaults to today)

**Response (201 Created)**
```json
{
  "expense": {
    "_id": "exp001",
    "group": "507f1f77bcf86cd799439012",
    "description": "Costco groceries",
    "amount": 120.50,
    "paidBy": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Alice Johnson"
    },
    "date": "2026-04-29",
    "createdAt": "2026-04-29T10:30:00Z"
  }
}
```

**Requires**: User must be a group member

---

### GET /groups/:id/expenses

List expenses for a group.

**Parameters**
- `id`: Group ID

**Query Parameters**
- `limit`: Optional, default 50
- `skip`: Optional, default 0 (pagination)
- `sort`: Optional, "newest" (default) or "oldest"
- `format`: Optional, "json" (default) or "csv"

**Response (200 OK)**
```json
{
  "expenses": [
    {
      "_id": "exp001",
      "description": "Costco groceries",
      "amount": 120.50,
      "paidBy": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Alice Johnson"
      },
      "date": "2026-04-29",
      "createdAt": "2026-04-29T10:30:00Z"
    }
  ],
  "count": 1,
  "total": 5
}
```

**CSV Format**
```
Date,Description,Amount,Paid By,Per-Person Split
2026-04-29,Costco groceries,120.50,Alice Johnson,30.125
```

**Requires**: User must be a group member

---

### DELETE /groups/:id/expenses/:expenseId

Delete an expense.

**Parameters**
- `id`: Group ID
- `expenseId`: Expense ID

**Response (200 OK)**
```json
{
  "message": "Expense deleted"
}
```

**Requires**: User must be the one who paid or group owner

**Error Responses**
- `403`: No permission to delete
- `404`: Expense not found

---

## Balance Endpoints

### GET /groups/:id/balances

Calculate and retrieve balances for a group.

**Parameters**
- `id`: Group ID

**Response (200 OK)**
```json
{
  "balances": {
    "507f1f77bcf86cd799439011": {
      "userId": "507f1f77bcf86cd799439011",
      "name": "Alice Johnson",
      "username": "alice_01",
      "amount": 30.00,
      "status": "owed"
    },
    "507f1f77bcf86cd799439013": {
      "userId": "507f1f77bcf86cd799439013",
      "name": "Bob Smith",
      "username": "bob_01",
      "amount": -30.00,
      "status": "owes"
    }
  },
  "summary": {
    "totalExpenses": 120.50,
    "memberCount": 2,
    "currency": "USD"
  }
}
```

**Status Values**
- `owed`: User is owed money (amount > 0)
- `owes`: User owes money (amount < 0)
- `even`: User is all even (amount = 0)

**Requires**: User must be a group member

---

## Rate Limiting

Currently no rate limiting. Future enhancement planned.

---

## Webhooks

Not currently implemented. Future feature for real-time updates.

---

## Pagination

List endpoints support pagination:
```
GET /groups/:id/expenses?limit=20&skip=40
```

- `limit`: Items per page (default: 50, max: 200)
- `skip`: Items to skip (default: 0)

---

## Search

Search endpoints (future):
```
GET /groups/:id/expenses/search?q=groceries
```

Current implementation is client-side.

---

## Changelog

### v1.0.0 (2026-04-29)
- Initial release
- Auth, Groups, Expenses, Balances endpoints
- Join request & approval workflow

### v1.1.0 (Planned)
- Token expiration & refresh
- Rate limiting
- Search endpoints
- WebSocket support
- Expense categories
- Custom split amounts

---

**Version**: 1.0.0 | **Last Updated**: 2026-04-29
