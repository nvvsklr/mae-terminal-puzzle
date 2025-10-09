# Mae Terminal - Koala Host Deployment Guide

## 🎯 Deploy to Your Koala Host Website

Your Koala Host supports Node.js! Here's how to deploy Mae Terminal:

### Step 1: Prepare Files for Upload
1. Create a ZIP file of your project:
   - Include: `server.js`, `package.json`, `src/`, `public/`, `Procfile`
   - Exclude: `node_modules/`, `.env`, `.git/`

### Step 2: Setup Node.js App in cPanel
1. Click **"Setup Node.js App"** in your cPanel
2. Configure:
   - **Node.js Version**: Select latest (18.x or higher)
   - **Application Mode**: Production
   - **Application Root**: `/mae-terminal` (or your preferred folder)
   - **Application URL**: `yourdomain.com/mae-terminal` (or subdomain)
   - **Application Startup File**: `server.js`

### Step 3: Upload Files
1. Use **File Manager** in cPanel
2. Navigate to your Node.js app directory
3. Upload and extract your ZIP file
4. Or use FTP/SFTP to upload files

### Step 4: Install Dependencies
1. In cPanel Node.js App interface
2. Click **"NPM Install"** or run terminal command:
   ```bash
   npm install --production
   ```

### Step 5: Environment Variables
In cPanel Node.js App, add these environment variables:
- `OPENAI_API_KEY` = your_openai_api_key_here
- `DISCORD_BOT_TOKEN` = your_discord_bot_token_here  
- `DISCORD_GUILD_ID` = your_discord_server_id_here
- `NODE_ENV` = production
- `PORT` = (usually auto-set by hosting)

### Step 6: Start Application
1. Click **"Start App"** in Node.js interface
2. Your Mae Terminal will be available at your domain!

## 🔧 Important Notes for Koala Host:

### File Structure on Server:
```
/public_html/mae-terminal/
├── server.js
├── package.json
├── src/
│   ├── mae-ai.js
│   ├── verification.js
│   └── discord-verifier.js
└── public/
    ├── index.html
    ├── styles.css
    └── script.js
```

### Domain Access:
- Main domain: `yourdomain.com/mae-terminal`
- Or create subdomain: `mae.yourdomain.com`

### Troubleshooting:
- Check Node.js app logs in cPanel
- Ensure all dependencies are installed
- Verify environment variables are set
- Check if ports are properly configured

## 🚀 Alternative: Subdomain Setup
For cleaner URLs, create a subdomain:
1. Create subdomain `mae.yourdomain.com` in cPanel
2. Point it to your Node.js app directory
3. Access directly at `mae.yourdomain.com`

## ⚡ Quick Test:
Once deployed, test at your URL to see the Windows CMD interface!

Need help with any specific step?