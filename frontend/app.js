// const chatMessages = document.getElementById('chatMessages');
// const userInput = document.getElementById('userInput');
// const sendBtn = document.getElementById('sendBtn');

// // Update this to your backend URL
// const BACKEND_URL = 'http://localhost:8000/chat';

// async function sendMessageToBackend(message) {
//     try {
//         const response = await fetch(BACKEND_URL, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ message })
//         });
        
//         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
//         return await response.json();
//     } catch (error) {
//         console.error('API Error:', error);
//         return { response: "Failed to connect to policy server. Please try again." };
//     }
// }

// async function handleUserInput() {
//     const question = userInput.value.trim();
//     if (!question) return;

//     addMessage(question, true);
//     userInput.value = '';
//     userInput.disabled = true;
//     sendBtn.disabled = true;

//     const loadingDiv = addMessage("🔍 Searching company policies...", false);

//     try {
//         const data = await sendMessageToBackend(question);
//         chatMessages.removeChild(loadingDiv);
//         addMessage(data.response, false);
//     } catch (error) {
//         chatMessages.removeChild(loadingDiv);
//         addMessage("⚠️ Error: Could not connect to HR policy database", false);
//     }

//     userInput.disabled = false;
//     sendBtn.disabled = false;
//     userInput.focus();
// } 

// function addMessage(text, isUser) {
//     const div = document.createElement('div');
//     div.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
//     div.textContent = text;
//     chatMessages.appendChild(div);
//     chatMessages.scrollTop = chatMessages.scrollHeight;
//     return div;
// }

// // Event listeners
// sendBtn.addEventListener('click', handleUserInput);
// userInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleUserInput());

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDXy5K5vYNOmItBUQCxg0yS-v214oZ1OIw",
    authDomain: "raapid-ddb0e.firebaseapp.com",
    projectId: "raapid-ddb0e",
    storageBucket: "raapid-ddb0e.firebasestorage.app",
    messagingSenderId: "597106774566",
    appId: "1:597106774566:web:e3096b04d538274afccce7",
    measurementId: "G-5KL9YFVN3J"
  };

  
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM elements
const loginContainer = document.getElementById('login-container');
const loginCard = document.querySelector('.login-card');
const chatContainer = document.getElementById('chat-container');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// Backend URL
const BACKEND_URL = 'http://localhost:8000/chat';

// Check auth state
auth.onAuthStateChanged((user) => {
    if (user) {
        // Check if email is from raapidinc.com
        if (user.email && user.email.endsWith('@raapidinc.com')) {
            // Hide login with animation
            loginContainer.classList.add('hidden');
            loginCard.classList.add('hidden');
            
            // Show chat after animation completes
            setTimeout(() => {
                loginContainer.style.display = 'none';
                chatContainer.classList.add('visible');
            }, 300);
            
            // Display welcome message
            displayWelcomeMessage(user);
        } else {
            auth.signOut();
            alert('Only @raapidinc.com emails are allowed to access this application.');
        }
    } else {
        loginContainer.style.display = 'flex';
        loginContainer.classList.remove('hidden');
        loginCard.classList.remove('hidden');
        chatContainer.classList.remove('visible');
    }
});

// Google Sign In
googleSignInBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            console.log("Signed in user:", result.user);
        })
        .catch((error) => {
            console.error("Error details:", error);
            alert("Sign in failed. Error: " + error.message);
        });
});

// Sign Out
signOutBtn.addEventListener('click', () => {
    auth.signOut();
});

// // Display welcome message
// function displayWelcomeMessage(user) {
//     const welcomeDiv = document.createElement('div');
//     welcomeDiv.className = 'welcome-message';
//     welcomeDiv.innerHTML = `
//         <div class="bot-message welcome-bubble">
//             <div class="typing-indicator">
//                 <span></span>
//                 <span></span>
//                 <span></span>
//             </div>
//             <p class="message-content">Welcome back, ${user.displayName || 'employee'}! I'm Layla, your HR policy assistant. How can I help you today?</p>
//         </div>
//     `;
//     chatMessages.appendChild(welcomeDiv);
//     chatMessages.scrollTop = chatMessages.scrollHeight;
// }

// Chat functionality
async function sendMessageToBackend(message, idToken) {
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { response: "Failed to connect to policy server. Please try again." };
    }
}

async function handleUserInput() {
    const question = userInput.value.trim();
    if (!question) return;

    addMessage(question, true);
    userInput.value = '';
    userInput.disabled = true;
    sendBtn.disabled = true;

    // Show typing indicator
    const loadingDiv = addTypingIndicator();
    
    try {
        const idToken = await auth.currentUser.getIdToken();
        const data = await sendMessageToBackend(question, idToken);
        chatMessages.removeChild(loadingDiv);
        addMessage(data.response, false);
    } catch (error) {
        chatMessages.removeChild(loadingDiv);
        addMessage("⚠️ Error: Could not connect to HR policy database", false);
    }

    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
}

function addMessage(text, isUser) {
    const div = document.createElement('div');
    div.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
}

function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'message bot-message';
    div.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
}

// Event listeners
sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleUserInput());

// Smooth scroll to bottom when new messages arrive
const observer = new MutationObserver(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
observer.observe(chatMessages, { childList: true });