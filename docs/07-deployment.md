# Deployment Guide

Instructions for deploying RoomSync to production.

## Overview

RoomSync uses a three-service deployment model:

| Service | Platform | Purpose |
|---------|----------|---------|
| Frontend (React) | Vercel | CDN-backed static site hosting |
| Backend (Node/Express) | Render.com | Cloud application server |
| Database (MongoDB) | MongoDB Atlas | Cloud-hosted database |

---

## Prerequisites

- GitHub account with RoomSync repository
- Vercel account (connected to GitHub)
- Render.com account
- MongoDB Atlas account
- Domain name (optional)

---

## Database Setup: MongoDB Atlas

### 1. Create MongoDB Atlas Account
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Verify email

### 2. Create Cluster
1. Click **Create** to start a new project
2. Name your project (e.g., "RoomSync")
3. Create new cluster:
   - **Cloud Provider**: AWS
   - **Region**: Choose closest to users (or us-east-1)
   - **Tier**: M0 Sandbox (free, 512MB storage)
4. Click **Create Cluster** (takes ~3 minutes)

### 3. Set Database Access
1. In cluster dashboard, click **Database Access** (left menu)
2. Click **Add New Database User**
3. Create username and password
   - Username: `roomsync_user`
   - Password: Generate strong password (copy for later)
4. Set permissions: **Atlas Admin**
5. Click **Add User**

### 4. Set Network Access
1. Click **Network Access** (left menu)
2. Click **Add IP Address**
3. For development: Click **Allow Access from Anywhere** (0.0.0.0/0)
4. For production: Add specific IPs (Render.com, your office, etc.)
5. Click **Confirm**

### 5. Get Connection String
1. Click **Clusters** → your cluster → **Connect**
2. Select **Connect your application**
3. Copy connection string:
   ```
   mongodb+srv://roomsync_user:PASSWORD@cluster.mongodb.net/roomsync?ssl=true&authSource=admin&replicaSet=atlas-xxxxx&retryWrites=true&w=majority
   ```
4. Replace `PASSWORD` with your database user password
5. Save this as `MONGO_URI` environment variable

---

## Backend Deployment: Render.com

