


// Example Discord OAuth2 integration for Mae Terminal
// This would replace username input with secure Discord login

const express = require('express');
const session = require('express-session');

// OAuth2 setup (would need to be integrated into server.js)
app.use(session({
    secret: 'mae-terminal-secret',
    resave: false,
    saveUninitialized: false
}));

// Discord OAuth2 route
app.get('/auth/discord', (req, res) => {
    const discordAuthURL = `https://discord.com/api/oauth2/authorize?client_id=1392944721743053063&redirect_uri=${encodeURIComponent('http://localhost:3001/auth/discord/callback')}&response_type=code&scope=identify%20guilds.members.read`;
    res.redirect(discordAuthURL);
});

// OAuth2 callback
app.get('/auth/discord/callback', async (req, res) => {
    const { code } = req.query;
    
    // Exchange code for token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: '1392944721743053063',
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'http://localhost:3001/auth/discord/callback'
        })
    });
    
    const tokens = await tokenResponse.json();
    
    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    
    const userData = await userResponse.json();
    
    // Store verified Discord user info in session
    req.session.discordUser = {
        id: userData.id,
        username: userData.username,
        verified: true
    };
    
    res.redirect('/verified');
});

// This approach guarantees the user owns the Discord account