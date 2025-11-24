# 🚂 Deploy Riri Order Tracker to Railway

## Quick Setup Guide

### Step 1: Prepare for Deployment

This repository is ready to deploy to Railway! Make sure you have:

✅ MySQL database credentials (Hostinger MySQL)
✅ Railway account (free tier available)
✅ GitHub account (for connecting repository)

### Step 2: Push to GitHub

```bash
# Add all files
git add .

# Commit changes  
git commit -m "Initial commit - Riri Order Tracker"

# Create GitHub repository and push
# (Replace with your GitHub username and desired repo name)
git remote add origin https://github.com/yourusername/riri-order-tracker.git
git push -u origin main
```

### Step 3: Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" 
3. Select "Deploy from GitHub repo"
4. Choose your riri-order-tracker repository
5. Railway will auto-detect Node.js and deploy

### Step 4: Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```env
DB_HOST=srv1710.hstgr.io
DB_USER=u574849695_riri
DB_PASSWORD=your_database_password
DB_NAME=u574849695_riri
DB_PORT=3306
NODE_ENV=production
```

### Step 5: Verify Deployment

1. Railway will provide a public URL (e.g., `https://your-app.up.railway.app`)
2. Visit the URL to test the Riri Order Tracker
3. Try entering an email address to verify database connectivity

## 🔧 Technical Details

### What's Included:
- ✅ Node.js + Express server
- ✅ Socket.io for real-time communication
- ✅ MySQL integration with Hostinger
- ✅ Riri AI order tracking system
- ✅ Terminal UI interface
- ✅ Production-ready configuration

### Railway Configuration:
- `railway.json` - Railway build settings
- `package.json` - Node.js dependencies and scripts
- `.env.example` - Environment variables template

### Database Schema:
- Orders table with email, tracking URLs, timestamps
- Support for multiple orders per customer
- Automatic retrieval of most recent orders

## 🚨 Important Notes

1. **Database**: Uses external MySQL (Hostinger) - ensure credentials are correct
2. **Environment**: Set NODE_ENV=production for Railway deployment  
3. **CORS**: Pre-configured for Railway domains
4. **Port**: Automatically uses Railway's PORT environment variable

## 📱 After Deployment

Your Riri Order Tracker will be live at your Railway URL!

Users can:
- Enter their email address
- Get redirected to their most recent order tracking
- Experience the cyberpunk terminal interface

---

*Riri is ready to help track orders in the digital realm! 🤖📦*
