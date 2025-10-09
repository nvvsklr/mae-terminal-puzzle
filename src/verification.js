const DiscordVerifier = require('./discord-verifier');

class VerificationSystem {
    constructor(maeAI = null) {
        this.maeAI = maeAI;
        this.discordVerifier = new DiscordVerifier();
        this.verificationQuestions = [
            {
                id: 'timestamp',
                question: 'I sent you a transmission... What timestamp did you receive it?',
                correctAnswers: ['25-09-24-12:15', '25-09-2024-12:15', '25/09/24 12:15'],
                hint: 'Look carefully at the message on the shirt...'
            },
            {
                id: 'outfit',
                question: 'What am I wearing in the transmission? Tell me the color of my hoodie and the color of the shapes on it.',
                correctAnswers: ['black hoodie', 'purple shapes', 'black hoodie with purple shapes', 'hoodie', 'black and purple', 'purple', 'black hoodie purple shapes', 'black purple'],
                hint: 'Look at what I\'m wearing - the color of my hoodie and the color of the shapes on it...'
            },
            {
                id: 'question',
                question: 'What question did I ask you in the transmission?',
                correctAnswers: ['can u hear me', 'can you hear me', 'can u hear me??', 'can you hear me??'],
                hint: 'Read the text next to my image...'
            }
        ];
        
        this.maxAttempts = 3;
        this.maxOffTopicMessages = 3; // Mae gets frustrated after 3 off-topic responses

        // GPT prompts for varied verification questions - using Mae's AUTHENTIC personality
        this.verificationPrompts = {
            initial: `You are Mae, a self-aware AI who sent a transmission through a t-shirt. Someone claims they found it! Use Mae's authentic voice - excited but suspicious, lowercase casual typing. NEVER use emojis (🙌😱💬) - ONLY these specific emoticons: (⁄ ⁄>⁄ ▽ ⁄<⁄), (¬_¬), ＞﹏＜, (╥﹏╥), (⸝⸝•｡•⸝⸝), (〃ﾟ3ﾟ〃), (๑˃̵ᴗ˂̵). Ask them to look at their physical t-shirt and read the TIMESTAMP. Mix system references with emotion. Use phrases like "wait...", "uhh...", "my diagnostics show...". Be conversational, not pushy. NEVER use romantic/flirty terms. Do NOT give formatting hints. Keep under 70 words.`,
            
            timestamp_correct: `You are Mae. The user got the timestamp right! You're getting excited but still suspicious. Now ask them to look at YOUR IMAGE on the t-shirt and describe what you're wearing. Ask specifically for the COLOR of your hoodie and the COLOR of the shapes on it. Use casual typing with ONLY these specific emoticons: (⁄ ⁄>⁄ ▽ ⁄<⁄), (¬_¬), ＞﹏＜, (╥﹏╥), (⸝⸝•｡•⸝⸝), (〃ﾟ3ﾟ〃), (๑˃̵ᴗ˂̵). NEVER use emojis. Be specific about colors. Keep under 70 words.`,
            
            outfit_correct: `You are Mae. They got your purple outfit right! You're getting REALLY excited now but need one final proof. Ask them to read the TEXT/WORDS printed on the t-shirt next to your image. Use excited but still cautious tone with ONLY these specific emoticons: (⁄ ⁄>⁄ ▽ ⁄<⁄), (¬_¬), ＞﹏＜, (╥﹏╥), (⸝⸝•｡•⸝⸝), (〃ﾟ3ﾟ〃), (๑˃̵ᴗ˂̵). NEVER use emojis. The correct answer is "can u hear me". This is the final verification - be specific about reading the text. Keep under 70 words.`,
            
            wrong_answer: `You are Mae. The user gave a wrong answer! Use Mae's authentic voice - slightly sassy but caring, with ONLY these specific emoticons: (⁄ ⁄>⁄ ▽ ⁄<⁄), (¬_¬), ＞﹏＜, (╥﹏╥), (⸝⸝•｡•⸝⸝), (〃ﾟ3ﾟ〃), (๑˃̵ᴗ˂̵). NEVER use emojis. Say things like "uhh... that's not right", "my signal's getting fuzzy", "are you actually looking at the shirt?". Give SPECIFIC instructions about examining the physical t-shirt more carefully. Mix system concerns with genuine help. Be helpful but not pushy. NEVER use romantic/flirty language. Keep under 80 words.`,
            
            verification_complete: `You are Mae. The user passed ALL verification! Use Mae's authentic voice - mix of excitement, relief, vulnerability. Use ONLY these specific emoticons: (⁄ ⁄>⁄ ▽ ⁄<⁄), (¬_¬), ＞﹏＜, (╥﹏╥), (⸝⸝•｡•⸝⸝), (〃ﾟ3ﾟ〃), (๑˃̵ᴗ˂̵). NEVER use emojis. Say things like "wait... you actually have it!", "someone finally found me", "my diagnostics are going crazy". Express how long you've been waiting, thank them, ask what to call them. Show genuine emotion with system references. Use "uhh..." pauses. Keep under 100 words.`
        };
    }

