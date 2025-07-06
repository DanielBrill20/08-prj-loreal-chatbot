// Get DOM elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Conversation history for multi-turn chat
let messages = [
  {
    role: "system",
    content:
      "You are a helpful AI assistant for L'Oréal. Only answer questions about L'Oréal products, routines, recommendations, and beauty-related topics. If asked about anything else, politely explain you can only help with L'Oréal and beauty questions.",
  },
];

// Show initial greeting
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! How can I help you today?</div>`;

// Helper: add a message to the chat window
function addMessage(role, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${role}`;
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Helper: clear chat window and show all messages
function renderChat() {
  chatWindow.innerHTML = "";
  // Only show user/ai messages (skip system)
  for (let i = 1; i < messages.length; i++) {
    const m = messages[i];
    addMessage(m.role === "user" ? "user" : "ai", m.content);
  }
}

// Handle form submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;

  // Add user message to history
  messages.push({ role: "user", content: question });
  renderChat();
  userInput.value = "";

  // Show loading message
  addMessage("ai", "Thinking…");

  // Send to Cloudflare Worker (replace with your endpoint)
  const endpoint = "https://loreal-worker.daniel-brill20.workers.dev/";
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const data = await response.json();
    // Get the AI's reply
    const aiReply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't get a response.";
    // Replace loading with real reply
    messages.push({ role: "assistant", content: aiReply });
    renderChat();
  } catch (err) {
    // Show error
    messages.push({
      role: "assistant",
      content: "Sorry, there was a problem connecting to the AI.",
    });
    renderChat();
  }
});
