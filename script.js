/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Store conversation history for context
let conversationHistory = [
  {
    role: "system",
    content:
      "You are a helpful L'Oréal product advisor. Help users find the right beauty and skincare products for their needs. Keep responses concise and helpful.",
  },
];

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent page refresh

  const message = userInput.value.trim();
  if (!message) return; // Don't send empty messages

  // Display user message in chat
  displayMessage(message, "user");

  // Clear input field and disable send button
  userInput.value = "";
  sendBtn.disabled = true;

  // Add user message to conversation history
  conversationHistory.push({
    role: "user",
    content: message,
  });

  try {
    // Call OpenAI API
    const aiResponse = await callOpenAI();

    // Display AI response in chat
    displayMessage(aiResponse, "ai");

    // Add AI response to conversation history
    conversationHistory.push({
      role: "assistant",
      content: aiResponse,
    });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    displayMessage("Sorry, I encountered an error. Please try again.", "ai");
  }

  // Re-enable send button
  sendBtn.disabled = false;
  userInput.focus(); // Return focus to input
});

// Function to display messages in chat window
function displayMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("msg", sender);
  messageElement.textContent = message;

  // Add message to chat window
  chatWindow.appendChild(messageElement);

  // Scroll to bottom of chat window
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to call OpenAI API
async function callOpenAI() {
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  // Prepare request body
  const requestBody = {
    model: "gpt-4o",
    messages: conversationHistory,
    max_completion_tokens: 300,
  };

  // Make API request
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`, // This comes from secrets.js
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  // Check if request was successful
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Parse response
  const data = await response.json();

  // Extract AI message from response
  return data.choices[0].message.content;
}

// Display welcome message when page loads
window.addEventListener("load", () => {
  displayMessage(
    "Hi! I'm your L'Oréal product advisor. Ask me about skincare routines, makeup products, or any beauty questions you have!",
    "ai"
  );
  userInput.focus(); // Focus on input field
});
