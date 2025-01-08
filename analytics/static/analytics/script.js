const sendChatBtn = document.querySelector("#send-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const deleteButton = document.querySelector(".delete-chat-history");
const typingIndicator = document.querySelector(".typing-indicator");

// Configure marked options
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true,
    tables: true,
    pedantic: false,
    sanitize: false
});

function parseMarkdown(message) {
    // Removes any script tags and adds role to tables
    const sanitized = message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    const withTableRole = sanitized.replace(/<table>/g, '<table role="grid">');
    // Convert to HTML with all markdown features
    return marked.parse(withTableRole).trim();
}

// Create one typing indicator (now "incoming" for consistent styling)
const typingIndicatorHTML = `
    <li class="chat incoming typing-indicator" style="display: none;">
        <span class="material-symbols-outlined">smart_toy</span>
        <div class="typing">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    </li>
`;

// Function to load chat history from localStorage
const loadChatHistory = () => {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    chatbox.innerHTML = ""; // Clear existing content
    
    // Add chat history first
    chatHistory.forEach(chat => {
        const messageElement = createChatLi(chat.message, chat.className);
        chatbox.appendChild(messageElement);
    });
    
    // Add typing indicator last (but hidden)
    chatbox.insertAdjacentHTML('beforeend', typingIndicatorHTML);
};

// Function to create a chat list item (either user or bot)
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    
    if (className === "outgoing") {
        chatLi.innerHTML = `<p>${message}</p>`;
    } else {
        // Sanitize and parse markdown
        const parsedMessage = parseMarkdown(message);
        
        chatLi.innerHTML = `
            <span class="material-symbols-outlined">robot_2</span>
            <div class="rich-message" style="color: white;">${parsedMessage}</div>
        `;
        
        // Initialize syntax highlighting
        requestAnimationFrame(() => {
            chatLi.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        });
    }
    return chatLi;
};

// Save chat history to localStorage
const saveChatHistory = (message, className) => {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    chatHistory.push({ message, className });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
};

// Handle chat message sending and response
const handleChat = () => {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Clear input and add user message
    chatInput.value = "";
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    saveChatHistory(userMessage, "outgoing");

    // Show typing indicator
    const typingIndicator = document.querySelector(".typing-indicator");
    if (typingIndicator) {
        typingIndicator.style.display = "flex";
        chatbox.appendChild(typingIndicator); // Move to end
    }
    chatbox.scrollTop = chatbox.scrollHeight;

    // Send message to server
    const formData = new FormData();
    formData.append("message", userMessage);

    fetch('/chat_with_ai/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
    .then(data => {
        // Hide typing indicator
        typingIndicator.style.display = "none";
        
        if (data?.response_text) {
            const botMessage = data.response_text;
            const messageElement = createChatLi(botMessage, "incoming");
            chatbox.appendChild(messageElement);
            saveChatHistory(botMessage, "incoming");
            
            // Scroll to bottom after content is rendered
            requestAnimationFrame(() => {
                chatbox.scrollTop = chatbox.scrollHeight;
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        typingIndicator.style.display = "none";
        const errorMessage = "Sorry, something went wrong. Please try again.";
        chatbox.appendChild(createChatLi(errorMessage, "incoming"));
        saveChatHistory(errorMessage, "incoming");
        chatbox.scrollTop = chatbox.scrollHeight;
    });
};

// Get CSRF token from cookies (necessary for POST requests in Django)
function getCookie(name) {
    const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return cookieValue ? cookieValue.pop() : '';
}

// Event listener for delete button
deleteButton.addEventListener("click", () => {
    // Clear the chat history in localStorage and in the UI
    localStorage.removeItem("chatHistory");
    chatbox.innerHTML = '';
});

// Event listener for sending a message
sendChatBtn.addEventListener("click", handleChat);
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
});

// Load chat history from localStorage when the page is loaded
loadChatHistory();
