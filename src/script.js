// ----------------------------- UI Toggles -----------------------------
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');

// Custom Notification
const customNotification = document.getElementById('custom-notification');
let notificationTimeout;

function showCustomNotification(message, type = 'success', duration = 3000) {
    clearTimeout(notificationTimeout);
    customNotification.textContent = message;
    customNotification.className = `custom-notification show ${type}`;
    customNotification.style.display = 'block';

    notificationTimeout = setTimeout(() => {
        customNotification.classList.remove('show');
        customNotification.style.display = 'none';
    }, duration);
}

// Toggle forms
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'flex';
});

// ----------------------------- Simulated Authentication -----------------------------
const USERS_KEY = 'codewithme_users';
let currentUser = null;

function getUsers() {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : {};
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        currentUser = loggedInUser;
        authContainer.style.display = 'none';
        appContainer.style.display = 'flex';
        showCustomNotification(`Welcome back, ${currentUser}!`, 'success');
    } else {
        authContainer.style.display = 'flex';
        appContainer.style.display = 'none';
    }
}

// Register
document.getElementById('register').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!username || !password || !confirmPassword) {
        showCustomNotification('All fields are required.', 'error');
        return;
    }
    if (password !== confirmPassword) {
        showCustomNotification('Passwords do not match!', 'error');
        return;
    }
    let users = getUsers();
    if (users[username]) {
        showCustomNotification('Username already exists.', 'error');
        return;
    }
    users[username] = password;
    saveUsers(users);
    showCustomNotification('Registration successful! You can now log in.', 'success');
    document.getElementById('register').reset();
    registerForm.style.display = 'none';
    loginForm.style.display = 'flex';
});

// Login
document.getElementById('login').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (!username || !password) {
        showCustomNotification('Please enter username and password.', 'error');
        return;
    }
    const users = getUsers();
    if (users[username] && users[username] === password) {
        currentUser = username;
        localStorage.setItem('loggedInUser', username);
        authContainer.style.display = 'none';
        appContainer.style.display = 'flex';
        showCustomNotification(`Logged in as ${username}!`, 'success');
        document.getElementById('login').reset();
    } else {
        showCustomNotification('Invalid username or password.', 'error');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    currentUser = null;
    appContainer.style.display = 'none';
    authContainer.style.display = 'flex';
    showCustomNotification('You have been logged out.', 'success');
});

checkLoginStatus();

// ----------------------------- Code Editor -----------------------------
const codeArea = document.getElementById('code-area');
const languageSelect = document.getElementById('language');
const runCodeBtn = document.getElementById('run-code');
const outputFrame = document.getElementById('output-frame');
const consoleOutputDiv = document.getElementById('console-output');
const shareCodeBtn = document.getElementById('share-code');

// Default snippets
const defaultSnippets = {
    javascript: '// Write JavaScript code\nconsole.log("Hello, World!");\n\n// Try DOM manipulation:\ndocument.body.style.background = "#0a0a0a";\ndocument.body.innerHTML += "<p>JS is live!</p>";',
    html: '<h1>Your HTML Code</h1>\n<p>Edit me and click Run!</p>\n<button onclick="alert(\'Clicked!\')">Click me</button>',
    css: 'body {\n    background: #111;\n    color: #0f0;\n    font-family: monospace;\n}\nh1 {\n    text-shadow: 0 0 5px #0f0;\n}\nbutton {\n    border: 2px solid #0f0;\n    background: black;\n    color: #0f0;\n}',
    python: 'print("Hello from Python!")\n\n# Simple loop\nfor i in range(5):\n    print(f"Number {i}")'
};

// Set initial snippet based on selected language
function setDefaultSnippet() {
    const lang = languageSelect.value;
    codeArea.value = defaultSnippets[lang] || defaultSnippets.javascript;
}
languageSelect.addEventListener('change', setDefaultSnippet);
setDefaultSnippet();

