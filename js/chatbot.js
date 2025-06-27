document.addEventListener('DOMContentLoaded', () => {
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeChatButton = document.getElementById('close-chat');
    const chatMessages = document.getElementById('chat-messages');
    const chatInputField = document.getElementById('chat-input-field');
    const sendChatButton = document.getElementById('send-chat-button');
    const questionDropdown = document.getElementById('question-dropdown');

    // Toggle chatbot window visibility
    chatbotIcon.addEventListener('click', () => {
        chatbotWindow.style.display = chatbotWindow.style.display === 'flex' ? 'none' : 'flex';
        if (chatbotWindow.style.display === 'flex') {
            chatInputField.focus();
        }
    });

    closeChatButton.addEventListener('click', () => {
        chatbotWindow.style.display = 'none';
    });

    // Function to add a message to the chat window
    function addMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message-bubble');
        messageElement.classList.add(sender === 'user' ? 'message-user' : 'message-bot');
        messageElement.innerHTML = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
    }

    // Simple rule-based response logic
    function getBotResponse(message) {
        const lowerCaseMessage = message.toLowerCase();

        if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
            return "Hello there! I'm Rui's AI assistant. How can I help you learn about Rui?";
        } else if (lowerCaseMessage.includes('skills') || lowerCaseMessage.includes('expertise')) {
            return "Rui has expertise in AI, Machine Learning, Data Science, Software Engineering, and Cybersecurity. You can find a detailed list in the Skills section!";
        } else if (lowerCaseMessage.includes('experience') || lowerCaseMessage.includes('work')) {
            return "Rui has experience as a Data Scientist at Expatiate Communications, a Software Engineer Intern at EPS online Inc, and a Research Assistant at the University of Delaware. Check the Experience section for more details!";
        } else if (lowerCaseMessage.includes('education') || lowerCaseMessage.includes('degrees') || lowerCaseMessage.includes('study')) {
            return "Rui holds a Ph.D. in Computer Engineering from the University of Delaware and a Master's and Bachelor's from the University of Science and Technology of China.";
        } else if (lowerCaseMessage.includes('projects') || lowerCaseMessage.includes('work')) {
            return "Rui has worked on exciting projects like the Cute Animal Image Classifier, Simple Perceptron Visualization, Text-to-Audio Converter, and Transparent Proxy Detection. Explore the Projects section!";
        } else if (lowerCaseMessage.includes('contact') || lowerCaseMessage.includes('email')) {
            return "You can reach Rui at bianrui0315@gmail.com or through his LinkedIn profile.";
        } else if (lowerCaseMessage.includes('thank')) {
            return "You're welcome! Is there anything else I can help you with?";
        } else {
            return "For now, I cannot answer this question. Please feel free to contact Rui directly at <a href=\"mailto:bianrui0315@gmail.com\">bianrui0315@gmail.com</a>.";
        }
    }

    // Handle sending messages
    sendChatButton.addEventListener('click', () => {
        const userMessage = chatInputField.value.trim();
        if (userMessage) {
            addMessage('user', userMessage);
            chatInputField.value = '';
            setTimeout(() => {
                addMessage('bot', getBotResponse(userMessage));
            }, 500);
        }
    });

    chatInputField.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendChatButton.click();
        }
    });

    // Handle dropdown selection
    questionDropdown.addEventListener('change', () => {
        const selectedQuestion = questionDropdown.value;
        if (selectedQuestion) {
            chatInputField.value = selectedQuestion; // Populate input field
            sendChatButton.click(); // Trigger send button click
            questionDropdown.value = ''; // Reset dropdown
        }
    });

    // Initial bot message
    addMessage('bot', "Hello! I'm Rui's AI assistant. Ask me anything about Rui!");
});
