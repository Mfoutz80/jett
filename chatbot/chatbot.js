document.addEventListener('DOMContentLoaded', () => {
    // Load chatbot HTML
    fetch('chatbot/chatbot.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('chatbot-container').innerHTML = data;
  
        // Initialize chatbot
        const chatBubble = document.getElementById('chatBubble');
        const chatBox = document.getElementById('chatBox');
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');
        const chatMessages = document.getElementById('chatMessages');
  
        // Toggle chat box
        chatBubble.addEventListener('click', () => {
          chatBox.classList.toggle('active');
          if (chatBox.classList.contains('active')) {
            chatInput.focus();
          }
        });
  
        // Scroll event for auto-opening chat
        let scrollTimer = null;
        window.addEventListener('scroll', () => {
          if (!chatBox.classList.contains('active')) {
            // Clear any existing timer
            if (scrollTimer) {
              clearTimeout(scrollTimer);
            }
            // Set new timer for 3 seconds
            scrollTimer = setTimeout(() => {
              chatBubble.style.transform = 'scale(1.1)'; // Expand bubble
              chatBox.classList.add('active'); // Show chat
              chatInput.focus();
            }, 3000);
          }
        });
  
        // Send message on button click
        sendButton.addEventListener('click', sendMessage);
  
        // Send message on Enter key press
        chatInput.addEventListener('keypress', e => {
          if (e.key === 'Enter') {
            sendMessage();
          }
        });
  
        // Remove references to "JettFAQ.txt"
        function removeReferences(text) {
          return text
            .replace(/\[JettFAQ\.txt\]\(JettFAQ\.txt\)/gi, '')
            .replace(/\(JettFAQ\.txt\)/gi, '')
            .replace(/JettFAQ\.txt/gi, '');
        }
  
        // Convert asterisks to <strong> after typing completes
        function convertAsterisksToBold(text) {
          text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          text = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
          return text;
        }
  
        // Typewriter effect for Jett's messages
        function typedEffect(rawText, element) {
          let index = 0;
  
          function typeChar() {
            if (index < rawText.length) {
              element.textContent += rawText.charAt(index);
              index++;
              setTimeout(typeChar, 20);
            } else {
              const finalHTML = convertAsterisksToBold(element.textContent);
              element.innerHTML = finalHTML;
            }
          }
  
          typeChar();
        }
  
        // Add a message to the chat
        function addMessage(text, sender) {
          text = removeReferences(text);
          const messageDiv = document.createElement('div');
          messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'jett-message'}`;
          chatMessages.appendChild(messageDiv);
  
          if (sender === 'jett') {
            typedEffect(text, messageDiv);
          } else {
            messageDiv.textContent = text;
          }
  
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
  
        function sendMessage() {
          const message = chatInput.value.trim();
          if (message === '') return;
  
          addMessage(message, 'user');
          chatInput.value = '';
  
          const loadingDiv = document.createElement('div');
          loadingDiv.className = 'loading-dots';
          loadingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
          chatMessages.appendChild(loadingDiv);
  
          chatMessages.scrollTop = chatMessages.scrollHeight;
  
          getJettResponse(message)
            .then(response => {
              chatMessages.removeChild(loadingDiv);
              addMessage(response, 'jett');
            })
            .catch(error => {
              chatMessages.removeChild(loadingDiv);
              addMessage(
                "Meow! Sorry, I'm having trouble connecting right now. Try again later?",
                'jett'
              );
              console.error('Error getting response:', error);
            });
        }
  
        async function getJettResponse(question) {
          try {
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ question })
            });
  
            const data = await response.json();
  
            if (data && data.response) {
              return data.response;
            } else {
              throw new Error('Invalid response format');
            }
          } catch (error) {
            console.error('API Error:', error);
            const fallbackResponses = [
              "Meow! I'm having trouble with my cat-nection right now. Try again?",
              "Purr... something went wrong. Maybe I got distracted by a laser pointer?",
              "Hiss! My API litterbox seems to be full. Let me try to fix that later.",
              "Meow? I think I'm stuck in a virtual tree. Can you ask me again in a moment?",
              "I'm busy chasing a virtual mouse right now. Can you try again soon?"
            ];
            return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
          }
        }
      });
  });