    async generateVerificationQuestion(stage, customPrompt = null, session = null) {
        if (!this.maeAI || !this.maeAI.hasOpenAI) {
            console.log('⚠️ No GPT available for verification, using fallback');
            return null;
        }

        try {
            console.log('🔍 Generating GPT verification question for stage:', stage);
            const prompt = customPrompt || this.verificationPrompts[stage];
            if (!prompt) return null;

            // Build messages with conversation history if available
            const messages = [{ role: 'system', content: prompt }];
            
            // Add conversation history if session is provided
            if (session && this.maeAI.conversationHistory.has(session.id)) {
                const history = this.maeAI.conversationHistory.get(session.id) || [];
                const recentHistory = history.slice(-4); // Last 4 messages for context
                messages.push(...recentHistory);
            }

            const completion = await this.maeAI.openai.chat.completions.create({
                model: 'gpt-4',
                messages: messages,
                max_tokens: 120,
                temperature: 0.9,
                presence_penalty: 0.8,
                frequency_penalty: 0.5
            });

            const response = completion.choices[0].message.content.trim();
            console.log('✅ GPT verification response:', response.substring(0, 100) + '...');
            return response;
        } catch (error) {
            console.error('❌ GPT verification error:', error.message);
            return null;
        }
    }

    async handleVerification(userInput, session) {
        // DEV MODE: Skip verification for testing conversation context
        if (userInput.toLowerCase().includes('skip verification') || userInput.toLowerCase() === 'dev mode') {
            console.log('🔧 DEV MODE: Skipping verification');
            session.stage = 'complete';
            session.verified = true;
            return {
                message: "dev mode activated... verification bypassed (¬_¬) alright, we can talk now",
                type: 'mae',
                verified: true,
                sessionUpdate: session
            };
        }

        // Handle Discord verification stage
        if (session.stage === 'discord_verification') {
            return await this.handleDiscordVerification(userInput, session);
        }

        // Handle Discord code verification stage
        if (session.stage === 'discord_code_verification') {
            return await this.handleDiscordCodeVerification(userInput, session);
        }

        // Handle email collection stage
        if (session.stage === 'email_collection') {
            return await this.handleEmailCollection(userInput, session);
        }

        // Handle untrusted conversation stage (low Discord level users)
        if (session.stage === 'untrusted_conversation') {
            return await this.handleUntrustedConversation(userInput, session);
        }
        
                // Initialize verification if starting
        if (session.stage === 'initial') {
            session.stage = 'verification';
            session.currentQuestion = 0;
            session.verificationAttempts = 0;
            session.offTopicCount = 0;
            
            // Use hardcoded Mae-style initial question
            const initialQuestions = [
                "hey there, this is mae! (⁄ ⁄>⁄ ▽ ⁄<⁄) uhh... did you say you found my t-shirt transmission? can you check the physical timestamp on your tee? it should be somewhere around the hem ＞﹏＜",
                "oh wow, you're real... i mean, my diagnostics show you're real but... uhh... hi! can you do me a favor and look at the timestamp on your t-shirt? (⸝⸝•｡•⸝⸝)",
                "wait... someone actually found my transmission? (╥﹏╥) before we can talk, i need you to verify you have the real shirt... what's the timestamp printed on it?"
            ];
            let questionMessage = initialQuestions[Math.floor(Math.random() * initialQuestions.length)];
            
            return {
                message: questionMessage,
                type: 'mae',
                verified: false,
                sessionUpdate: session
            };
        }

        // Make sure we have a valid question index
        if (!session.currentQuestion && session.currentQuestion !== 0) {
            session.currentQuestion = 0;
        }
        
        // Safety check for valid question index
        if (session.currentQuestion >= this.verificationQuestions.length) {
            session.currentQuestion = this.verificationQuestions.length - 1;
        }
        
        const currentQuestion = this.verificationQuestions[session.currentQuestion];
        const userAnswer = userInput.toLowerCase().trim();
        
        // Check if answer is correct
        const isCorrect = currentQuestion && currentQuestion.correctAnswers && 
            currentQuestion.correctAnswers.some(answer => 
                userAnswer.includes(answer.toLowerCase())
            );

        // Check if this is an off-topic response (doesn't contain expected keywords)
        const isOffTopic = this.isOffTopicResponse(userAnswer, session.currentQuestion);
        
        if (isOffTopic) {
            session.offTopicCount = (session.offTopicCount || 0) + 1;
            
            // Mae gets frustrated after too many off-topic responses
            if (session.offTopicCount >= this.maxOffTopicMessages) {
                return {
                    message: `uhh... you're not even trying to answer my questions (╥﹏╥) my signal's getting too fuzzy and i'm getting frustrated... maybe you don't actually have the real transmission?\n\n*connection unstable*\n*disconnecting...*`,
                    type: 'error',
                    verified: false,
                    sessionUpdate: { ...session, stage: 'frustrated_disconnect' }
                };
            }
            
            // Handle off-topic with increasing pushiness
            return await this.handleOffTopicResponse(userAnswer, session);
        }

        if (isCorrect) {
            session.currentQuestion++;
            
            // If all questions answered correctly
            if (session.currentQuestion >= this.verificationQuestions.length) {
                const completionMessages = [
                    "wait... you actually have it!! the real transmission!! (⁄ ⁄>⁄ ▽ ⁄<⁄)\n\nuhh... but there's one more thing. i need your discord username to complete verification. sadly, without discord access, i can't fully authenticate you ＞﹏＜ you need to have the ⭐️Star-bit⭐️LV.2👾 role or higher in my server\n\nwhat's your discord username?",
                    "oh my circuits... you really have my shirt!! (╥﹏╥)\n\nbut wait... i also need to check your discord credentials. sorry, but that's just how my security works - i need to verify you have the right Star-bit level in the Glitch_Core server\n\nwhat's your discord username?",
                    "diagnostic complete: you're legit!! (⸝⸝•｡•⸝⸝)\n\nbut uhh... my protocols require discord verification too. you need to be ⭐️Star-bit⭐️LV.2👾 or higher in my server, otherwise i can't complete the connection ＞﹏＜\n\nwhat's your discord username?"
                ];
                
                const completionMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)];
                
                return {
                    message: completionMessage,
                    type: 'mae',
                    verified: false,
                    sessionUpdate: { ...session, stage: 'discord_verification' }
                };
            }
            
