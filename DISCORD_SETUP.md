# Discord Bot Setup Instructions

## Discord Bot Configuration for Mae Terminal

### 1. Bot Token Setup
You need to add your Discord bot token to the `.env` file:

```
DISCORD_BOT_TOKEN=your_actual_bot_token_here
```

### 2. Discord Application Details
- **Application ID**: 1392944721743053063
- **Public Key**: 67614d4ebbce832bd3ce2f3be1e81171c20d1145a49ce4dceb58daaelfdf2e07
- **Server ID**: 1392943536147796047
- **Bot Username**: mae.exe_v1.2

### 3. Required Bot Permissions
The bot needs these Discord permissions:
- View Channels
- Read Message History
- View Server Members

### 4. Star-bit Role Hierarchy
The system checks for these roles (in order):
- ⭐️Star-bit⭐️LV.0👾 (insufficient - tells user to level up)
- ⭐️Star-bit⭐️LV.1👾 (sufficient ✅)
- ⭐️Star-bit⭐️LV.2👾 (sufficient ✅)
- ⭐️Star-bit⭐️LV.3👾 (sufficient ✅)

### 5. Verification Flow
1. User completes t-shirt verification
2. Mae asks for Discord username
3. Bot checks if user is in server with appropriate Star-bit role
4. If LV.0: Mae tells them to play Glitch_Core to level up
5. If LV.1+: Full verification complete!

### 6. Error Handling
- User not found in server: Mae suggests they join the Glitch_Core server
- User has no Star-bit role: Mae tells them to start playing
- Bot connection issues: Mae reports connection problems

To get your bot token:
1. Go to https://discord.com/developers/applications
2. Select your application (1395162830033915984)
3. Go to "Bot" section
4. Copy the token and add it to your .env file