// Append console messages
function appendToConsole(message, type = 'info') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-${type}`;
    logEntry.textContent = message;
    consoleOutputDiv.appendChild(logEntry);
    consoleOutputDiv.scrollTop = consoleOutputDiv.scrollHeight;
}
window.appendToConsole = appendToConsole;

// Execute code inside iframe
runCodeBtn.addEventListener('click', () => {
    const code = codeArea.value;
    const language = languageSelect.value;
    consoleOutputDiv.innerHTML = '';
    outputFrame.srcdoc = '';

    // Construct iframe content
    let iframeHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">`;
    
    // Always include basic styling and console override
    iframeHtml += `<style>
        body { background-color: black; color: #00FF41; font-family: 'Share Tech Mono', monospace; margin: 0; padding: 12px; }
        #rendered-content { margin-bottom: 20px; }
    </style>`;
    
    // Inject Brython only if Python is selected
    if (language === 'python') {
        iframeHtml += `<script src="https://cdn.jsdelivr.net/npm/brython@3.12.2/brython.min.js"></script>
                       <script src="https://cdn.jsdelivr.net/npm/brython@3.12.2/brython_stdlib.js"></script>`;
    }
    
    iframeHtml += `<script>
        const originalConsole = { ...console };
        ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
            console[method] = (...args) => {
                const message = args.map(arg => {
                    if (typeof arg === 'object' && arg !== null) {
                        try { return JSON.stringify(arg, null, 2); } catch(e) { return String(arg); }
                    }
                    return String(arg);
                }).join(' ');
                if (window.parent && window.parent.appendToConsole) {
                    window.parent.appendToConsole(message, method);
                }
                originalConsole[method](...args);
            };
        });
        window.onerror = function(msg, src, line) {
            if (window.parent && window.parent.appendToConsole) {
                window.parent.appendToConsole(\`Uncaught Error: \${msg} (Line: \${line})\`, 'error');
            }
            return true;
        };
    </script>`;
    
    let renderedContent = '';
    let styleToApply = '';
    let scriptToExecute = '';
    
    if (language === 'html') {
        renderedContent = code;
    } else if (language === 'css') {
        styleToApply = code;
        renderedContent = `<h1>CSS Preview</h1><p>Your CSS styles the page.</p><button>Styled Button</button>`;
    } else if (language === 'javascript') {
        scriptToExecute = code;
        renderedContent = `<h1>JavaScript Playground</h1><p id="demo">Watch console or click below</p><button onclick="document.getElementById('demo').innerText='Clicked!'; console.log('Button clicked')">Test</button>`;
    } else if (language === 'python') {
        // Python code will be inside a <script type="text/python"> tag
        renderedContent = `<div id="python-output" style="background:#001a0a; padding:10px; border-left:3px solid #0f0;"></div>
        <script type="text/python">
import sys
from browser import document, window

class ConsoleOutput:
    def write(self, s):
        document["python-output"].innerHTML += s.replace("\\n", "<br>")
        if window.parent and window.parent.appendToConsole:
            window.parent.appendToConsole(s.strip(), "log")
    def flush(self): pass

sys.stdout = ConsoleOutput()
sys.stderr = ConsoleOutput()

# User code
try:
    ${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}
except Exception as e:
    print(f"Error: {e}")
        </script>`;
        // Brython will be initialized after the iframe loads
        scriptToExecute = `if (typeof brython !== 'undefined') brython();`;
    }
    
    iframeHtml += `<style>${styleToApply}</style>`;
    iframeHtml += `<body><div id="rendered-content">${renderedContent}</div>`;
    if (scriptToExecute) iframeHtml += `<script>${scriptToExecute}<\/script>`;
    iframeHtml += `</body></html>`;
    
    outputFrame.srcdoc = iframeHtml;
});

// Share code button: copy current code to clipboard
shareCodeBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(codeArea.value);
        showCustomNotification('Code copied to clipboard! Share with your team.', 'success', 2000);
    } catch (err) {
        showCustomNotification('Failed to copy code.', 'error');
    }
});

// ----------------------------- Chat Simulation -----------------------------
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message');
const chatMessages = document.getElementById('chat-messages');

sendMessageBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        appendMessage(currentUser || 'You', message, 'user');
        messageInput.value = '';
        setTimeout(() => {
            appendMessage('AI Collaborator', `Echo: ${message}`, 'other');
        }, 800);
    }
});
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessageBtn.click();
});

function appendMessage(sender, text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', type);
    msgDiv.innerHTML = `<strong>${escapeHtml(sender)}:</strong> ${escapeHtml(text)}`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ----------------------------- Matrix Rain Effect -----------------------------
const matrixRainContainer = document.querySelector('.matrix-rain');
const matrixBackgroundContainer = document.querySelector('.matrix-background');
const chars = "01アイウエオABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()";

let activeStreams = [];

function createMatrixStream() {
    const column = document.createElement('div');
    column.className = 'matrix-column';
    const leftPos = Math.random() * window.innerWidth;
    column.style.left = `${leftPos}px`;
    const charCount = 12 + Math.floor(Math.random() * 10);
    let content = [];
    for (let i = 0; i < charCount; i++) {
        content.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    column.innerHTML = content.join('<br>');
    const duration = 2 + Math.random() * 3;
    column.style.animationDuration = `${duration}s`;
    matrixRainContainer.appendChild(column);
    column.addEventListener('animationend', () => {
        column.remove();
        activeStreams = activeStreams.filter(c => c !== column);
        createMatrixStream();
    });
    activeStreams.push(column);
}

function initMatrixRain() {
    matrixRainContainer.innerHTML = '';
    activeStreams = [];
    const streamCount = Math.max(20, Math.floor(window.innerWidth / 35));
    for (let i = 0; i < streamCount; i++) {
        setTimeout(createMatrixStream, Math.random() * 2000);
    }
}

// Falling numbers
let fallingInterval;
function startFallingNumbers() {
    if (fallingInterval) clearInterval(fallingInterval);
    fallingInterval = setInterval(() => {
        const number = document.createElement('div');
        number.className = 'falling-number';
        number.textContent = Math.floor(Math.random() * 10);
        number.style.left = Math.random() * 100 + 'vw';
        number.style.animationDuration = Math.random() * 3 + 2 + 's';
        matrixBackgroundContainer.appendChild(number);
        number.addEventListener('animationend', () => number.remove());
    }, 180);
}

// Handle resize (debounced)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        initMatrixRain();
    }, 200);
});

// Initialize both effects
initMatrixRain();
startFallingNumbers();

// Small cleanup on page unload (optional)
window.addEventListener('beforeunload', () => {
    if (fallingInterval) clearInterval(fallingInterval);
});