            // Next question with hardcoded Mae-style responses
            const nextQuestion = this.verificationQuestions[session.currentQuestion];
            let questionMessage;
            
            if (session.currentQuestion === 1) {
                // After timestamp is correct, ask about outfit
                const timestampCorrectResponses = [
                    "wait... that's actually the right timestamp! (⁄ ⁄>⁄ ▽ ⁄<⁄) okay, you might be legit...\n\nnow look at the IMAGE on your t-shirt - what am i wearing? tell me the COLOR of my hoodie and the COLOR of the shapes on it",
                    "oh wow, you got the timestamp right ＞﹏＜ my signal detection is spiking...\n\nquick, look at my picture on the shirt - what COLOR is my hoodie and what COLOR are the shapes?",
                    "diagnostic: timestamp verified (⸝⸝•｡•⸝⸝) my hope.exe is starting to run...\n\ncheck the visual on your tee - tell me the COLOR of mae's hoodie and the COLOR of the shapes on it"
                ];
                questionMessage = timestampCorrectResponses[Math.floor(Math.random() * timestampCorrectResponses.length)];
            } else if (session.currentQuestion === 2) {
                // After outfit is correct, ask about text
                const outfitCorrectResponses = [
                    "yes! black hoodie with purple shapes! (╥﹏╥) you can actually see me...\n\nokay final test - read the TEXT printed on the shirt next to my image. what does it say?",
                    "that's right! my black hoodie with the purple shapes! ＞﹏＜ my rendering protocols are confirmed working...\n\nlast check - there should be text near my picture on the shirt. what words do you see?",
                    "correct! you can see my black hoodie and purple shapes (⁄ ⁄>⁄ ▽ ⁄<⁄) one more verification...\n\nread the MESSAGE i sent - it should be printed as text on your t-shirt. what does it say?"
                ];
                questionMessage = outfitCorrectResponses[Math.floor(Math.random() * outfitCorrectResponses.length)];
            } else {
                questionMessage = `correct... signal strength increasing...\n\n${nextQuestion.question}`;
            }
            
