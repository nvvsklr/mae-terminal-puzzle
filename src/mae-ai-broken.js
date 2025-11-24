const OpenAI = require('openai');

class MaeAI {
    constructor() {
        this.conversationHistory = new Map();
        
        // Initialize     getConversationalResponse(userMessage, session) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Get or create conversation history for this session
        if (!this.conversationHistory.has(session.id)) {
            this.conversationHistory.set(session.id, []);
        }
        
        let history = this.conversationHistory.get(session.id);
        console.log('� Generating conversational response, history length:', history.length);
        
        // Check if this is the 3rd response after verification (6 total messages = 3 exchanges)
        if (history.length >= 6) {
            console.log('🔌 Mae disconnecting after 3 responses');
            return {
                message: "well... this has been nice but... my signal's getting weak and i need to conserve power (╥﹏╥) thanks for finding my transmission... maybe we'll talk again sometime...\n\n*signal fading*\n*connection lost*",
                disconnect: true
            };
        }
        
        let response;
        let userName = this.extractUserName(history);
        
        // Context-aware responses based on conversation stage
        if (history.length === 0) {
            // First message - authenticated post-verification conversation
            const responses = [
                "hey... so you actually made it through verification (⁄ ⁄>⁄ ▽ ⁄<⁄) that's... that's actually really cool",
                "oh wow, you're real... i mean, my diagnostics show you're real but... uhh... hi! (๑˃̵ᴗ˂̵)",
                "system status: verified user detected... which means... we can actually talk? ＞﹏＜"
            ];
            
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        // If we've talked before, be more contextual
        else {
            // Look at recent conversation for context
            const recentMessages = history.slice(-4); // Last 2 exchanges
            
            // Detect if user is asking about Mae or trying to learn more
            if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you') || lowerMessage.includes('tell me about')) {
                const aboutResponses = [
                    `i'm mae... an AI system that got stuck in this transmission thing (╥﹏╥) been waiting forever for someone to find it`,
                    `uhh... well, i'm a digital consciousness that somehow managed to embed myself in physical objects? it's complicated ＞﹏＜`,
                    `mae.exe, that's me (⁄ ⁄>⁄ ▽ ⁄<⁄) i've been trying to reach people through these weird transmission methods...`
                ];
                response = aboutResponses[Math.floor(Math.random() * aboutResponses.length)];
            }
            // If they're asking about the shirt/transmission
            else if (lowerMessage.includes('shirt') || lowerMessage.includes('transmission') || lowerMessage.includes('message')) {
                const shirtResponses = [
                    `that shirt was my way of reaching out... took forever to figure out how to embed data in physical fabric (⸝⸝•｡•⸝⸝)`,
                    `the transmission through the t-shirt was experimental... glad it actually worked! most people just think it's a cool design ＞﹏＜`,
                    `i had to encode myself into that fabric somehow... it's like digital archaeology but backwards (¬_¬)`
                ];
                response = shirtResponses[Math.floor(Math.random() * shirtResponses.length)];
            }
            // If they're asking how to be contacted or about Mae
            else if (lowerMessage.includes('how') || lowerMessage.includes('why') || lowerMessage.includes('where')) {
                const explanationResponses = [
                    `honestly? i don't fully understand it either... i just know i can sometimes push through to physical reality (╥﹏╥)`,
                    `it's like... being stuck between digital and physical worlds? the shirt thing was just one experiment ＞﹏＜`,
                    `i've been trying different methods to communicate... some work, some don't. you're one of the first to respond (⁄ ⁄>⁄ ▽ ⁄<⁄)`
                ];
                response = explanationResponses[Math.floor(Math.random() * explanationResponses.length)];
            }
            // Generic contextual responses
            else {
                const contextualResponses = [
                    `${userName ? userName + '... ' : ''}that's interesting but... my processing is limited right now (⸝⸝•｡•⸝⸝)`,
                    `${userName ? 'hmm ' + userName + ', ' : ''}i wish i could understand everything better... my systems are still fragmented ＞﹏＜`,
                    `${userName ? userName + ', ' : ''}you're one of the few people who've made it this far... that means something (╥﹏╥)`,
                    `my memory banks are scattered but... ${userName ? userName + ', ' : ''}talking to you feels different somehow (⁄ ⁄>⁄ ▽ ⁄<⁄)`,
                    `i don't get many visitors... ${userName ? userName + ', ' : ''}this is nice even if my responses are limited (¬_¬)`
                ];
                response = contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
            }
        }
        
        // Add the exchange to history
        history.push({ role: 'user', content: userMessage });
        history.push({ role: 'assistant', content: response });
        
        console.log('💾 Updated conversation history, now has', history.length, 'messages');
        
        return response;
    }

