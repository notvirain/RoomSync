# Troubleshooting Guide

Common issues and solutions for RoomSync users and developers.

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Can't login | Check email/username spelling, reset password |
| Groups not visible | Refresh page, check join requests approved |
| Balance wrong | Refresh page, verify expense amounts |
| Slow loading | Check internet, clear cache, reload |
| Theme not saving | Clear browser cookies/cache |
| Join request pending forever | Check with group owner, may need more approvals |

---

## User Issues

### Authentication Problems

#### **Issue: "Invalid credentials" error**

**Causes**:
- Email/username typed incorrectly
- Password incorrect
- Account doesn't exist
- Caps Lock on

**Solutions**:
1. Double-check spelling (case-sensitive for username)
2. Verify Caps Lock is off
3. Try logging in with email if using username (or vice versa)
4. If account doesn't exist, register first

#### **Issue: Can't register account**

**Causes**:
- Email already registered
- Username already taken
- Invalid email format
- Password too short

**Solutions**:
1. Use a different email address
2. Try different username (check if available)
3. Ensure email has correct format (e.g., user@example.com)
4. Password must be at least 6 characters

#### **Issue: Token expired / "Please log in again"**

**Causes**:
- Session timed out
- Logged in on another device
- Browser cleared cookies

**Solutions**:
1. Click "Login" and enter credentials again
2. Ensure you're only logged in on one device
3. Check browser settings (don't auto-clear cookies)

---

### Group Issues

#### **Issue: Groups not visible on Dashboard**

**Causes**:
- Join requests not approved yet
- Page didn't fully load
- Browser cache stale
- Logged in wrong account

**Solutions**:
1. Check "Pending Join Requests" section at bottom of Dashboard
2. Ask group owner to approve your request
3. Refresh page (F5 or Cmd+R)
4. Clear browser cache: DevTools → Application → Clear Site Data
5. Verify you're logged into correct account

#### **Issue: "You don't have permission" when clicking group**

**Causes**:
- Not approved as member yet
- Logged out / session expired
- Trying to access group URL directly before approved

**Solutions**:
1. Wait for owner/members to approve join request
2. Re-login if session expired
3. Access group through Dashboard card (not direct URL)

#### **Issue: Can't find invite code**

**Causes**:
- Group owner didn't share it
- Looking in wrong group
- Code was reset/regenerated

**Solutions**:
1. Ask group owner for the invite code
2. Open group → Members section → look for "Invite Code"
3. If code doesn't work, ask owner to regenerate it

#### **Issue: Join request pending but threshold already met**

**Causes**:
- Frontend UI not updated
- Backend didn't automatically approve
- Still waiting for owner decision

**Solutions**:
1. Refresh page to see latest status
2. Ask group owner to manually approve your request
3. Check if owner is actually the required approver

---

### Expense Issues

#### **Issue: Can't add expense**

**Causes**:
- Not a group member yet
- Form validation failed
- Invalid amount
- Server error

**Solutions**:
1. Verify you're in the group (should see expense list)
2. Check error message in form
3. Ensure amount is positive number (e.g., 100, 45.50)
4. Try refreshing page and adding again

#### **Issue: Expense won't delete**

**Causes**:
- Only person who paid can delete
- Outside retention period (auto-deleted)
- Permission denied

**Solutions**:
1. Ask the person who paid to delete it
2. Check expense date (too old = may be auto-deleted)
3. Verify you're in the correct group

#### **Issue: Balance calculation seems wrong**

**Causes**:
- Expenses not fully loaded
- Incorrect split logic
- Browser cache
- New expense not synced

**Solutions**:
1. Refresh page to recalculate
2. Verify expense amounts are correct
3. Clear browser cache
4. Check all expenses are visible
5. Do math manually: total_paid - (total_expenses / members) = balance

**Example Check**:
```
3 members: Alice, Bob, Carol
Alice paid $90 → each owes $30
Bob paid $60 → each owes $20

Alice: paid $90 - owed ($30+$20) = +$40 owed
Bob: paid $60 - owed ($30+$20) = +$10 owed
Carol: paid $0 - owed ($30+$20) = -$50 owes
```

---

### Theme & Interface Issues

#### **Issue: Theme not saving after logout**

**Causes**:
- Browser cookies cleared
- localStorage disabled
- Logged out on different device

**Solutions**:
1. Don't clear cookies when logging out
2. Check if localStorage enabled: Settings → Privacy → Cookies
3. Set theme again after login
4. Theme is per-device/browser, not synced across devices

#### **Issue: Dark mode shows wrong colors**

**Causes**:
- Browser cached old styles
- CSS didn't fully load
- Display settings interfering

**Solutions**:
1. Clear cache: DevTools → Network → "Disable cache" → reload
2. Do hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Try different browser
4. Report as bug with screenshot

#### **Issue: Text hard to read / contrast issues**

**Causes**:
- Dark theme with dark background
- Custom browser zoom
- Display accessibility settings

**Solutions**:
1. Try light theme instead
2. Reset zoom: Ctrl+0 (Windows) or Cmd+0 (Mac)
3. Check OS accessibility settings
4. Report issue with screenshot

---

## Developer Issues

### Backend Problems

#### **Issue: "Cannot connect to MongoDB"**

**Causes**:
- `MONGO_URI` not set
- Connection string incorrect
- MongoDB cluster not whitelisted
- Network connectivity issue

**Solutions**:
```bash
# Check .env file exists
cat .env

# Verify MONGO_URI is set
echo $MONGO_URI

# Test connection string from MongoDB Atlas
# Copy from: Database → Connect → Connect your application
```

**Example connection string**:
```
mongodb+srv://username:password@cluster.mongodb.net/roomsync?ssl=true&authSource=admin
```

Verify:
- `username` and `password` correct
- Database user created in MongoDB Atlas
- IP whitelisted (0.0.0.0/0 for development)
- Database name correct (roomsync)

#### **Issue: Port 5000 already in use**

**Causes**:
- Another Node process running
- Previous server didn't shut down
- Different service using port

**Solutions**:
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

#### **Issue: "Cannot find module" error**

**Causes**:
- Dependencies not installed
- Typo in import path
- Node version mismatch

**Solutions**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+

# Check import path is correct
# Bad:  const User = require('./models/user');
# Good: const User = require('./models/User');  (capital U)
```

#### **Issue: JWT errors / "Invalid token"**

**Causes**:
- `JWT_SECRET` not set
- Token malformed
- Token expired
- Wrong secret on verify

**Solutions**:
```bash
# Verify JWT_SECRET is set
echo $JWT_SECRET

# Generate new secret if needed
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env
echo "JWT_SECRET=<generated_value>" >> .env

# Restart server
```

---

### Frontend Problems

#### **Issue: "Cannot find module" error in React**

**Causes**:
- Import path wrong
- File doesn't exist
- Wrong file extension (.jsx vs .js)

**Solutions**:
```javascript
// Bad imports
import LoginPage from './pages/loginpage';        // lowercase
import Button from './Button.js';                 // not .jsx
import axios from 'api/axios';                    // missing ./

// Good imports
import LoginPage from './pages/LoginPage';        // correct case
import Button from './components/Button';         // .jsx assumed
import axios from './api/axios';                  // ./ prefix
```

#### **Issue: "API_BASE_URL is undefined"**

**Causes**:
- `.env.local` not created
- `VITE_` prefix missing
- Vite not restarted after env change

**Solutions**:
```bash
# Create .env.local in frontend/
echo "VITE_API_BASE_URL=http://localhost:5000" > .env.local

# Restart Vite dev server
npm run dev
```

#### **Issue: CORS error when calling API**

**Causes**:
- Backend CORS not configured
- Wrong API URL
- API not running

**Solutions**:
```javascript
// Check axios.js has correct baseURL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL  // Must be set
});

