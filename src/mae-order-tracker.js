// Riri AI for Order Tracking System
class RiriOrderTracker {
    constructor(database) {
        this.db = database;
        this.conversationHistory = new Map();
        this.pendingSockets = new Map(); // Track sockets waiting for search results
        
        // Fallback data when database is not available
        this.fallbackOrders = new Map([
            ['test@example.com', { 
                email: 'test@example.com', 
                tracking_url: 'https://www.fedex.com/fedextrack/?tracknum=NEW987654321', 
                order_number: 'ORD-004',
                order_date: '2024-11-24' // Most recent
            }],
            ['user@demo.com', { 
                email: 'user@demo.com', 
                tracking_url: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=9400108205496461555616', 
                order_number: 'ORD-002',
                order_date: '2024-11-22'
            }],
            ['customer@test.com', { 
                email: 'customer@test.com', 
                tracking_url: 'https://www.dhl.com/en/express/tracking.html?AWB=1122334455', 
                order_number: 'ORD-005',
                order_date: '2024-11-23' // Most recent
            }]
        ]);
        
        console.log('Riri Order Tracker initialized');
    }

    async getRiriResponse(userMessage, session, socket = null) {
        console.log('💬 Riri Order Tracker processing message');
        
        // Store socket reference for this session if provided
        if (socket) {
            this.pendingSockets.set(session.id, socket);
        }
        
        return this.getOrderTrackingResponse(userMessage, session);
    }

    async getOrderTrackingResponse(userMessage, session) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Get or create conversation history for this session
        if (!this.conversationHistory.has(session.id)) {
            this.conversationHistory.set(session.id, {
                messages: [],
                stage: 'asking_email', // Start directly at asking for email since instructions were shown
                email: null,
                attempts: 0
            });
        }
        
        let history = this.conversationHistory.get(session.id);
        console.log('💬 Current stage:', history.stage, 'attempts:', history.attempts);
        
        let response;
        
        switch (history.stage) {
            case 'asking_email':
                // Look for email in their message (this should be the first user input after instructions)
                const email = this.extractEmail(userMessage);
                if (email) {
                    history.email = email;
                    history.stage = 'searching';
                    response = `got it! checking my records for ${email}... (⸝⸝•｡•⸝⸝) scanning database...`;
                    
                    // Trigger async search
                    this.performAsyncSearch(session.id, email);
                    
                } else {
                    history.attempts++;
                    if (history.attempts < 3) {
                        const retryResponses = [
                            "hmm, that doesn't look like an email address to me... (¬_¬) can you try again? like user@example.com",
                            "uhh... i need a proper email format ＞﹏＜ something like yourname@domain.com",
                            "my email scanner isn't picking that up... try the format: name@company.com (⸝⸝•｡•⸝⸝)"
                        ];
                        response = retryResponses[Math.min(history.attempts - 1, retryResponses.length - 1)];
                    } else {
                        response = "looks like we're having trouble with the email format... (╥﹏╥) maybe try refreshing and starting over?";
                        history.stage = 'error';
                    }
                }
                break;
                
            case 'searching':
                response = "still searching... just a moment (⸝⸝•｡•⸝⸝)";
                break;
                
            case 'found':
                response = "anything else i can help you with? or ready to check your tracking? (๑˃̵ᴗ˂̵)";
                break;
                
            case 'not_found':
                if (lowerMessage.includes('try') || lowerMessage.includes('again') || lowerMessage.includes('different')) {
                    history.stage = 'asking_email';
                    history.attempts = 0;
                    history.email = null;
                    response = "sure! let's try a different email address... what's the email you used for your order? (⁄ ⁄>⁄ ▽ ⁄<⁄)";
                } else {
                    response = "want to try a different email address? or maybe double-check the spelling? (＞﹏＜)";
                }
                break;
                
            case 'redirecting':
                response = "hope that helps with your tracking! (๑˃̵ᴗ˂̵) have a great day!";
                break;
                
            default:
                response = "uhh... something went wrong with my tracking system (╥﹏╥) maybe try refreshing?";
                break;
        }
        
        // Add messages to history
        history.messages.push({ role: 'user', content: userMessage });
        history.messages.push({ role: 'assistant', content: response });
        
        this.conversationHistory.set(session.id, history);
        
        return response;
    }

    async performAsyncSearch(sessionId, email) {
        try {
            // Wait a bit to simulate search time
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const history = this.conversationHistory.get(sessionId);
            const socket = this.pendingSockets.get(sessionId);
            
            if (!history || !socket) {
                console.log('Session or socket not found for async search');
                return;
            }
            
            // Try database first, fallback to local data
            let order = null;
            
            try {
                order = await this.db.findOrderByEmail(email);
            } catch (dbError) {
                console.log('Database lookup failed, using fallback data');
            }
            
            // If database didn't work, use fallback
            if (!order) {
                order = this.fallbackOrders.get(email.toLowerCase());
            }
            
            if (order) {
                // Found order! Update access count if database is available
                try {
                    await this.db.updateAccessCount(email);
                } catch (dbError) {
                    console.log('Could not update access count (database unavailable)');
                }
                
                history.stage = 'found';
                const response = `found it! (๑˃̵ᴗ˂̵) your order ${order.order_number ? '#' + order.order_number : ''} is ready for tracking... redirecting you now...`;
                
                // Send response with redirect
                socket.emit('riri-response', {
                    message: response,
                    type: 'riri',
                    redirect: order.tracking_url
                });
                
                // Update history
                history.messages.push({ role: 'assistant', content: response });
                history.stage = 'redirecting';
                
                console.log('📦 Order found for', email, '- redirecting to:', order.tracking_url);
                
            } else {
                // No order found
                history.stage = 'not_found';
                const response = `hmm... i couldn't find any orders for ${email} (╥﹏╥) maybe try a different email address? or double-check the spelling?`;
                
                socket.emit('riri-response', {
                    message: response,
                    type: 'riri'
                });
                
                // Update history
                history.messages.push({ role: 'assistant', content: response });
                
                console.log('❌ No order found for email:', email);
            }
            
            this.conversationHistory.set(sessionId, history);
            
        } catch (error) {
            console.error('Search error:', error);
            const history = this.conversationHistory.get(sessionId);
            const socket = this.pendingSockets.get(sessionId);
            
            if (history && socket) {
                history.stage = 'error';
                
                const response = "oops... having some technical difficulties with my tracking system (〃ﾟ3ﾟ〃) can you try again in a moment?";
                
                socket.emit('riri-response', {
                    message: response,
                    type: 'riri'
                });
                
                history.messages.push({ role: 'assistant', content: response });
                this.conversationHistory.set(sessionId, history);
            }
        } finally {
            // Clean up socket reference
            this.pendingSockets.delete(sessionId);
        }
    }

    extractEmail(text) {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        const match = text.match(emailRegex);
        return match ? match[0] : null;
    }

    getOrderInfo(session) {
        const history = this.conversationHistory.get(session.id);
        return history ? {
            email: history.email,
            stage: history.stage
        } : null;
    }
}

module.exports = RiriOrderTracker;