/* ==========================================================================
   SupportPilot Chatbot JavaScript (SupportPilot_CB_Main.js)
   ========================================================================== */

// Configurable Integration Variables
const SP_CONFIG = {
  // Replace with your n8n Chat Trigger Webhook URL
  webhookUrl: 'https://supportpilot.auraaico.com/webhook/7fabcc62-9bae-4ce3-9575-cf6f50c92f3e/chat',
  
  // Client ID for quota and logging
  clientId: '1',

  // Client Email for verification
  clientEmail: 'tiyyobhussain@gmail.com',

  // Optional theme color override via JS (set to null to use CSS default)
  themeColor: '#8B1E3F',
  themeColorHover: '#721632'
};

// Apply custom theme color dynamically if defined in config
if (SP_CONFIG.themeColor) {
  document.documentElement.style.setProperty('--sp-theme-color', SP_CONFIG.themeColor);
  if (SP_CONFIG.themeColorHover) {
    document.documentElement.style.setProperty('--sp-theme-color-hover', SP_CONFIG.themeColorHover);
  }
}

// Get or Create Persistent Session ID
let spSessionId = localStorage.getItem('sp_session_id');
if (!spSessionId) {
  spSessionId = 's_' + Math.random().toString(36).substring(2, 11);
  localStorage.setItem('sp_session_id', spSessionId);
}

// Toggle Chat Window
function spToggleChat() {
  const win = document.getElementById('sp-chat-window');
  win.classList.toggle('sp-hidden');
}

// Send Message Handler
async function spSendMessage() {
  const input = document.getElementById('sp-chat-input');
  const text = input.value.trim();
  if (!text) return;

  const messages = document.getElementById('sp-chat-messages');

  // 1. Render User Message
  const userDiv = document.createElement('div');
  userDiv.className = 'sp-message sp-user';
  userDiv.innerText = text;
  messages.appendChild(userDiv);
  input.value = '';
  messages.scrollTop = messages.scrollHeight;

  // 2. Render Animated Pulse Dots Indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'sp-message sp-bot';
  loadingDiv.innerHTML = `
    <div class="sp-typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  messages.appendChild(loadingDiv);
  messages.scrollTop = messages.scrollHeight;

  try {
    // 3. Send payload to n8n Chat Trigger Webhook
    const response = await fetch(SP_CONFIG.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendMessage',
        chatInput: text,
        sessionId: spSessionId,
        metadata: {
          client_id: SP_CONFIG.clientId,
          client_email: SP_CONFIG.clientEmail,
          visitor_id: spSessionId
        }
      })
    });

    const data = await response.json();

    // Extract answer from n8n array or object
    let botReply = '';
    if (Array.isArray(data)) {
      botReply = data[0]?.output || data[0]?.json?.output || data[0]?.text;
    } else {
      botReply = data.output || data.text || data.response;
    }

    loadingDiv.innerText = botReply || 'No reply generated.';
  } catch (err) {
    loadingDiv.innerText = 'Error connecting to server. Please check your connection or CORS settings.';
  }

  messages.scrollTop = messages.scrollHeight;
}