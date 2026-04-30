# User Guide

## Getting Started with RoomSync

Welcome! This guide walks you through all the features and how to use them.

## Table of Contents
1. [Registration & Login](#registration--login)
2. [Dashboard Overview](#dashboard-overview)
3. [Creating Groups](#creating-groups)
4. [Adding Members](#adding-members)
5. [Recording Expenses](#recording-expenses)
6. [Viewing Balances](#viewing-balances)
7. [Settling Up](#settling-up)
8. [Theme & Profile](#theme--profile)

---

## Registration & Login

### Signing Up
1. Click **Register** on the login page
2. Enter:
   - **Full Name** (e.g., "Alice Johnson")
   - **Email** (must be unique)
   - **Username** (3-20 chars, lowercase, numbers/underscores allowed)
   - **Password** (minimum 6 characters)
3. Click **Register**
4. You'll be logged in automatically and redirected to your Dashboard

### Logging In
1. Visit the login page
2. Enter your **Email or Username** and **Password**
3. Click **Login**

### Password Security
- Passwords are hashed and never stored in plain text
- Use a unique, strong password for security

---

## Dashboard Overview

The **Dashboard** is your home screen after login. Here you see:

- **Your Groups**: Cards showing all groups you're part of
- **Pending Join Requests**: Requests you've submitted to join groups (shows approval status)
- **Total Balance**: Quick summary of money owed/owed-to
- **Theme Toggle**: Top-right button to switch between Light/Dark mode

### Group Card Details
- Group name and member count
- Quick action: Click the card to enter the group
- Each group shows you're a member once approved

---

## Creating Groups

### New Group
1. From **Dashboard**, click **"+ Create Group"** or navigate to **Groups** page
2. Enter a group name (e.g., "Apartment 4B")
3. Click **Create**
4. You'll receive a unique **Invite Code** (e.g., `ABC123XYZ`)
5. Share this code with friends—they can join using it

### Invite Code
- Copy and share the code with friends
- Anyone with the code can request to join
- You'll approve or reject their requests
- Codes don't expire; you can regenerate if needed

---

## Adding Members

### Invite Method
1. Open a group → **Members** section
2. In the invite form, enter the username of a person you want to invite
3. Click **Send Invite**
4. The person receives a join request notification on their Dashboard
5. Once they approve (or you approve if you're the owner), they're added

### Join Method (For Invited Members)
1. On Dashboard, look for **Pending Join Requests** section
2. Find the group invite you received
3. View the approval status (e.g., "1 / 2 approvals needed")
4. If owner auto-approves or threshold met, you're in!

### Approval Workflow
- **Owner joins**: Automatically approved
- **Regular member joins**: Requires approval from owner OR reaches threshold (ceil(members / 2))
- Example: 4 members = need 2 approvals
- Once threshold met, user is automatically added

---

## Recording Expenses

### Add New Expense
1. Inside a group, scroll to **Expenses**
2. Click **"+ Add Expense"** or use the quick-add form
3. Fill in:
   - **Description** (e.g., "Grocery run")
   - **Amount** (e.g., $45.50)
   - **Paid by** (usually yourself by default)
   - **Date** (defaults to today)
4. Click **Add**
5. You'll see a success notification

### Expense Details
- **Who paid**: The person who actually spent the money
- **Amount**: The total cost (split equally among all members)
- **Timestamp**: When expense was recorded
- **Delete**: Owner or who paid can delete within retention period

### Searching & Filtering
- Use the **search box** in top navigation to find expenses by description or member name
- Filter by date range on the group page
- View CSV export for detailed records

### Expense Retention
- Groups have an **auto-delete** setting (default: 30 days)
- After this period, old expenses are automatically archived/removed
- Balances are finalized before deletion

---

## Viewing Balances

### Balance Summary
1. Open a group → **Balances** section
2. See a quick summary:
   - "You owe **$X.XX**" or "**$X.XX** owed to you"
3. Detailed breakdown showing per-person balances

### Understanding the Math
- Each expense is split equally among group members
- If Alice paid $100 for 4 people: each person owes $25
- If Bob only paid $50 for the same expense: he's owed $50 - $25 = $25 back
- Balances are cumulative across all expenses

### Example
```
Group: Roommates (4 members: Alice, Bob, Carol, David)

Expenses:
- Alice paid $100 for groceries (split 4 ways) → each owes $25
- Bob paid $40 for utilities (split 4 ways) → each owes $10

Balances:
- Alice: +$75 (paid $100, owes $35)
- Bob: +$10 (paid $40, owes $50)
- Carol: -$35 (owes $35)
- David: -$35 (owes $35)

Carol and David each owe $35 to the group.
Alice is owed $75, Bob is owed $10.
```

---

## Settling Up

### What is "Settle Up"?
Settling up means paying off your balance to another person or receiving payment. Once settled, that transaction is complete and balances update.

### How to Settle
1. Open a group → **Balances** section
2. Find the **Settle Up** button/link
3. The system suggests the optimal payment plan
4. Manually record who pays whom (outside the app via Venmo, PayPal, etc.)
5. Click **Mark as Settled** (or accept the suggestion)
6. Balances reset for that transaction

### Tips
- Settle regularly to keep balances manageable
- Use the suggested breakdown to minimize transactions
- Example: 3 people → A owes B $10, B owes C $20 → Simplify to A owes C $10, B owes C $20

---

## Theme & Profile

### Switching Themes
- Click **"Light Mode" / "Dark Mode"** button in top-right
- Preference is saved locally (even after logout)
- Glass-morphism design adapts to either theme

### My Profile
1. Click **Profile** in top navigation
2. View your account info:
   - Name
   - Email
   - Username
   - Member Code (unique ID)
3. **Update Profile**: Edit name or password
4. **Delete Account**: Permanently remove account (cannot be undone)

### Member Code
- Automatically generated unique ID
- Used internally for identification
- Shown on your profile for reference

---

## Tips & Best Practices

✅ **Use clear expense descriptions** → Makes it easier to track  
✅ **Record expenses immediately** → Avoid forgotten costs  
✅ **Settle monthly** → Keep balances manageable  
✅ **Communicate with roommates** → Discuss house rules and expectations  
✅ **Archive old groups** → Keep dashboard organized  
✅ **Use Retention settings** → Auto-clean old expenses  

---

## Troubleshooting

### "Join request pending..."
- Owner or members haven't approved yet
- Check back in a few minutes or message them

### "Group not visible"
- Try refreshing the page
- Ensure you're logged in with the correct account
- Check if you have an unapproved join request

### "Expense won't delete"
- Only owner or the person who paid can delete
- May be outside retention window for auto-delete

### "Balance seems wrong"
- Refresh the page to recalculate
- Check all members are accounted for
- Verify expenses aren't duplicated

---

## Need More Help?

- See [09-troubleshooting.md](09-troubleshooting.md) for common issues
- Check [10-glossary.md](10-glossary.md) for terminology
- Contact support or file an issue on GitHub

---

**Last Updated**: 2026-04-29
