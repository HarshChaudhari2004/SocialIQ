const sendChatBtn = document.querySelector("#send-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const deleteButton = document.querySelector(".delete-chat-history");
const loadingSpinner = document.getElementById("loading-spinner");

// Function to load chat history from localStorage
const loadChatHistory = () => {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    chatbox.innerHTML = "";
    chatHistory.forEach(chat => {
        const messageElement = createChatLi(chat.message, chat.className);
        chatbox.appendChild(messageElement);
    });
};

// Function to create a chat list item (either user or bot)
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" 
        ? `<p>${message}</p>` 
        : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    chatLi.innerHTML = chatContent;
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

    // Append user's message immediately
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    saveChatHistory(userMessage, "outgoing");
    chatInput.value = "";
    
    // Scroll to bottom after user message
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
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data && data.response_text) {
            const botMessage = data.response_text;
            chatbox.appendChild(createChatLi(botMessage, "incoming"));
            saveChatHistory(botMessage, "incoming");
            chatbox.scrollTop = chatbox.scrollHeight;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const errorMessage = "Sorry, something went wrong. Please try again.";
        chatbox.appendChild(createChatLi(errorMessage, "incoming"));
        saveChatHistory(errorMessage, "incoming");
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
