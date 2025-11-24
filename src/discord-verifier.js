const { Client, GatewayIntentBits } = require('discord.js');
class DiscordVerifier {
    constructor() {
        this.client = null;
        this.isReady = false;
        this.serverId = '1392943536147796047';
        this.botToken = process.env.DISCORD_BOT_TOKEN;
        
        // Role hierarchy for Star-bit levels
        this.starbitRoles = [
            { name: '⭐️Star-bit⭐️LV.0👾', level: 0, sufficient: false },
            { name: '⭐️Star-bit⭐️LV.1👾', level: 1, sufficient: false },
            { name: '⭐️Star-bit⭐️LV.2👾', level: 2, sufficient: true },
            { name: '⭐️Star-bit⭐️LV.3👾', level: 3, sufficient: true },
            // Add more levels as needed
        ];
        
        this.initializeBot();
    }

    async initializeBot() {
        if (!this.botToken) {
            console.log('⚠️ No Discord bot token found. Discord verification disabled.');
            return;
        }

        // Clean up expired codes every 5 minutes
        setInterval(() => this.cleanupExpiredCodes(), 5 * 60 * 1000);

        try {
            this.client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMembers,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.MessageContent
                ]
            });

            // Store recent verification codes
            this.recentVerificationCodes = new Map(); // username -> {code, timestamp}

            this.client.once('ready', () => {
                console.log('🤖 Discord bot ready:', this.client.user.tag);
                this.isReady = true;
            });

            this.client.on('error', (error) => {
                console.error('❌ Discord client error:', error);
                this.isReady = false;
            });

            // Listen for DM messages to track verification codes
            this.client.on('messageCreate', async (message) => {
                // Debug: log all non-bot messages
                if (!message.author.bot) {
                    console.log(`📧 Message: Guild: ${message.guild ? message.guild.name : 'DM'}, Author: ${message.author.username}, Content: "${message.content}"`);
                }
                
                // Test: respond to any DM to check if DMs work
                if (!message.guild && !message.author.bot) {
                    console.log(`📨 Received DM from ${message.author.username}: "${message.content}"`);
                }
                
                // Only process DMs (no guild) and verification codes
                if (!message.guild && message.content.startsWith('MAE-VERIFY-') && !message.author.bot) {
                    const username = message.author.username.toLowerCase();
                    const userId = message.author.id;
                    
                    console.log(`� DM verification code from ${username} (${userId}): ${message.content}`);
                    
                    // Verify the user is actually in our server
                    try {
                        const guild = await this.client.guilds.fetch(this.serverId);
                        const member = await guild.members.fetch(userId);
                        
                        if (member) {
                            // Store verification code with both username and userId for security
                            this.recentVerificationCodes.set(username, {
                                code: message.content,
                                timestamp: Date.now(),
                                userId: userId,
                                displayName: member.displayName || username
                            });
                            
                            console.log(`✅ Stored verification code for server member ${username}`);
                            
                            // Send confirmation DM
                            await message.reply(`received your verification code! go back to the Mae Terminal and type "verified" to complete the process (⁄ ⁄>⁄ ▽ ⁄<⁄)`);
                        } else {
                            await message.reply(`uhh... you're not in the Glitch_Core server (¬_¬) you need to join the server first before i can verify you`);
                        }
                    } catch (error) {
                        console.error('Error verifying DM user:', error);
                        await message.reply(`my verification systems are acting up... try again in a moment? (╥﹏╥)`);
                    }
                }
            });

            await this.client.login(this.botToken);
        } catch (error) {
            console.error('❌ Failed to initialize Discord bot:', error.message);
            this.isReady = false;
        }
    }

    async verifyUserRole(username) {
        if (!this.isReady || !this.client) {
            return {
                success: false,
                error: "Discord verification is currently unavailable",
                maeResponse: "uhh... my discord connection is acting up (╥﹏╥) can't verify your role right now"
            };
        }

        try {
            console.log('🔍 Verifying Discord user:', username);
            
            // Get the guild (server)
            const guild = await this.client.guilds.fetch(this.serverId);
            if (!guild) {
                throw new Error('Guild not found');
            }

            // Search for user by username (case-insensitive)
            const members = await guild.members.fetch();
            const member = members.find(m => 
                m.user.username.toLowerCase() === username.toLowerCase() ||
                (m.user.globalName && m.user.globalName.toLowerCase()) === username.toLowerCase() ||
                m.displayName.toLowerCase() === username.toLowerCase()
            );

            if (!member) {
                return {
                    success: false,
                    error: "User not found in server",
                    maeResponse: `hmm... i can't find "${username}" in my server records (¬_¬) are you sure that's your exact discord username? maybe you're not in the Glitch_Core server yet?`
                };
            }

            console.log('👤 Found Discord member:', member.user.username);

            // Check user's roles for Star-bit levels
            const userRoles = member.roles.cache;
            let highestLevel = -1;
            let userRole = null;

            for (const role of this.starbitRoles) {
                const hasRole = userRoles.some(r => r.name === role.name);
                if (hasRole && role.level > highestLevel) {
                    highestLevel = role.level;
                    userRole = role;
                }
            }

            if (highestLevel === -1) {
                return {
                    success: false,
                    error: "User has no Star-bit role",
                    maeResponse: `${username}... you're in the server but you don't have any Star-bit role yet ＞﹏＜ looks like you haven't started playing Glitch_Core. go earn some levels first!`
                };
            }

            if (highestLevel < 2) {
                return {
                    success: false,
                    error: `User is only level ${highestLevel}`,
                    maeResponse: `oh hey ${username}! i can see you in the server but... you're only ${userRole ? userRole.name : 'LV.' + highestLevel} (¬_¬) i need you to be at least ⭐️Star-bit⭐️LV.2👾 before i can trust you with my secrets. keep playing Glitch_Core to level up!`
                };
            }

            // User has sufficient level (LV.2 or higher)
            return {
                success: true,
                level: highestLevel,
                roleName: userRole.name,
                maeResponse: `${username}!! (⁄ ⁄>⁄ ▽ ⁄<⁄) i can see you in the server with ${userRole.name}! that's enough proof for me... you're verified! welcome to my world ＞﹏＜`
            };

        } catch (error) {
            console.error('❌ Discord verification error:', error);
            return {
                success: false,
                error: error.message,
                maeResponse: "my discord connection is glitching out... (╥﹏╥) verification systems are down, try again later?"
            };
        }
    }

    async isUserInServer(username) {
        if (!this.isReady || !this.client) return false;

        try {
            const guild = await this.client.guilds.fetch(this.serverId);
            const members = await guild.members.fetch();
            
            return members.some(m => 
                m.user.username.toLowerCase() === username.toLowerCase() ||
                (m.user.globalName && m.user.globalName.toLowerCase()) === username.toLowerCase() ||
                m.displayName.toLowerCase() === username.toLowerCase()
            );
        } catch (error) {
            console.error('Discord user check error:', error);
            return false;
        }
    }

    async sendVerificationDM(username, verificationCode) {
        if (!this.isReady || !this.client) {
            return {
                success: false,
                reason: "my discord connection is down (╥﹏╥)"
            };
        }

        try {
            console.log('📤 Attempting to send verification DM to:', username);
            
            // Get the guild (server)
            const guild = await this.client.guilds.fetch(this.serverId);
            if (!guild) {
                throw new Error('Guild not found');
            }

            // Search for user by username (case-insensitive)
            const members = await guild.members.fetch();
            const member = members.find(m => 
                m.user.username.toLowerCase() === username.toLowerCase() ||
                (m.user.globalName && m.user.globalName.toLowerCase()) === username.toLowerCase() ||
                m.displayName.toLowerCase() === username.toLowerCase()
            );

            if (!member) {
                return {
                    success: false,
                    reason: "you're not in the Glitch_Core server"
                };
            }

            console.log('👤 Found user, attempting to send DM to:', member.user.username);

            // Try to send DM
            const dmChannel = await member.user.createDM();
            await dmChannel.send(`hey ${member.user.username}! someone is trying to verify as you in Mae Terminal (⁄ ⁄>⁄ ▽ ⁄<⁄)\n\nif this is you, here's your verification code:\n**${verificationCode}**\n\ngo back to Mae Terminal and type "verified" to complete the process!\n\nif this WASN'T you, someone might be trying to impersonate you... be careful! (¬_¬)`);
            
            console.log('✅ Successfully sent verification DM to:', username);
            
            // Store the code as if they sent it (for verification later)
            this.recentVerificationCodes.set(username.toLowerCase(), {
                code: `MAE-VERIFY-${verificationCode}`,
                timestamp: Date.now(),
                userId: member.user.id,
                displayName: member.displayName || username,
                sentByBot: true
            });

            return {
                success: true,
                userId: member.user.id
            };

        } catch (error) {
            console.error('❌ Failed to send verification DM:', error.message);
            
            if (error.message.includes('Cannot send messages to this user')) {
                return {
                    success: false,
                    reason: "your DMs are disabled or you don't allow DMs from server members"
                };
            } else {
                return {
                    success: false,
                    reason: "couldn't reach you on discord"
                };
            }
        }
    }

    async checkUserSentCode(username, expectedCode) {
        const userData = this.recentVerificationCodes.get(username.toLowerCase());
        
        if (!userData) {
            console.log(`❌ No verification code found for ${username}`);
            return false;
        }

        // Check if code matches and was sent within last 15 minutes (more time for DM process)
        const isCodeCorrect = userData.code === expectedCode || userData.code === `MAE-VERIFY-${expectedCode.replace('MAE-VERIFY-', '')}`;
        const isRecent = (Date.now() - userData.timestamp) < 15 * 60 * 1000; // 15 minutes

        if (isCodeCorrect && isRecent) {
            console.log(`✅ Verification code confirmed for ${username} (${userData.userId})`);
            // Clean up used code
            this.recentVerificationCodes.delete(username.toLowerCase());
            return {
                success: true,
                userId: userData.userId,
                displayName: userData.displayName
            };
        } else {
            console.log(`❌ Invalid or expired verification code for ${username}`);
            return false;
        }
    }

    // Clean up expired verification codes periodically
    cleanupExpiredCodes() {
        const now = Date.now();
        const expireTime = 15 * 60 * 1000; // 15 minutes
        
        for (const [username, userData] of this.recentVerificationCodes.entries()) {
            if (now - userData.timestamp > expireTime) {
                console.log(`🧹 Cleaning up expired verification code for ${username}`);
                this.recentVerificationCodes.delete(username);
            }
        }
    }

    async sendNotificationDM(username, message) {
        if (!this.isReady || !this.client) {
            console.log('❌ Discord bot not ready for notification DM');
            return { success: false, reason: 'bot not ready' };
        }

        try {
            console.log(`📧 Attempting to send notification DM to ${username}...`);
            
            // Search for user by username
            const guild = this.client.guilds.cache.get(this.serverId);
            if (!guild) {
                console.log('❌ Guild not found for notification');
                return { success: false, reason: 'guild not found' };
            }

            const member = guild.members.cache.find(m => 
                m.user.username.toLowerCase() === username.toLowerCase()
            );

            if (!member) {
                console.log(`❌ Member ${username} not found in guild for notification`);
                return { success: false, reason: 'user not found in server' };
            }

            // Send DM
            await member.send(message);
            console.log(`✅ Notification DM sent successfully to ${username}`);
            
            return { success: true };
        } catch (error) {
            console.error(`❌ Failed to send notification DM to ${username}:`, error.message);
            return { success: false, reason: error.message };
        }
    }

    disconnect() {
        if (this.client) {
            this.client.destroy();
            this.isReady = false;
        }
    }
}

module.exports = DiscordVerifier;