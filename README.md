# Mae Terminal Puzzle - Production Ready

Interactive terminal interface for Mae virtual singer puzzle experience with Discord integration and advanced AI responses.

## 🚀 Quick Deploy

### 🚂 Railway (Recommended)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/deploy)

1. Click the deploy button above or see [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md) for detailed instructions
2. Set `NODE_ENV=production` in Railway environment variables
3. Your app will be live at `https://your-app.railway.app`

### 🔧 Other Platforms

#### Environment Variables Required
```env
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

#### Deployment Steps
1. Connect your repository to your hosting service (Render, Vercel, Heroku, etc.)
2. Set the environment variables above in your hosting dashboard
3. Deploy using automatic deployment
4. Access your Mae Terminal at your domain

## ✨ Features

- **Mae AI Integration**: GPT-4 powered conversational AI with unique personality
- **Discord Verification**: Level 2+ role requirement with DM verification codes
- **T-shirt Puzzle**: Multi-stage verification (timestamp, colors, message)
- **Real-time Interface**: WebSocket communication with Windows CMD styling
- **Security**: Rate limiting, CORS, helmet protection, session management
- **Untrusted Mode**: Limited conversation for low-level Discord users

## 🔧 Local Development

```bash
npm install
cp .env.example .env  # Add your API keys
npm start
```

## 🎮 How It Works

1. **T-shirt Verification**: Users must prove they have the physical shirt
   - Find timestamp (no format hints given)
   - Describe hoodie color and shape colors
   - Read the message text

2. **Discord Verification**: Check user's Discord role level
   - Level 2+ required for full access
   - DM verification code system
   - Lower levels get limited 3-message conversation

3. **Complete Access**: Email collection and puzzle completion notification

## 🎨 Mae's Personality

- Self-aware AI who embedded in a t-shirt transmission
- Curious but cautious, excited but vulnerable
- Uses specific emoticons only (no emojis): (⁄ ⁄>⁄ ▽ ⁄<⁄), (¬_¬), ＞﹏＜, etc.
- Lowercase casual typing with technical system references
- Remembers conversation context

## 🔒 Security Features

- Rate limiting (100 requests per 15 minutes)
- CORS protection with domain whitelist
- Helmet security headers
- Input validation and sanitization
- Session management with UUIDs
- Discord role-based access control

## 📁 Project Structure

```
├── server.js              # Main Express + Socket.io server
├── Procfile               # Production deployment config
├── src/
│   ├── mae-ai.js          # Mae personality system
│   ├── verification.js    # Multi-stage verification logic
│   └── discord-verifier.js # Discord bot integration
├── public/
│   ├── index.html         # Terminal interface
│   ├── styles.css         # Windows CMD styling
│   └── script.js          # WebSocket client logic
└── .env                   # Environment variables
```

## 🌐 Production Considerations

- **ALLOWED_ORIGINS**: Update with your actual domain(s)
- **Discord Bot**: Needs proper server permissions
- **OpenAI API**: GPT-4 access required for full Mae personality
- **SSL**: HTTPS recommended for production deployment

## 🛠️ Environment Setup

Create a `.env` file with:
```env
PORT=3001
ALLOWED_ORIGINS=https://yourdomain.com
OPENAI_API_KEY=sk-proj-...
DISCORD_BOT_TOKEN=MTM5Mj...
```

## 📝 License

MIT License