const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const MaeAI = require('./src/mae-ai-simple');
const VerificationSystem = require('./src/verification');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.split(',')) || [
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "http://10.0.0.103:3001",
      // Railway domains
      /^https:\/\/.*\.railway\.app$/,
      // Railway preview domains
      /^https:\/\/.*\.up\.railway\.app$/,
      // Allow any device on local network (10.0.0.x)
      /^http:\/\/10\.0\.0\.\d+:3001$/,
      // Allow any device on common router networks
      /^http:\/\/192\.168\.\d+\.\d+:3001$/,
      /^http:\/\/172\.16\.\d+\.\d+:3001$/
    ],
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100,
  duration: 900
});

// Security middleware
// Disable CSP entirely for Safari compatibility
app.use((req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const isSafari = userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1;
  
  if (isSafari) {
    // Skip helmet entirely for Safari
    next();
  } else {
    // Use basic helmet for other browsers
    helmet({
      contentSecurityPolicy: false // Disable CSP completely
    })(req, res, next);
  }
});

app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.split(',')) || [
    "http://localhost:3001",
    "http://127.0.0.1:3001", 
    "http://10.0.0.103:3001",
    // Railway domains
    /^https:\/\/.*\.railway\.app$/,
    // Railway preview domains
    /^https:\/\/.*\.up\.railway\.app$/,
    // Allow any device on local networks
    /^http:\/\/10\.0\.0\.\d+:3001$/,
    /^http:\/\/192\.168\.\d+\.\d+:3001$/,
    /^http:\/\/172\.16\.\d+\.\d+:3001$/
  ],
  credentials: true
}));
// Serve static files with proper MIME types
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Initialize Mae AI and Verification System
const maeAI = new MaeAI();
const verification = new VerificationSystem(maeAI);

// Store active sessions
const sessions = new Map();

// Explicit routes for static files with Safari compatibility
app.get('/styles.css', (req, res) => {
  console.log(`CSS requested from: ${req.get('host')} - User-Agent: ${req.get('User-Agent')}`);
  res.setHeader('Content-Type', 'text/css; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.sendFile(path.join(__dirname, 'public', 'styles.css'));
});

app.get('/script.js', (req, res) => {
  console.log(`JS requested from: ${req.get('host')} - User-Agent: ${req.get('User-Agent')}`);
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.sendFile(path.join(__dirname, 'public', 'script.js'));
});

// Serve the main page
app.get('/', (req, res) => {
  console.log(`Main page requested from: ${req.get('host')}`);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io connection handling
io.on('connection', async (socket) => {
  console.log('New connection:', socket.id);
  
  // Initialize session with consistent ID usage
  const sessionId = uuidv4();
  const session = {
    id: sessionId,
    socketId: socket.id,
    stage: 'initial',
    verified: false,
    currentQuestion: 0,
    verificationAttempts: 0,
    connectedAt: Date.now()
  };
  
  // Store session by socket ID for server management, but use sessionId for conversation history
  sessions.set(socket.id, session);
  console.log('🆔 Created session with ID:', sessionId, 'for socket:', socket.id);
  
  // Send welcome message
  socket.emit('mae-response', {
    message: "Connection established... I can sense your presence in the digital realm. Are you the one who received my transmission?",
    type: 'mae',
    delay: 1000
  });

  // Handle user messages
  socket.on('user-message', async (data) => {
    const session = sessions.get(socket.id);
    if (!session) return;

    try {
      let response;
      
      if (!session.verified) {
        // Handle verification process
        response = await verification.handleVerification(data.message, session);
        
        if (response.verified) {
          session.verified = true;
          session.stage = 'conversation';
        }
      } else {
        // Handle normal conversation with Mae
        console.log('💬 Handling post-verification conversation for session:', session.id);
        const maeResponse = await maeAI.getMaeResponse(data.message, session);
        
        // Check if Mae wants to disconnect
        if (typeof maeResponse === 'object' && maeResponse.disconnect) {
          response = {
            message: maeResponse.message,
            type: 'mae',
            disconnect: true
          };
          console.log('🔌 Mae is disconnecting user:', session.id);
        } else {
          response = {
            message: maeResponse,
            type: 'mae'
          };
        }
      }

      // Update session
      sessions.set(socket.id, { ...session, ...response.sessionUpdate });

      // Show typing indicator before response
      socket.emit('mae-typing', { typing: true });
      
      // Simulate Mae thinking time (800ms to 2000ms)
      const typingDelay = Math.random() * 1200 + 800;
      
      setTimeout(() => {
        socket.emit('mae-typing', { typing: false });
        socket.emit('mae-response', response);
      }, typingDelay);

    } catch (error) {
      console.error('Message handling error:', error);
      socket.emit('mae-typing', { typing: false });
      socket.emit('mae-response', {
        message: "Connection unstable... please try again.",
        type: 'error'
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
    sessions.delete(socket.id);
  });
});

// Cleanup old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [socketId, session] of sessions.entries()) {
    if (now - session.connectedAt > 30 * 60 * 1000) { // 30 minutes
      sessions.delete(socketId);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mae Terminal Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  
  if (NODE_ENV === 'development') {
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Network access: http://10.0.0.103:${PORT}`);
  } else {
    console.log(`Production server ready on Railway`);
    console.log(`Public URL: https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'your-app.railway.app'}`);
  }
});