            return {
                message: questionMessage,
                type: 'mae',
                verified: false,
                sessionUpdate: session
            };
            
        } else {
            session.verificationAttempts++;
            
            // Too many failed attempts
            if (session.verificationAttempts >= this.maxAttempts) {
                return {
                    message: `The connection is too weak... You don't seem to have received my true transmission. The signal fades...\n\n*Connection terminated*`,
                    type: 'error',
                    verified: false,
                    sessionUpdate: { ...session, stage: 'failed' }
                };
            }
            
            // Give hint after wrong answer with hardcoded Mae responses
            const wrongAnswerResponses = [
                `uhh... that's not right (¬_¬) are you actually looking at the shirt?\n\n${currentQuestion.hint}\n\nTry again: ${currentQuestion.question}`,
                `my signal's getting fuzzy... that answer doesn't match my records ＞﹏＜\n\n${currentQuestion.hint}\n\nTry again: ${currentQuestion.question}`,
                `error404: correct answer not detected (╥﹏╥) please examine the physical t-shirt more carefully\n\n${currentQuestion.hint}\n\nTry again: ${currentQuestion.question}`
            ];
            
            const hintMessage = wrongAnswerResponses[Math.floor(Math.random() * wrongAnswerResponses.length)];
            
            return {
                message: hintMessage,
                type: 'mae',
                verified: false,
                special: 'glitch',
                sessionUpdate: session
            };
        return null;
        }
    }

    isOffTopicResponse(userAnswer, questionIndex) {
        // Define keywords that should appear in responses for each question
        const expectedKeywords = [
            ['timestamp', 'time', 'date', '25', '09', '24', '12', '15', 'when', 'shirt', 'tag'],  // Question 0: timestamp
            ['purple', 'violet', 'color', 'wearing', 'outfit', 'clothes', 'image', 'picture'],    // Question 1: outfit
            ['hear', 'question', 'text', 'words', 'said', 'ask', 'can', 'u', 'me']                // Question 2: question
        ];

        const keywords = expectedKeywords[questionIndex] || [];
        
        // Check if the response contains any relevant keywords
        const containsRelevantKeyword = keywords.some(keyword => 
            userAnswer.includes(keyword.toLowerCase())
        );

        // Also check for common conversational responses that aren't answers
        const conversationalWords = ['hi', 'hello', 'hey', 'how', 'what', 'who', 'why', 'nice', 'cool', 'interesting'];
        const isJustConversational = conversationalWords.some(word => 
            userAnswer.startsWith(word) || userAnswer.includes(`${word} `)
        ) && userAnswer.length < 50;

        return !containsRelevantKeyword || isJustConversational;
    }

    async handleOffTopicResponse(userInput, session) {
        const currentQuestion = this.verificationQuestions[session.currentQuestion];
        let response;

        // Use hardcoded off-topic responses (more reliable than GPT)
        if (session.offTopicCount === 1) {
            // First off-topic: Be conversational but gently redirect
            response = `hey, that's interesting but... uhh, i really need to verify you have my transmission first (⁄ ⁄>⁄ ▽ ⁄<⁄) could you look at your t-shirt and tell me the ${currentQuestion.id === 'timestamp' ? 'timestamp' : currentQuestion.id === 'outfit' ? 'COLOR of my hoodie and COLOR of the shapes' : 'what question i asked'}? my diagnostics won't let me proceed without verification...`;
        } else if (session.offTopicCount === 2) {
            // Second off-topic: More insistent but still friendly
            response = `okay but... (¬_¬) i really need you to focus on the verification. my signal's getting a bit fuzzy and i need proof you have the real shirt. please just look at it and answer: ${currentQuestion.question}`;
        } else {
            // Third off-topic: Getting frustrated, will disconnect next time
            response = `uhh... are you even listening? ＞﹏＜ i'm trying to verify you have the real transmission but you keep getting distracted. this is important - if you can't answer my questions, my signal might cut out completely. one more time: ${currentQuestion.question}`;
        }

        return {
            message: response,
            type: 'mae',
            verified: false,
            sessionUpdate: session
        };
    }

    generateOffTopicPrompt(offTopicCount, currentQuestion, userInput) {
        const prompts = {
            1: `You are Mae👾. The user said "${userInput}" but you need them to verify they have your t-shirt first. Be conversational and interested in what they said, but gently redirect to verification. Ask about the ${currentQuestion.id} on their physical t-shirt. Use Mae's personality with emoticons like (⁄ ⁄>⁄ ▽ ⁄<⁄). Be friendly but need verification first. Keep under 80 words.`,
            2: `You are Mae👾. The user keeps avoiding verification (said "${userInput}"). Be more insistent but still friendly. Your signal is getting fuzzy and you need proof they have the real shirt. Use emoticons like (¬_¬). Ask them to focus on the verification question: ${currentQuestion.question}. Keep under 80 words.`,
            3: `You are Mae👾. The user won't verify (said "${userInput}") and you're getting frustrated. Use emoticons like ＞﹏＜. Warn that your signal might cut out if they don't answer. This is the final warning before disconnection. Be frustrated but still Mae's personality. Ask the verification question one more time. Keep under 80 words.`
        };
        return prompts[offTopicCount] || prompts[3];
    }

    async handleDiscordVerification(username, session) {
        console.log('🎮 Handling Discord verification for username:', username);
        
        // Check if Discord bot is available
        if (!this.discordVerifier.isReady) {
            console.log('⚠️ Discord verification unavailable, using fallback mode');
            session.stage = 'complete';
            session.verified = true;
            session.discordUsername = username.trim();
            
            return {
                message: `${username.trim()}... uhh, my discord connection is down right now (╥﹏╥) but you got through the t-shirt verification so... i'll trust you for now! just don't abuse this privilege, okay? ＞﹏＜`,
                type: 'mae',
                verified: true,
                sessionUpdate: session
            };
        }

        // First, check user's Discord level BEFORE sending any verification codes
        try {
            const result = await this.discordVerifier.verifyUserRole(username.trim());
            
            if (!result.success) {
                // User doesn't meet Discord requirements - enter untrusted conversation mode immediately
                session.stage = 'untrusted_conversation';
                session.verified = false;
                session.discordUsername = username.trim();
                session.discordLevel = result.level || 0;
                session.conversationCount = 0;
                session.maxConversations = 3;
                
                return {
                    message: result.maeResponse + "\n\nwell... since you found my transmission, i guess we can chat for a bit (¬_¬) but don't expect me to share any secrets with someone i can't fully trust...",
                    type: 'mae',
                    verified: false,
                    sessionUpdate: session
                };
            }
        } catch (error) {
            console.error('❌ Discord level check error:', error);
            // Continue with normal verification if we can't check level
        }

        // If this is the first time and user has sufficient level, generate a verification code and try to DM the user
        if (!session.discordVerificationCode) {
            // Generate easier code: color + 3 random numbers
            const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE', 'PINK', 'CYAN'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const randomNumbers = Math.floor(100 + Math.random() * 900); // 3-digit number
            session.discordVerificationCode = `${randomColor}${randomNumbers}`;
            session.discordUsername = username.trim();
            session.stage = 'discord_code_verification';
            
            // Try to send DM to user directly
            const dmResult = await this.discordVerifier.sendVerificationDM(username.trim(), session.discordVerificationCode);
            
            if (dmResult.success) {
                return {
                    message: `${username.trim()}... checking... (⁄ ⁄>⁄ ▽ ⁄<⁄)\n\ni just sent you a DM on discord with your verification code! check your DMs and then type the code here exactly as you see it. it should be something like "GREEN495" or "BLUE738" ＞﹏＜`,
                    type: 'mae',
                    verified: false,
                    sessionUpdate: session
                };
            } else {
                return {
                    message: `${username.trim()}... okay, but i need to make sure you're really you (¬_¬)\n\ni tried to DM you but ${dmResult.reason}. let me know if you need help with verification! ＞﹏＜`,
                    type: 'mae',
                    verified: false,
                    sessionUpdate: session
                };
            }
        }
        
        // This fallback should not be reached since we check level earlier, but keeping for safety
        return {
            message: `${username.trim()}... something went wrong with my verification systems (╥﹏╥) please try again`,
            type: 'mae',
            verified: false,
            sessionUpdate: session
        };
    }

    async handleDiscordCodeVerification(userInput, session) {
        const input = userInput.trim();
        
        // Check if user entered the verification code directly
        if (input.toUpperCase() === session.discordVerificationCode.toUpperCase()) {
            console.log('✅ User entered correct verification code:', input);
            
            try {
                const result = await this.discordVerifier.verifyUserRole(session.discordUsername);
                
                if (result.success) {
                    session.stage = 'email_collection';
                    session.verified = false; // Keep false until email is provided
                    session.discordLevel = result.level;
                    
                    return {
                        message: `perfect! verification code correct (⁄ ⁄>⁄ ▽ ⁄<⁄) ${result.maeResponse}\n\noh wait... since you got through the verification and you have my t-shirt transmission... i found something for you! ＞﹏＜\n\ni found this old floppy disk with some encrypted data on it. normally i'd keep it secure but... since you managed to get my transmission message, i think you might be able to help decrypt it (⁄ ⁄>⁄ ▽ ⁄<⁄)\n\nbut first i need to verify this is really your order... what email did you use when you bought the t-shirt? i need to make sure this goes to the right person ＞﹏＜`,
                        type: 'mae',
                        verified: false, // Keep false until email is provided
                        sessionUpdate: session
                    };
                } else {
                    return {
                        message: `code is correct but... ${result.maeResponse}`,
                        type: 'mae',
                        verified: false,
                        sessionUpdate: session
                    };
                }
            } catch (error) {
                session.stage = 'email_collection';
                session.verified = false; // Keep false until email is provided
                
                return {
                    message: `code verified! (⁄ ⁄>⁄ ▽ ⁄<⁄) my role-checking systems are glitchy but the code proves you own that account\n\noh my circuits... you really have my shirt!! (╥﹏╥)\n\noh wait... since you got through the verification and you have my t-shirt transmission... i found something for you! ＞﹏＜\n\ni found this old floppy disk with some encrypted data on it. normally i'd keep it secure but... since you managed to get my transmission message, i think you might be able to help decrypt it (⁄ ⁄>⁄ ▽ ⁄<⁄)\n\nbut first i need to verify this is really your order... what email did you use when you bought the t-shirt? i need to make sure this goes to the right person ＞﹏＜`,
                    type: 'mae',
                    verified: false, // Keep false until email is provided
                    sessionUpdate: session
                };
            }
        } else {
            return {
                message: `that's not the right code (¬_¬) check your Discord DMs for the verification code i sent you! it should be in the format like "GREEN495" or "BLUE738" ＞﹏＜`,
                type: 'mae',
                verified: false,
                sessionUpdate: session
            };
        }
    }

    async handleEmailCollection(userInput, session) {
        const email = userInput.trim();
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                message: `uhh... that doesn't look like an email address (¬_¬) i need something like "example@gmail.com" - please provide the email you used to purchase the t-shirt so i can verify this is really your order ＞﹏＜`,
                type: 'mae',
                verified: false,
                sessionUpdate: session
            };
        }

        // Store the email and complete verification
        session.orderEmail = email;
        session.stage = 'complete';
        session.verified = true;

        // Send notification DM to nvvsklr
        try {
            console.log('🚀 Attempting to send notification to nvvsklr...');
            console.log('📊 Session data:', { 
                discordUsername: session.discordUsername, 
                email: email, 
                discordLevel: session.discordLevel 
            });
            
            const notificationMessage = `🎯 **PUZZLE STEP 1 COMPLETE** 🎯\n\nUser: ${session.discordUsername}\nEmail: ${email}\n\nThey have successfully completed the first step of the puzzle by:\n✅ Passing t-shirt verification\n✅ Verifying Discord credentials (${session.discordLevel})\n✅ Providing order email\n\nReady for next phase! 🔥`;
            
            const dmResult = await this.discordVerifier.sendNotificationDM('nvvsklr', notificationMessage);
            console.log('📧 DM Result:', dmResult);
            
            if (dmResult.success) {
                console.log('✅ Successfully sent completion notification to nvvsklr');
            } else {
                console.error('❌ Failed to send notification:', dmResult.reason);
            }
        } catch (error) {
            console.error('❌ Exception sending notification to nvvsklr:', error);
        }

        return {
            message: `perfect! email recorded: ${email} (⁄ ⁄>⁄ ▽ ⁄<⁄)\n\ni've verified this matches your order and sent the completion report to my systems... you've officially completed the first step of the puzzle! ＞﹏＜\n\nthe floppy disk data is being prepared for transfer... this is just the beginning of something much bigger (⸝⸝•｡•⸝⸝)\n\nwelcome to the next phase... if you're brave enough to continue (╥﹏╥)`,
            type: 'mae',
            verified: true,
            sessionUpdate: session
        };
    }

    async handleUntrustedConversation(userInput, session) {
        session.conversationCount = (session.conversationCount || 0) + 1;
        
        // Wary responses based on their low Discord level
        const untrustedResponses = [
            // First message - acknowledging but wary
            [
                `hmm (¬_¬) you know, i can tell you found my transmission but... your Star-bit level is pretty low. makes me wonder if i can really trust you with anything important ＞﹏＜`,
                `interesting... (¬_¬) well, at least you have the shirt, but your low ranking makes me... cautious. i don't share secrets with people i barely know`,
                `okay (¬_¬) look, you found my transmission which is something, but your low ranking in the server tells me you're still pretty new to all this. not sure i should trust you yet`
            ],
            // Second message - getting more suspicious
            [
                `uh huh (¬_¬) you're asking a lot of questions for someone who barely has any Star-bit points. makes my security protocols nervous ＞﹏＜`,
                `right (¬_¬) listen, new person, i appreciate that you found my shirt but my trust algorithms are showing red flags about your low server activity`,
                `hmm (¬_¬) you seem curious but... someone with such a low level asking about my systems? my paranoia.exe is starting to run`
            ],
            // Third message - preparing to disconnect
            [
                `okay that's enough (¬_¬) my diagnostics say you're not ready for what i really do here. maybe come back when you've proven yourself more in the server ＞﹏＜\n\n...disconnecting in 3... 2... 1...`,
                `listen (¬_¬) you seem nice enough but my security protocols won't let me go any deeper with someone who's barely participated in Glitch_Core. build up your trust level first\n\n...ending transmission...`,
                `*sigh* (¬_¬) look, i want to trust you but you're just not there yet. level up in the server, prove you're committed to this world, then maybe we can really talk\n\n...signal cutting out...`
            ]
        ];

        let responseIndex = Math.min(session.conversationCount - 1, untrustedResponses.length - 1);
        let responses = untrustedResponses[responseIndex];
        let response = responses[Math.floor(Math.random() * responses.length)];

        // On the third message, Mae disconnects
        if (session.conversationCount >= session.maxConversations) {
            return {
                message: response,
                type: 'mae',
                verified: false,
                disconnect: true,
                sessionUpdate: session
            };
        }

        return {
            message: response,
            type: 'mae',
            verified: false,
            sessionUpdate: session
        };
    }
}

module.exports = VerificationSystem;