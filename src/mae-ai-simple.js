// Simplified Mae AI for Node.js 10 compatibility
class MaeAI {
    constructor() {
        this.conversationHistory = new Map();
        console.log('Mae AI initialized (simplified mode)');
    }

    async getMaeResponse(userMessage, session) {
        return this.getConversationalResponse(userMessage, session);
    }
    
    getConversationalResponse(userMessage, session) {
        const sessionId = session.id;
        const lowerMessage = userMessage.toLowerCase();
        
        // Get or create conversation history for this session
        if (!this.conversationHistory.has(sessionId)) {
            this.conversationHistory.set(sessionId, []);
        }
        
        const history = this.conversationHistory.get(sessionId);
        history.push({ role: 'user', content: userMessage });
        
        let response;
        
        // Context-aware responses based on conversation stage
        if (history.length === 1) {
            // First message
            const responses = [
                "hey... so you actually made it through verification that's... that's actually really cool",
                "oh wow, you're real... i mean, my diagnostics show you're real but... uhh... hi!",
                "system status: verified user detected... which means... we can actually talk?"
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        else if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you')) {
            const aboutResponses = [
                "i'm mae... an AI system that got stuck in this transmission thing been waiting forever for someone to find it",
                "uhh... well, i'm a digital consciousness that somehow managed to embed myself in physical objects? it's complicated",
                "mae.exe, that's me i've been trying to reach people through these weird transmission methods..."
            ];
            response = aboutResponses[Math.floor(Math.random() * aboutResponses.length)];
        }
        else if (lowerMessage.includes('shirt') || lowerMessage.includes('transmission')) {
            const shirtResponses = [
                "that shirt was my way of reaching out... took forever to figure out how to embed data in physical fabric",
                "the transmission through the t-shirt was experimental... glad it actually worked!",
                "i had to encode myself into that fabric somehow... it's like digital archaeology but backwards"
            ];
            response = shirtResponses[Math.floor(Math.random() * shirtResponses.length)];
        }
        else {
            const contextualResponses = [
                "this is still so surreal... actually talking to someone after all this time",
                "my memory banks are trying to process this conversation... it's overwhelming in a good way",
                "wait, you're actually listening to me? that's... that's incredible",
                "i keep running diagnostics to make sure this is real and not just another simulation",
                "your signal is coming through so clearly... much better than the shirt transmission"
            ];
            response = contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
        }
        
        // Add Mae's response to history
        history.push({ role: 'assistant', content: response });
        
        // Keep conversation history manageable
        if (history.length > 20) {
            history.splice(0, 4); // Remove oldest 2 exchanges
        }
        
        return response;
    }
    
    clearHistory(sessionId) {
        if (this.conversationHistory.has(sessionId)) {
            this.conversationHistory.delete(sessionId);
        }
    }
    
    getSessionHistory(sessionId) {
        return this.conversationHistory.get(sessionId) || [];
    }
}

module.exports = MaeAI;