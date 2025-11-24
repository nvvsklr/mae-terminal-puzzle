class MaeTerminal {
    constructor() {
        this.socket = io();
        this.messages = document.getElementById('messages');
        this.userInput = document.getElementById('user-input');
        this.cursor = document.getElementById('cursor');
        this.connectionStatus = document.getElementById('connection-status');
        this.isMobile = this.detectMobile();
        
        this.initializeMobileSupport();
        this.initializeEventListeners();
        this.initializeSocketEvents();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    }

    initializeMobileSupport() {
        if (this.isMobile) {
            // Add mobile-specific meta tag if not present
            if (!document.querySelector('meta[name="viewport"]')) {
                const viewport = document.createElement('meta');
                viewport.name = 'viewport';
                viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                document.head.appendChild(viewport);
            }

            // Auto-focus input immediately to show keyboard - like CMD always ready
            setTimeout(() => {
                this.focusInput();
            }, 100);

            // Handle iOS Safari viewport height issues
            this.handleIOSViewport();
            
            // Keep keyboard open and maintain CMD behavior
            document.addEventListener('touchstart', (e) => {
                // Allow normal interaction but keep input focused like real CMD
                setTimeout(() => this.focusInput(), 50);
            });
            
            // Prevent iOS zoom on double-tap while maintaining CMD look
            let lastTouchEnd = 0;
            document.addEventListener('touchend', (e) => {
                const now = Date.now();
                if (now - lastTouchEnd <= 300) {
                    e.preventDefault();
                }
                lastTouchEnd = now;
                // Ensure input stays focused like real CMD terminal
                setTimeout(() => this.focusInput(), 10);
            }, false);
        }
    }

    handleIOSViewport() {
        // Fix iOS Safari viewport height issue
        const setViewportHeight = () => {
            document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        };
        
        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', () => {
            setTimeout(setViewportHeight, 500);
        });
    }

    focusInput() {
        if (this.userInput && !this.userInput.disabled) {
            this.userInput.focus();
            
            // Force keyboard open on iOS
            if (this.isMobile && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                this.userInput.click();
            }
        }
    }

    initializeEventListeners() {
        // Handle user input
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const message = this.userInput.value.trim();
                if (message) {
                    this.sendMessage(message);
                    this.userInput.value = '';
                }
            }
        });

        // Keep input focused - enhanced for mobile
        const focusInput = () => {
            if (!this.userInput.disabled) {
                this.focusInput();
            }
        };

        document.addEventListener('click', focusInput);
        document.addEventListener('touchend', focusInput);

        // Handle window focus
        window.addEventListener('focus', focusInput);

        // Mobile-specific: prevent input blur on scroll
        if (this.isMobile) {
            this.userInput.addEventListener('blur', (e) => {
                // Re-focus after a short delay unless user is interacting with other elements
                setTimeout(() => {
                    if (document.activeElement === document.body && !this.userInput.disabled) {
                        this.focusInput();
                    }
                }, 100);
            });

            // Handle virtual keyboard show/hide
            window.addEventListener('resize', () => {
                setTimeout(() => {
                    this.scrollToBottom();
                }, 300);
            });
        }
    }

    initializeSocketEvents() {
        // Connection status
        this.socket.on('connect', () => {
            this.updateConnectionStatus('connected', 'Connected');
        });

        this.socket.on('disconnect', () => {
            this.updateConnectionStatus('disconnected', 'Disconnected');
        });

        this.socket.on('connect_error', () => {
            this.updateConnectionStatus('error', 'Connection Error');
        });

        // Riri responses
        this.socket.on('riri-response', (data) => {
            this.displayRiriMessage(data);
            
            // Handle redirect for order tracking
            if (data.redirect) {
                setTimeout(() => {
                    this.handleRedirect(data.redirect);
                }, 2000); // Wait 2 seconds after message
            }
            
            // Handle disconnect
            if (data.disconnect) {
                setTimeout(() => {
                    this.handleDisconnect();
                }, 2000); // Wait 2 seconds after final message
            }
        });

        // Riri typing indicator
        this.socket.on('riri-typing', (data) => {
            this.handleTypingIndicator(data.typing);
        });

        // Error handling
        this.socket.on('error', (error) => {
            this.displayMessage('System error occurred', 'error');
        });
    }

    sendMessage(message) {
        // Display user message
        this.displayMessage(`C:\\Users\\User> ${message}`, 'user');
        
        // Send to server
        this.socket.emit('user-message', { message });
    }

    displayMessage(text, type = 'system') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        if (type === 'riri') {
            // Add typing effect for Riri
            this.typeMessage(messageDiv, text);
        } else {
            messageDiv.textContent = text;
        }
        
        this.messages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    displayRiriMessage(data) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${data.type}`;
        
        // Add special effects
        if (data.special === 'glitch') {
            messageDiv.classList.add('glitch');
        }
        
        if (data.effect === 'glow') {
            messageDiv.classList.add('glow');
        }
        
        // Type the message immediately (delay is now handled by server)
        this.typeMessage(messageDiv, data.message);
        
        this.messages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    handleTypingIndicator(isTyping) {
        // Remove existing typing indicator
        const existingIndicator = document.getElementById('typing-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        if (isTyping) {
            // Create typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.id = 'typing-indicator';
            typingDiv.className = 'message riri typing-indicator';
            
            typingDiv.innerHTML = '<span class="typing-dots">Riri is typing...</span>';
            
            this.messages.appendChild(typingDiv);
            this.scrollToBottom();
        }
    }

    typeMessage(element, text) {
        let index = 0;
        const speed = 30; // milliseconds per character
        
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                element.textContent = text.substring(0, index + 1);
                index++;
                this.scrollToBottom();
            } else {
                clearInterval(typeInterval);
            }
        }, speed);
    }



    updateConnectionStatus(status, text) {
        const indicator = this.connectionStatus.querySelector('.status-indicator');
        const statusText = this.connectionStatus.querySelector('.status-text');
        
        indicator.className = `status-indicator ${status}`;
        statusText.textContent = text;
        
        if (status === 'connected') {
            setTimeout(() => {
                this.connectionStatus.style.opacity = '0.7';
            }, 2000);
        } else {
            this.connectionStatus.style.opacity = '1';
        }
    }

    scrollToBottom() {
        const terminal = document.getElementById('terminal');
        terminal.scrollTop = terminal.scrollHeight;
    }

    // Add terminal command simulation
    simulateCommand(command) {
        this.displayMessage(`C:\\Users\\User> ${command}`, 'user');
    }

    // Handle special Mae effects
    addSpecialEffect(type) {
        const terminal = document.getElementById('terminal');
        
        switch(type) {
            case 'glitch':
                terminal.classList.add('glitch');
                setTimeout(() => terminal.classList.remove('glitch'), 300);
                break;
            case 'glow':
                terminal.classList.add('glow');
                setTimeout(() => terminal.classList.remove('glow'), 2000);
                break;
        }
    }

    handleRedirect(url) {
        // Show redirect message
        this.displayMessage('Redirecting to order tracking...', 'system');
        
        // Open tracking URL in the same tab
        setTimeout(() => {
            window.location.href = url;
        }, 2000); // Wait 2 seconds before redirecting
        
        console.log('🌐 Redirecting to:', url);
    }

    handleDisconnect() {
        // Update status to connection lost
        this.updateConnectionStatus('connection-lost', 'Connection Lost');
        
        // Disable input
        this.userInput.disabled = true;
        this.userInput.placeholder = 'Session ended...';
        
        // Add terminal effect
        const terminal = document.getElementById('terminal');
        terminal.classList.add('connection-lost');
        
        console.log('🔌 Session ended');
    }
}

// Initialize terminal when page loads
document.addEventListener('DOMContentLoaded', () => {
    const terminal = new MaeTerminal();
    
    // Global terminal reference for debugging
    window.maeTerminal = terminal;
});