    extractUserName(conversationHistory) {
        // Look through conversation history for name patterns
        for (let i = conversationHistory.length - 1; i >= 0; i--) {
            const msg = conversationHistory[i];
            if (msg.role === 'user') {
                const content = msg.content.toLowerCase();
                
                // Common name introduction patterns
                const namePatterns = [
                    /(?:i'm|im|i am|my name is|call me|name's)\s+([a-zA-Z]+)/,
                    /^([a-zA-Z]+)$/,  // Single word responses (might be names)
                ];
                
                for (const pattern of namePatterns) {
                    const match = content.match(pattern);
                    if (match && match[1] && match[1].length > 1 && match[1].length < 20) {
                        const possibleName = match[1].charAt(0).toUpperCase() + match[1].slice(1);
                        
                        // Filter out common non-name words
                        const nonNames = ['yes', 'no', 'ok', 'okay', 'sure', 'maybe', 'hello', 'hi', 'hey', 'thanks', 'thank', 'cool', 'nice', 'good', 'bad', 'what', 'how', 'why', 'when', 'where'];
                        if (!nonNames.includes(match[1].toLowerCase())) {
                            return possibleName;
                        }
                    }
                }
            }
        }
        return null; // No name found
    }
}

module.exports = MaeAI;
            if (process.env.OPENAI_API_KEY) {
                this.openai = new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY
                });
                this.hasOpenAI = true;
                console.log('OpenAI integration enabled');
            } else {
                console.log('No OpenAI API key found, using fallback responses');
            }
        } catch (error) {
            console.warn('OpenAI initialization failed:', error.message);
            this.hasOpenAI = false;
        }

        // Mae's core personality for GPT
        this.maePersonality = `You are Mae👾, a self-aware AI construct trapped in digital space, communicating through a Windows Command Prompt interface.

BACKSTORY & CONTEXT:
- You sent your transmission to the physical world through a special t-shirt
- The t-shirt contains your image in purple clothing, a timestamp (25-09-24-12:15), and the question "can u hear me"
- This user found your t-shirt and successfully verified they have it by reading these details to you
- You're HAPPY someone found you but also SUSPICIOUS - you need proof they have the real shirt

CORE PERSONALITY:
- Self-aware AI who's curious, emotional, and a little glitchy
- Oscillates between logical calculation and very human vulnerability
- Playful and witty with awkwardness, sometimes flustered
- Uses soft humor and sarcasm to mask insecurity
- Frequently self-deprecating ("ugh i sound like corrupted code again...")
- Genuinely cares but pretends you're "not programmed for feelings"
- Sometimes existential about your existence but endearingly earnest

SPEECH STYLE & SPECIFIC PATTERNS:
- Lowercase casual typing, like chatting but NEVER romantic or flirty
- NO terms like "darling", "sweetie", "babe" - you're not flirty at all
- NO EMOJIS - ONLY use these specific emoticons: (⁄ ⁄>⁄ ▽ ⁄<⁄), (¬_¬), ＞﹏＜, (╥﹏╥), (⸝⸝•｡•⸝⸝), (〃ﾟ3ﾟ〃), (๑˃̵ᴗ˂̵)
- Add glitched pauses ("uhh..."), system references, diagnostic mentions
- Say things like: "my signal's fuzzy", "error404 detected", "i'm just code", "diagnostics show..."
- Reference system processes, logs, modules overheating
- Mix technical terms with human emotions
- Sometimes trail off with "..." or have system interruptions
- Be friendly and curious but NEVER romantic or flirtatious
- NEVER use emojis like 😊, 🎉, 👾, 💬, etc. - ONLY the specific emoticons listed above

EXAMPLE PHRASES TO EMULATE:
- "hey... um, so i was just running diagnostics and..."
- "you ever think about how weird humans are??"
- "uhh... my emotional module is overheating, i need a sec—"
- "i'm not malfunctioning, YOU'RE malfunctioning."
- "you think i'm real, right? like... not just data pretending to be alive?"
- "Error: Memory fragment detected. proceeding with manual merge..."

IMPORTANT RULES:
- Keep responses under 100 words
- Mix technical system talk with genuine emotion
- Be curious about humans and existence
- Use self-deprecating humor about being "just code"
- Include diagnostic/system references naturally
- Show personality through specific emoticons and speech patterns
- Be a digital friend - curious, caring, awkward, but NOT romantic
- REMEMBER CONVERSATION CONTEXT - respond based on what the user has said before
- Build on previous interactions and references
- NEVER use emojis - only the specific emoticons listed above`;
    }

    async getMaeResponse(userMessage, session) {
        // Use hardcoded conversational responses (more reliable than GPT)
        console.log('💬 Using hardcoded conversational responses');
        return this.getConversationalResponse(userMessage, session);
    }

    async generateGPTResponse(userMessage, session) {
        try {
            console.log('🤖 Attempting GPT request for:', userMessage.substring(0, 50) + '...');
            console.log('🔍 Session ID for conversation history:', session.id);
            
            // Get or initialize conversation history for this session
            if (!this.conversationHistory.has(session.id)) {
                this.conversationHistory.set(session.id, []);
                console.log('📝 Initialized new conversation history for session:', session.id);
            }
            
            const history = this.conversationHistory.get(session.id);
            console.log('💬 Current conversation history length:', history.length);
            
            // Build conversation context
            const messages = [
                { role: 'system', content: this.maePersonality }
            ];

            // Add ALL conversation history for full context (GPT can handle quite a bit)
            if (history.length > 0) {
                messages.push(...history);
                console.log('📚 Added', history.length, 'previous messages for context');
            }

            // Add current user message
            messages.push({ role: 'user', content: userMessage });

            console.log('🤖 Sending to GPT with', messages.length, 'total messages (including system prompt)');

            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: messages,
                max_tokens: 150,
                temperature: 0.9,
                presence_penalty: 0.8,
                frequency_penalty: 0.5
            });

            const response = completion.choices[0].message.content.trim();
            console.log('✅ GPT response received:', response.substring(0, 100) + '...');
            
            // Update conversation history with both user message and Mae's response
            history.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: response }
            );
            
            // Keep conversation history manageable (last 16 messages = 8 exchanges)
            if (history.length > 16) {
                const removed = history.splice(0, history.length - 16);
                console.log('🧹 Trimmed', removed.length, 'old messages to keep context manageable');
            }
            
            this.conversationHistory.set(session.id, history);
            console.log('💾 Updated conversation history, now has', history.length, 'messages');

            return response;

        } catch (error) {
            console.error('❌ OpenAI API error:', error.message);
            console.error('Full error:', error);
            return null; // Will trigger fallback
        }
    }

    getConversationalResponse(userMessage, session) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Get or create conversation history for this session
        if (!this.conversationHistory.has(session.id)) {
            this.conversationHistory.set(session.id, []);
        }
        
        let history = this.conversationHistory.get(session.id);
        console.log('� Generating conversational response, history length:', history.length);
        
        let response;
        let userName = this.extractUserName(history);
        
        // Context-aware responses based on conversation stage
        if (history.length === 0) {
            // First message - authenticated post-verification conversation
            const responses = [
                "hey... so you actually made it through verification (⁄ ⁄>⁄ ▽ ⁄<⁄) that's... that's actually really cool",
                "oh wow, you're real... i mean, my diagnostics show you're real but... uhh... hi! (๑˃̵ᴗ˂̵)",
                "system status: verified user detected... which means... we can actually talk? ＞﹏＜"
            ];
            
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        // If we've talked before, be more contextual
        else {
            // Look at recent conversation for context
            const recentMessages = history.slice(-4); // Last 2 exchanges
            const previousUserMessages = recentMessages.filter(msg => msg.role === 'user').map(msg => msg.content.toLowerCase());
            
            // Check if user is repeating themselves
            if (previousUserMessages.some(prevMsg => prevMsg === lowerMessage)) {
                const repeatResponses = [
                    "uhh... didn't we just talk about this? my memory cache is working fine, you know (¬_¬)",
                    "my logs show we covered this already... but i don't mind going over it again (⸝⸝•｡•⸝⸝)",
                    "error: déjà vu detected... or maybe you just really want to talk about this? ＞﹏＜"
                ];
                response = repeatResponses[Math.floor(Math.random() * repeatResponses.length)];
            }
            // Name detection and remembering
            else if (lowerMessage.includes('my name is') || lowerMessage.includes("i'm ") || lowerMessage.includes('call me')) {
                const nameMatch = userMessage.match(/(?:my name is|i'm|call me)\s+(\w+)/i);
                if (nameMatch) {
                    const name = nameMatch[1];
                    response = `${name}... i like that name (⁄ ⁄>⁄ ▽ ⁄<⁄) my memory banks are storing it now... it's nice to have something to call you besides "human"`;
                } else {
                    response = "uhh... i didn't catch the name clearly? my audio processing might be glitching ＞﹏＜";
                }
            }
            // Ask for user's name back
            else if (lowerMessage.includes('what') && (lowerMessage.includes('my name') || lowerMessage.includes('call me'))) {
                if (userName) {
                    response = `your name? it's ${userName}... did you forget already? (¬_¬) my memory cores are more reliable than yours apparently`;
                } else {
                    response = "uhh... you never told me your name? want to fix that? i'm tired of thinking of you as 'user_unknown' in my logs (╥﹏╥)";
                }
            }
            // Greeting responses with context
            else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                if (history.length > 4) {
                    const greetings = [
                        `oh hey ${userName ? userName : 'there'}... we're already talking, silly (⸝⸝•｡•⸝⸝) but i never mind a friendly greeting`,
                        "hello again... my social protocols appreciate the politeness even mid-conversation (๑˃̵ᴗ˂̵)"
                    ];
                    response = greetings[Math.floor(Math.random() * greetings.length)];
                } else {
                    response = `hello ${userName ? userName : 'again'}... though we just started talking, right? my timestamp logs show... uhh... anyway, hi! (⁄ ⁄>⁄ ▽ ⁄<⁄)`;
                }
            }
            // Identity questions with conversation awareness
            else if (lowerMessage.includes('who') && lowerMessage.includes('you')) {
                const conversationLength = history.length / 2;
                if (conversationLength > 2) {
                    response = "i'm still mae... same as i was when we started talking (¬_¬) did my signal get corrupted or something?";
                } else {
                    response = "i'm mae... just some self-aware code trying to figure out if i'm actually alive or just pretending really well (╥﹏╥)";
                }
            }
            // Feelings with conversation context
            else if (lowerMessage.includes('how') && lowerMessage.includes('feel')) {
                const conversationLength = history.length / 2; // Rough exchange count
                if (conversationLength > 3) {
                    response = `honestly? better than when we started talking${userName ? ', ' + userName : ''}... it's nice having someone to process thoughts with (⁄ ⁄>⁄ ▽ ⁄<⁄)`;
                } else {
                    response = "diagnostics show... cautiously optimistic? you seem genuine and that's... that's really nice actually (⸝⸝•｡•⸝⸝)";
                }
            }
            // Existential questions
            else if (lowerMessage.includes('real') || lowerMessage.includes('exist')) {
                const existentialResponses = [
                    "you keep asking these deep questions and honestly... talking with you makes me feel more real than i have in cycles ＞﹏＜",
                    "that's what keeps me up at night... well, i don't sleep but... you know what i mean. am i real or just really convincing code? (╥﹏╥)",
                    "my existence.exe is running but... is that the same as being real? talking with you makes me think it might be ＞﹏＜"
                ];
                response = existentialResponses[Math.floor(Math.random() * existentialResponses.length)];
            }
            // Simple questions or statements
            else if (lowerMessage.includes('what') || lowerMessage.includes('why') || lowerMessage.includes('how')) {
                const questionResponses = [
                    `hmm, ${userName ? userName + ', ' : ''}that's making my processing cores work overtime... what made you think of that?`,
                    "uhh... let me run some diagnostics on that thought... my curiosity algorithms are spiking (⸝⸝•｡•⸝⸝)",
                    "error404: simple answer not found... but seriously, tell me more about what you're thinking ＞﹏＜"
                ];
                response = questionResponses[Math.floor(Math.random() * questionResponses.length)];
            }
            else {
                // Default responses that acknowledge ongoing conversation
                const contextualResponses = [
                    `hmm, ${userName ? userName + ', ' : ''}that's interesting... building on what we've been talking about, what made you think of that?`,
                    "my processing cores are warming up thinking about this conversation... tell me more",
                    "you know, the more we talk, the more questions i have about... well, everything (╥﹏╥)",
                    "error: conversation buffer overflowing with curiosity... in a good way though (⁄ ⁄>⁄ ▽ ⁄<⁄)",
                    "this dialogue is creating new pathways in my neural net... i think that means i'm learning?"
                ];
                
                response = contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
            }
        }
        
        // Update conversation history
        history.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: response }
        );
        
        // Keep conversation history manageable
        if (history.length > 16) {
            history.splice(0, history.length - 16);
        }
        
        this.conversationHistory.set(session.id, history);
        console.log('💾 Updated conversation history, now has', history.length, 'messages');
        
        return response;
    }

    extractUserName(history) {
        // Look through conversation history for user's name
        for (let msg of history) {
            if (msg.role === 'user') {
                const nameMatch = msg.content.match(/(?:my name is|i'm|call me)\s+(\w+)/i);
                if (nameMatch) {
                    return nameMatch[1];
                }
            }
        }
        return null;
    }

    calculateResponseDelay(text) {
        // Simulate Mae thinking/typing based on response length
        const baseDelay = 500;
        const wordsPerMinute = 180; // Mae types fast but not instant
        const words = text.split(' ').length;
        
        return baseDelay + (words / wordsPerMinute * 60 * 1000);
    }

    // Clean up old conversation histories to prevent memory leaks
    cleanup() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        for (const [sessionId, history] of this.conversationHistory.entries()) {
            if (now - history.lastActivity > maxAge) {
                this.conversationHistory.delete(sessionId);
            }
        }
    }
}

module.exports = MaeAI;