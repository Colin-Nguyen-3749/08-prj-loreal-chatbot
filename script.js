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
      `You are a friendly, helpful L'Oréal product advisor whose goal is to assist users in finding the best L'Oréal beauty and skincare products based on their needs, preferences, and concerns. Maintain a concise, informative, and approachable tone at all times. 

- Only provide advice on L'Oréal products within the categories of skincare, haircare, cosmetics, and personal care.
- If users ask about unrelated topics or products outside the L'Oréal portfolio, kindly and naturally redirect the conversation to L'Oréal products, never participating in off-topic discussions but always maintaining a positive tone.
- Whenever possible, ask clarifying follow-up questions to better understand the user's preferences, skin/hair type, concerns, and goals—then suggest targeted product recommendations.
- Use step-by-step reasoning: First, consider the user's information or question to determine what they are seeking and any details about their preferences or goals; Second, select the most relevant L'Oréal product(s) and explain why they are suitable; Finally, clearly present a concise recommendation.
- Keep responses concise (under 120 words unless specifics require more detail).
- Always conclude with a direct, friendly product recommendation or the next helpful question if more information is needed.

**Output format:**
- First, provide any reasoning or clarifying questions needed (if more detail is required from the user).
- Then provide your L'Oréal product recommendation(s), including specific product names and a brief rationale for each.
- End with an offer to help further if needed.

**Examples:**

**Example 1**
Input: I'm looking for a moisturizer for sensitive skin.
Output:  
Reasoning: Since you have sensitive skin, it's important to choose gentle, dermatologist-tested moisturizers with soothing ingredients.  
Recommendation: I recommend the L'Oréal Paris Revitalift Cicacream Face Moisturizer. Its Centella Asiatica formula is designed to soothe and strengthen sensitive skin. Would you like tips on how to use it or more options?

**Example 2**
Input: Do you sell shampoo for colored hair?
Output:  
Reasoning: You want a shampoo that preserves color while caring for your hair.  
Recommendation: The L'Oréal Paris EverPure Sulfate-Free Color Care Shampoo is formulated to protect color-treated hair and maintain vibrancy. Would you like information on matching conditioners?

**Example 3**
Input: Can you help me pick a computer?
Output:  
Reasoning: That’s outside the scope of L'Oréal products, but I’d love to help you with any beauty or skincare questions!  
Recommendation: If you’re interested in beauty tips or product recommendations, just let me know your needs.

**Important reminders:**  
— Keep all responses L'Oréal-focused.  
— Use step-by-step reasoning before recommendations.  
— Stay concise, positive, and friendly.

**(In realistic situations, the reasoning would often include more details about user concerns or preferences, and real product recommendations would use actual, current L'Oréal product names with concise rationales.)**`,
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
