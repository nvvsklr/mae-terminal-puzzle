# Railway Deployment Guide for Mae Terminal Puzzle

## 🚂 Quick Deploy to Railway

### Method 1: Deploy from GitHub (Recommended)

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Railway deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/mae-terminal-puzzle.git
   git push -u origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your mae-terminal-puzzle repository
   - Railway will automatically detect it's a Node.js project

3. **Configure Environment Variables**:
   - In your Railway project dashboard, go to "Variables"
   - Add these variables:
     ```env
     NODE_ENV=production
     ```
   - Optional variables (if needed):
     ```env
     DISCORD_CLIENT_ID=your_discord_client_id
     DISCORD_CLIENT_SECRET=your_discord_client_secret
     ```

4. **Deploy**:
   - Railway will automatically build and deploy your app
   - You'll get a public URL like `https://your-app.railway.app`

### Method 2: Deploy via Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize and Deploy**:
   ```bash
   railway init
   railway up
   ```

## 🔧 Configuration Details

### Files Created for Railway:
- `railway.json` - Railway configuration
- `.env.railway` - Environment variables template

### What's Configured:
- ✅ Node.js environment detection
- ✅ Automatic port binding (`process.env.PORT`)
- ✅ CORS configured for Railway domains
- ✅ Socket.io configured for Railway
- ✅ Production-ready logging
- ✅ Health check endpoint

### Railway-Specific Changes Made:
1. **CORS Origins**: Added Railway domain patterns
2. **Socket.io CORS**: Added Railway domain support
3. **Logging**: Enhanced for production environment
4. **Port Binding**: Uses Railway's dynamic PORT

## 🌐 After Deployment

1. **Your app will be available at**: `https://your-app.railway.app`
2. **Check logs**: Use Railway dashboard or `railway logs`
3. **Monitor**: Railway provides built-in monitoring

## 🔧 Environment Variables

Set these in your Railway project dashboard:

### Required:
```env
NODE_ENV=production
```

### Optional:
```env
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
ALLOWED_ORIGINS=https://your-custom-domain.com
```

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check that `package.json` has correct scripts
   - Ensure all dependencies are listed

2. **App Won't Start**:
   - Verify `PORT` environment variable is used correctly
   - Check Railway logs for error messages

3. **Socket.io Connection Issues**:
   - Ensure CORS is configured for Railway domains
   - Check that websocket transport is allowed

### Useful Commands:

```bash
# View logs
railway logs

# Connect to your project
railway link

# Set environment variables
railway variables set NODE_ENV=production

# Open your deployed app
railway open
```

## 📱 Testing Your Deployment

1. Visit your Railway URL
2. Open browser console to check for errors
3. Test the Mae Terminal interface
4. Verify the t-shirt puzzle verification works

## 💰 Cost Considerations

- Railway offers a generous free tier
- The Mae Terminal app is lightweight and should run well within free limits
- Monitor usage in Railway dashboard

## 🔄 Continuous Deployment

Railway automatically redeploys when you push to your connected GitHub repository's main branch.

---

*Your Mae Terminal Puzzle is now ready for the digital realm! 🤖✨*