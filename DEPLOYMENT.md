# Mae Terminal Production Deployment Guide

## Quick Deploy Options

### Option 1: Heroku (Easiest)
1. Create Heroku account at heroku.com
2. Install Heroku CLI
3. Commands:
```bash
heroku create your-mae-terminal-name
heroku config:set OPENAI_API_KEY=your_key_here
heroku config:set DISCORD_BOT_TOKEN=your_token_here
heroku config:set DISCORD_GUILD_ID=your_guild_id_here
heroku config:set NODE_ENV=production
git push heroku main
```

### Option 2: Railway (Modern & Easy)
1. Go to railway.app
2. Connect your GitHub repo
3. Set environment variables in dashboard
4. Automatic deployment on git push

### Option 3: DigitalOcean App Platform
1. Go to DigitalOcean App Platform
2. Connect GitHub repo
3. Configure environment variables
4. Auto-deploy from GitHub

### Option 4: VPS/Cloud Server
1. Get Ubuntu/CentOS server
2. Install Node.js 18+
3. Upload files via git or FTP
4. Run: `npm install --production`
5. Use PM2 for process management
6. Configure nginx as reverse proxy

## Environment Variables Required
- `OPENAI_API_KEY` - Your OpenAI API key
- `DISCORD_BOT_TOKEN` - Your Discord bot token  
- `DISCORD_GUILD_ID` - Your Discord server ID
- `NODE_ENV=production`
- `PORT` (usually auto-set by hosting platform)

## Domain Setup
1. Point your domain to the hosting platform
2. Update CORS origins in server.js if needed
3. Consider SSL certificate (most platforms auto-provide)

## Files Included for Deployment
- `Procfile` - Heroku process definition
- `package.json` - Updated with engines and scripts
- `.gitignore` - Excludes sensitive files
- `server.js` - Production-ready server

## Testing Production Build
```bash
NODE_ENV=production npm start
```

## Need Help?
Let me know your hosting preference and I'll provide specific steps!