// Verify backend CORS allows frontend
// Backend should have: app.use(cors())

// Test API is running
curl http://localhost:5000/

// Check browser console for exact CORS error
```

#### **Issue: Login fails silently**

**Causes**:
- API not running
- CORS error preventing request
- Axios interceptor issue
- Network tab shows failed request

**Solutions**:
1. Check browser DevTools → Network tab
2. Look for POST /auth/login request
3. Check response status and body
4. Verify backend is running: `curl http://localhost:5000/`
5. Check console for errors (F12)

---

### Build Problems

#### **Issue: Frontend build fails**

**Causes**:
- Syntax error in code
- Missing dependency
- Build configuration issue

**Solutions**:
```bash
# Check for syntax errors
npm run build

# See full error (not truncated)
npm run build 2>&1 | tail -50

# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

#### **Issue: Backend build fails on Render.com**

**Causes**:
- Build command wrong
- Environment variables missing
- Dependencies not in package.json

**Solutions**:
1. Check Render.com logs for error
2. Verify build command in settings:
   ```
   cd backend && npm install
   ```
3. Verify start command:
   ```
   cd backend && node src/server.js
   ```
4. Ensure all packages in `package.json`, not just local `node_modules`

---

### Performance Issues

#### **Issue: App loads slowly**

**Causes**:
- Large bundle size
- Slow API responses
- Database queries slow
- Network throttled

**Solutions**:
```bash
# Check frontend bundle size
npm run build
# Look at dist/assets/ sizes

# Check Lighthouse
npm run build
npx lighthouse http://localhost:5173

# Check network tab
# DevTools → Network → reload page
# Sort by largest files

# Check backend response time
curl -w "%{time_total}\n" http://localhost:5000/groups
```

#### **Issue: Groups load but expenses don't**

**Causes**:
- Expenses endpoint slow
- Too many expenses (no pagination)
- Database not indexed

**Solutions**:
1. Check backend logs for query time
2. Add database index on `group` field:
   ```javascript
   db.expenses.createIndex({ group: 1 })
   ```
3. Implement pagination (limit: 50, skip: 0)
4. Check MongoDB Atlas Performance Advisor

---

## Reporting Issues

### Required Information
When reporting a bug, include:

```markdown
**Environment**:
- OS: Windows 11 / macOS 14 / Ubuntu 22.04
- Browser: Chrome 120 / Firefox 121 / Safari 17
- Node version: 18.x (for dev issues)

**Steps to Reproduce**:
1. Login with alice_01 / password
2. Click "Create Group"
3. Enter "Test Group"
4. Click Create
5. (Observe issue)

**Expected**:
Group appears on dashboard

**Actual**:
Blank screen / error message / etc

**Logs**:
```
Browser console error (F12)
Backend logs (npm run dev terminal)
```

**Screenshot**:
[Attach if visual issue]
```

---

## Getting Help

### Documentation
- [User Guide](02-user-guide.md) — How to use features
- [Architecture](03-architecture.md) — System design
- [API Reference](05-api-reference.md) — Endpoint docs
- [Development](06-development.md) — Dev setup

### Community
- GitHub Issues: [notvirain/RoomSync/issues](https://github.com/notvirain/RoomSync/issues)
- Email: Contact project maintainer
- Discussions: GitHub Discussions tab

### Debug Checklist
- [ ] Reproduce issue with fresh browser/incognito
- [ ] Check browser console (F12) for errors
- [ ] Check backend server logs
- [ ] Try different browser
- [ ] Clear cache and cookies
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Check latest changes on GitHub
- [ ] Verify environment variables set correctly

---

**Version**: 1.0.0 | **Last Updated**: 2026-04-29