### 1. Connect Repository
1. Visit [Render.com](https://render.com)
2. Sign up with GitHub account
3. Click **Dashboard** → **New** → **Web Service**
4. Select your RoomSync GitHub repository
5. Choose branch: `main`
6. Click **Connect**

### 2. Configure Service
1. **Name**: `roomsync-backend`
2. **Environment**: `Node`
3. **Build Command**: `cd backend && npm install`
4. **Start Command**: `cd backend && node src/server.js`
5. **Plan**: Free tier (auto-spins down after 15min inactivity)
6. Click **Create Web Service**

### 3. Set Environment Variables
1. Go to service settings → **Environment**
2. Click **Add Environment Variable** for each:

| Key | Value | Notes |
|-----|-------|-------|
| `MONGO_URI` | `mongodb+srv://...` | From MongoDB Atlas setup |
| `JWT_SECRET` | Random string (64+ chars) | Use secure generator |
| `PORT` | `5000` | Default port |
| `NODE_ENV` | `production` | For production optimizations |

### 4. Deploy
1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait for build (logs show progress)
3. Once deployed, you'll get a URL: `https://roomsync-backend.onrender.com`
4. Test: Visit `https://roomsync-backend.onrender.com/` (should show API message)

### 5. Auto-Deploy
- Render auto-deploys on every push to `main`
- You can disable in **Settings** → **Auto-Deploy**

### Render.com Tips
- Free tier has limitations (slow startup, limited resources)
- Upgrade to paid tier for production reliability
- Enable **Auto-Scroll** to follow deployment logs

---

## Frontend Deployment: Vercel

### 1. Connect Repository
1. Visit [Vercel](https://vercel.com)
2. Sign up with GitHub account
3. Click **Add New...** → **Project**
4. Select RoomSync repository
5. Click **Import**

### 2. Configure Project
1. **Framework Preset**: Vite (should auto-detect)
2. **Root Directory**: `./frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Click **Deploy**

### 3. Set Environment Variables
1. Go to project **Settings** → **Environment Variables**
2. Add:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://roomsync-backend.onrender.com` |

3. Apply to **Production**, **Preview**, and **Development** environments

### 4. Verify Deployment
- Vercel provides a URL: `https://roomsync.vercel.app`
- Test login, create group, add expense
- Check browser network tab for API calls

### 5. Auto-Deploy
- Vercel auto-deploys on every push to `main`
- Preview deployments on pull requests

### Custom Domain
1. Go to **Settings** → **Domains**
2. Add your domain name
3. Follow DNS setup instructions

---

## Post-Deployment Checklist

### Testing
- [ ] Login with email
- [ ] Login with username
- [ ] Register new account
- [ ] Create a group
- [ ] Add group member
- [ ] Submit join request
- [ ] Approve join request
- [ ] Add expense
- [ ] View balances
- [ ] Toggle theme
- [ ] Export CSV
- [ ] Profile update/delete

### Monitoring
- [ ] Check Render.com logs for errors
- [ ] Monitor MongoDB Atlas resource usage
- [ ] Set up alerts for crashes

### Security
- [ ] Verify CORS allows only Vercel domain
- [ ] Check MongoDB IP whitelist
- [ ] Confirm JWT_SECRET is strong
- [ ] Review error messages (shouldn't leak internal details)

### Performance
- [ ] Test on slow network (Chrome DevTools throttle)
- [ ] Check frontend bundle size
- [ ] Verify skeleton loaders appear during loading
- [ ] Monitor backend response times

---

## Continuous Deployment Workflow

### Automatic
```
Developer pushes to main
  ↓
GitHub triggers webhooks
  ↓
Render.com pulls latest backend code
  ↓
Vercel pulls latest frontend code
  ↓
Both services rebuild and deploy
  ↓
Services restart with new code
  ↓
Live within 2-5 minutes
```

### Manual Rollback
If deployment breaks:
1. **Render**: Click service → **Manual Deploy** → choose previous commit hash
2. **Vercel**: Click deployment history → select previous deployment → **Promote to Production**

---

## Environment Variables Checklist

### Render.com (Backend)
```
MONGO_URI=mongodb+srv://roomsync_user:PASSWORD@cluster.mongodb.net/roomsync?ssl=true&...
JWT_SECRET=your_super_secret_key_here_64_chars_minimum
PORT=5000
NODE_ENV=production
```

### Vercel (Frontend)
```
VITE_API_BASE_URL=https://roomsync-backend.onrender.com
```

### MongoDB Atlas
```
Connection String (for reference):
mongodb+srv://roomsync_user:PASSWORD@cluster.mongodb.net/roomsync?ssl=true&authSource=admin
```

---

## Scaling Considerations

### Current Setup
- Render.com: 1 instance (free tier)
- MongoDB: Shared cluster (free tier)
- Bottlenecks: Database size (512MB), concurrent connections

### Upgrade Path
1. **Database**: Upgrade MongoDB to M10+ (dedicated server)
2. **Backend**: Upgrade Render to paid tier (always on, more memory/CPU)
3. **Frontend**: Vercel can scale automatically (no action needed)
4. **Caching**: Add Redis for frequently accessed data
5. **Load Balancer**: If multiple backend instances needed

### Performance Optimizations
- Add database indexes for common queries
- Implement API response caching
- Compress assets (Vite handles this)
- Use CDN for static files (Vercel does this)
- Implement pagination for large lists
- Add query rate limiting

---

## Troubleshooting Deployments

### Backend Won't Start
- Check logs: `Render Dashboard → Logs`
- Verify environment variables set correctly
- Check `MONGO_URI` connection string
- Ensure MongoDB Atlas IP whitelist includes Render IP

### Frontend Shows Blank Page
- Check browser console for errors (DevTools)
- Verify `VITE_API_BASE_URL` is set
- Clear browser cache (Shift+Ctrl+Del)
- Check Vercel logs for build errors

### CORS Errors
- Backend logs show CORS issues
- Update `app.use(cors())` to allow frontend domain:
  ```javascript
  app.use(cors({
    origin: [
      "https://roomsync.vercel.app",
      "http://localhost:5173"
    ]
  }));
  ```

### Database Connection Timeouts
- Check MongoDB Atlas IP whitelist
- Verify network connectivity
- Check `MONGO_URI` for typos
- Try from MongoDB Atlas **Test Connection** button

### Rate Limiting / Service Errors
- Check if MongoDB free tier storage is full (512MB limit)
- Upgrade MongoDB tier or delete old test data
- Check Render.com CPU/memory usage

---

## Monitoring & Alerts

### Render.com
1. **Logs**: Dashboard → Logs (see real-time logs)
2. **Metrics**: Dashboard → Metrics (CPU, memory, bandwidth)
3. **Alerts**: (Premium feature) Set up email on crashes

### MongoDB Atlas
1. **Status**: Dashboard shows cluster health
2. **Alerts**: Settings → Alert Settings (set up email alerts)
3. **Performance**: Performance Advisor suggests index improvements

### Vercel
1. **Deployments**: See all deployments and logs
2. **Analytics**: Premium feature for traffic/performance data
3. **Incidents**: Check status page for platform issues

---

## Disaster Recovery

### Backups
- **MongoDB**: Atlas does automatic backups (free tier: 7 days retention)
- **Code**: GitHub is your backup (always push)
- **Frontend assets**: Vercel keeps deployment history

### Recovery Steps
1. **Database Lost**: Restore from MongoDB Atlas backup
2. **Code Issues**: Revert to previous commit on GitHub
3. **Complete Outage**: Redeploy from GitHub to Render/Vercel

---

## Cost Estimation

| Service | Plan | Cost/Month |
|---------|------|-----------|
| MongoDB Atlas | M0 Sandbox | Free (512MB) |
| Render.com | Free | Free (limited resources) |
| Vercel | Free | Free |
| **Total** | | **Free** |

### Production Tier
| Service | Plan | Cost/Month |
|---------|------|-----------|
| MongoDB Atlas | M10 | $57 |
| Render.com | Standard | $12 |
| Vercel | Pro | $20 |
| **Total** | | **~$89/month** |

---

## Next Steps

1. [x] Set up MongoDB Atlas cluster
2. [x] Deploy backend to Render.com
3. [x] Deploy frontend to Vercel
4. [x] Test all features in production
5. [ ] Set up custom domain
6. [ ] Configure monitoring alerts
7. [ ] Plan upgrade path for scale

---

**Version**: 1.0.0 | **Last Updated**: 2026-04-29
