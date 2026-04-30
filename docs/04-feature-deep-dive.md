# Feature Deep Dive

Detailed exploration of RoomSync's core features and how they work.

## Table of Contents
1. [Expense Tracking](#expense-tracking)
2. [Balance Calculation](#balance-calculation)
3. [Join Requests & Approvals](#join-requests--approvals)
4. [Theme System](#theme-system)
5. [CSV Export](#csv-export)
6. [Auto-Delete Retention](#auto-delete-retention)
7. [Search Functionality](#search-functionality)

---

## Expense Tracking

### Overview
Expenses are the core of RoomSync. Each expense records who paid and how much, then automatically calculates what each member owes.

### How It Works

#### Recording an Expense
1. User in GroupDetailsPage fills:
   - **Description**: What was bought (e.g., "Costco groceries")
   - **Amount**: Total cost (e.g., $120.50)
   - **Paid by**: Who paid (default: current user)
   - **Date**: When (defaults to today)
2. Clicks **Add Expense**
3. Frontend calls `AppContext.addExpense(groupId, data)`
4. API: `POST /groups/:id/expenses`
5. Backend creates Expense document
6. Backend adds expense ID to `Group.expenses` array
7. Frontend shows success toast
8. Component re-fetches expenses or updates optimistically

#### Expense Data Structure
```javascript
Expense {
  _id: ObjectId,
  group: ObjectId,      // Which group
  description: String,  // What was paid for
  amount: Number,       // Total amount
  paidBy: ObjectId,     // User who paid
  date: Date,           // When
  createdAt: Date,      // When recorded
  updatedAt: Date       // Last edit
}
```

### Expense Split Logic

**Key Principle**: Expenses are **split equally** among all group members.

#### Example: 4-Person Group
- Alice pays $100 for groceries
- Group has 4 members: Alice, Bob, Carol, David
- Split: $100 ÷ 4 = **$25 per person**
- Each person owes $25 to the group pot
- Since Alice paid $100, she's owed: $100 - $25 = **$75 back**

### Deletion Rules

#### Who Can Delete?
- The person who paid the expense
- The group owner (future enhancement)

#### When Can Delete?
- **Before retention period**: Always deletable
- **After retention period**: Auto-deleted by system

#### Effect of Deletion
- Expense removed from `Group.expenses`
- Balances recalculated
- No record remains (unless archived separately)

### UI/UX Details

#### Expense List
- Shows most recent first (sorted by date descending)
- Displays: Description, Amount, Paid by, Date
- Hover/click for more options (delete, edit—future)
- Skeleton loaders while fetching

#### Search Integration
- Search box in TopNav searches across all groups' expenses
- Matches description and member name
- Real-time filtering (client-side currently, can be server-side)

---

## Balance Calculation

### Overview
Balances show who owes what to whom. The system calculates this in real-time based on expenses.

### Algorithm

```
For each group member:
  total_paid = sum of all expenses where member.paidBy == member._id
  total_owed = sum of (expense.amount / group.members.length) for all expenses
  balance = total_paid - total_owed
  
If balance > 0: Member is owed money (creditor)
If balance < 0: Member owes money (debtor)
If balance == 0: All even
```

#### Concrete Example
```
Group: 3 friends (Alice, Bob, Carol)

Transactions:
- Alice pays $90 (groceries) → each owes $30
- Bob pays $60 (utilities) → each owes $20
- Carol pays $30 (coffee) → each owes $10

Calculations:
Alice:
  paid: $90
  owed_portion: $30 + $20 + $10 = $60
  balance: $90 - $60 = +$30 (owed $30)

Bob:
  paid: $60
  owed_portion: $30 + $20 + $10 = $60
  balance: $60 - $60 = $0 (all even)

Carol:
  paid: $30
  owed_portion: $30 + $20 + $10 = $60
  balance: $30 - $60 = -$30 (owes $30)

Result:
- Alice owed $30
- Bob is even
- Carol owes $30 → pays Alice $30
```

### Balance Endpoints

#### Backend: `GET /groups/:id/balances`
Returns object with all members' balances:
```json
{
  "balances": {
    "userId1": { "amount": 30.00, "status": "owed" },
    "userId2": { "amount": 0, "status": "even" },
    "userId3": { "amount": -30.00, "status": "owes" }
  },
  "summary": {
    "totalPaid": 180.00,
    "memberCount": 3
  }
}
```

#### Frontend Display
- Shows simple summary: "You are owed $XX" or "You owe $XX"
- Dropdown view with breakdown per person
- Color coding: Green (owed), Red (owes), Gray (even)

### Settle Up Feature

#### Purpose
Tracks when members settle debts (typically via Venmo, PayPal, etc.).

#### Current Implementation
- UI suggests optimal payment plan
- User manually records settlement outside app
- Balances reset after settlement (marks debt as paid)

#### Future Enhancement
- Integration with payment APIs
- Automatic settlement via Stripe/PayPal
- Receipt tracking

---

## Join Requests & Approvals

### Overview
Members can request to join a group, and owner/members approve them. This prevents unauthorized access.

### Workflow

#### Step 1: Join Request Submission
```
User clicks "Join Group" with invite code
  ↓
Frontend calls joinGroup(inviteCode)
  ↓
Backend finds group by inviteCode
  ↓
Backend creates joinRequest entry:
  {
    userId: ObjectId,
    source: "self",           // or "invite"
    approvals: [],
    createdAt: Date
  }
  ↓
Backend returns {status: "join_request_created"}
  ↓
Frontend shows "Join request submitted"
  ↓
User sees pending request on Dashboard
```

#### Step 2: Approval Threshold
```
getApprovalThreshold(members.length):
  if members.length <= 1: return 1  // Owner auto-approves
  else: return ceil(members.length / 2)

Examples:
- 1 member → threshold = 1 (owner)
- 2 members → threshold = 1
- 3 members → threshold = 2
- 4 members → threshold = 2
- 5 members → threshold = 3
```

#### Step 3: Member Approval
```
Owner or existing member sees join request
  ↓
Clicks "Approve" button
  ↓
Frontend calls approveJoinRequest(groupId, requestId)
  ↓
Backend adds member._id to joinRequest.approvals[]
  ↓
Backend checks if approvals.length >= threshold
  ↓
If threshold met:
  - Add userId to Group.members[]
  - Remove joinRequest from joinRequests[]
  - Return { status: "user_added" }
  ↓
Else:
  - Return { status: "approval_recorded", approvals: count }
  ↓
Frontend updates UI to show approval count
```

#### Step 4: Automatic Addition
```
Once threshold reached:
  - User automatically added to Group.members
  - User sees group on their Dashboard
  - User can now view/add expenses
  - Join request disappears
```

### Data Structure

#### Group.joinRequests
```javascript
joinRequests: [
  {
    userId: ObjectId,
    source: "self" | "invite",
    approvals: [ObjectId, ObjectId, ...],
    createdAt: Date,
    _id: ObjectId  // Sub-document ID
  }
]
```

### UI Components

#### Requester View (Dashboard)
```
📋 Pending Join Requests

🏠 Apartment 4B
  Request sent 2 hours ago
  ✓ 1 / 2 approvals needed
```

#### Owner/Member View (Group Details)
```
👥 Join Requests Pending

👤 Alice (@alice_01)
  Requested to join 1 hour ago
  ✓ Approvals: 1 / 2
  [Approve] [Reject]
```

### Invite vs Self-Join

#### Invite Method
1. Owner sends invite to specific user
2. Creates joinRequest with source: "invite"
3. User sees it as incoming invitation
4. Approval workflow same as self-join

#### Self-Join Method
1. User gets invite code from someone
2. User clicks "Join with Code"
3. User submits request with source: "self"
4. Approval workflow same as invite

---

## Theme System

### Overview
RoomSync supports Light and Dark themes with persistent localStorage storage.

### Theme Context

#### State
```javascript
{
  theme: "light" | "dark",      // Current theme
  accent: "ocean" | "emerald" | "graphite",  // Brand color (may be removed)
  toggleTheme: () => {},        // Switch themes
  setAccent: (name) => {}       // Change brand color
}
```

#### Storage
```javascript
localStorage.getItem("roomsync_theme")   // "light" or "dark"
localStorage.getItem("roomsync_accent")  // Color name
```

### CSS Implementation

#### Light Theme (`:root`)
```css
:root {
  --bg-main: #f6f9fb;
  --bg-layer: #fbfdff;
  --ink: #0f1720;
  --card: rgba(255, 255, 255, 0.36);
  --border: rgba(255, 255, 255, 0.18);
  --blur: saturate(150%) blur(16px);
  /* ... more tokens ... */
}
```

#### Dark Theme (`body[data-theme="dark"]`)
```css
body[data-theme="dark"] {
  --bg-main: #061018;
  --bg-layer: #071422;
  --ink: #e6f0ff;
  --card: rgba(14, 20, 30, 0.5);
  --border: rgba(255, 255, 255, 0.06);
  --blur: saturate(160%) blur(18px);
  /* ... more tokens ... */
}
```

### Glass-Morphism Design

#### Key Features
1. **Translucency**: `rgba()` with low opacity
2. **Backdrop Blur**: `backdrop-filter: blur(Xpx)`
3. **Frosted Effect**: `border: 1px solid rgba(255,255,255,0.12)`
4. **Subtle Gradients**: Light-to-dark transitions
5. **Soft Shadows**: Minimal drop shadows for depth

#### Example Component
```css
.card {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--card-strong) 82%, transparent),
    color-mix(in srgb, var(--card) 86%, transparent)
  );
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: var(--blur);
  box-shadow: var(--shadow-soft);
  border-radius: var(--radius-lg);
}
```

### Respects Reduced Motion
```css
@media (prefers-reduced-motion: prefer-reduced) {
  /* Disable animations */
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## CSV Export

### Purpose
Allows users to export group expense history for record-keeping, taxes, or external analysis.

### How It Works

#### Trigger
1. User in GroupDetailsPage clicks **Export CSV**
2. Frontend calls API: `GET /groups/:id/expenses?format=csv`
3. Backend queries all expenses for group
4. Backend formats as CSV rows
5. Browser downloads file as `group-expenses-YYYY-MM-DD.csv`

#### CSV Format
```
Date,Description,Amount,Paid By,Member Count,Per-Person Share
2026-04-29,Groceries,120.50,Alice,4,30.125
2026-04-28,Utilities,85.00,Bob,4,21.25
...
```

#### Backend Implementation
```javascript
// Route: GET /groups/:id/expenses?format=csv
app.get("/groups/:id/expenses", async (req, res) => {
  if (req.query.format === "csv") {
    // Build CSV header and rows
    // Set response headers to trigger download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=expenses.csv");
    res.send(csvString);
  } else {
    // Return JSON (default)
  }
});
```

#### Frontend Download
```javascript
const downloadCSV = async (groupId) => {
  const response = await axios.get(`/groups/${groupId}/expenses?format=csv`);
  // Browser automatically triggers download
};
```

---

## Auto-Delete Retention

### Purpose
Prevents database bloat by automatically removing old expenses based on configurable retention period.

### Configuration

#### Group Retention Setting
```javascript
Group {
  expenseRetentionDays: Number  // default: 30
}
```

#### Backend Job
```javascript
// Run daily (could use node-cron or external scheduler)
async function deleteOldExpenses() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - expenseRetentionDays);
  
  await Expense.deleteMany({
    createdAt: { $lt: cutoffDate }
  });
}
```

### User Control

#### Update Retention Days
```
Group Details → Settings → Expense Retention
Input: 30 (default)
Range: 7 - 365 days

PATCH /groups/:id/retention
Body: { expenseRetentionDays: 60 }
```

### Considerations

✅ **Balances**: Finalized before deletion (no recalculation issues)  
✅ **Audit Trail**: Could log deleted expenses separately  
✅ **Restore**: Currently no recovery; could implement soft-delete  
⚠️ **Timezone**: Ensure UTC consistency for cutoff date  

---

## Search Functionality

### Overview
Users can quickly find expenses and members using the search box.

### Implementation

#### Frontend Search
- **Input**: Located in TopNav
- **Scope**: Searches current group's expenses
- **Real-time**: Filters on every keystroke (client-side)
- **Matching**: Case-insensitive substring match on description and member name

#### Search Algorithm
```javascript
const filtered = expenses.filter(exp => {
  const query = searchQuery.toLowerCase();
  const descriptionMatches = exp.description.toLowerCase().includes(query);
  const memberMatches = exp.paidBy.name.toLowerCase().includes(query);
  return descriptionMatches || memberMatches;
});
```

#### Current Limitations
- Only searches current group (not cross-group)
- Client-side only (not persisted or indexed)
- No advanced operators (AND, OR, NOT)

#### Future Enhancements
- Server-side search with MongoDB text indexes
- Cross-group search
- Advanced query syntax
- Search history
- Fuzzy matching for typos

---

## Animations & Polish

### Micro-Interactions
- **Pop-in**: Cards animate in with scale + opacity
- **Fade-up**: Elements rise with opacity
- **Hover lift**: Cards lift slightly on hover
- **Smooth transitions**: 160-280ms duration on color/transform changes

### Reduced Motion Compliance
```css
@media (prefers-reduced-motion: prefer-reduced) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

### Skeleton Loaders
- Appear while data loads
- Shimmer animation for visual feedback
- Same layout as final content (prevents layout shift)

---

**Version**: 1.0.0 | **Last Updated**: 2026-04-29
