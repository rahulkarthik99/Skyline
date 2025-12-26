(function() {
  'use strict';

  var SkylineKAI = window.SkylineKAI || {};
  var config = {
    apiKey: '',
    serverUrl: '',
    theme: 'dark',
    position: 'bottom-right',
    primaryColor: '#22d3ee',
    welcomeMessage: '👋 Hello! How can I help you today?'
  };

  var widgetContainer = null;
  var isOpen = false;
  var messages = [];

  SkylineKAI.init = function(userConfig) {
    Object.assign(config, userConfig);
    if (!config.apiKey) {
      console.error('SkylineKAI: API key is required');
      return;
    }
    createWidget();
  };

  function createWidget() {
    var styles = document.createElement('style');
    styles.textContent = `
      .skylinekai-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: fixed;
        z-index: 999999;
        ${config.position === 'bottom-right' ? 'right: 20px; bottom: 20px;' : 'left: 20px; bottom: 20px;'}
      }
      .skylinekai-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #22d3ee 0%, #818cf8 100%);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(34, 211, 238, 0.4);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .skylinekai-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 24px rgba(34, 211, 238, 0.5);
      }
      .skylinekai-button svg {
        width: 28px;
        height: 28px;
        fill: white;
      }
      .skylinekai-chat {
        position: absolute;
        ${config.position === 'bottom-right' ? 'right: 0;' : 'left: 0;'}
        bottom: 70px;
        width: 380px;
        height: 550px;
        background: ${config.theme === 'dark' ? '#0f172a' : '#ffffff'};
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        pointer-events: none;
        transition: opacity 0.3s, transform 0.3s;
      }
      .skylinekai-chat.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .skylinekai-header {
        padding: 16px;
        background: linear-gradient(135deg, #22d3ee 0%, #818cf8 100%);
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .skylinekai-header-icon {
        width: 40px;
        height: 40px;
        background: rgba(255,255,255,0.2);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .skylinekai-header-icon svg {
        width: 24px;
        height: 24px;
        fill: white;
      }
      .skylinekai-header-text h3 {
        margin: 0;
        color: white;
        font-size: 16px;
        font-weight: 600;
      }
      .skylinekai-header-text p {
        margin: 2px 0 0;
        color: rgba(255,255,255,0.8);
        font-size: 12px;
      }
      .skylinekai-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .skylinekai-message {
        max-width: 85%;
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
      }
      .skylinekai-message.user {
        align-self: flex-end;
        background: linear-gradient(135deg, #22d3ee 0%, #818cf8 100%);
        color: white;
        border-bottom-right-radius: 4px;
      }
      .skylinekai-message.bot {
        align-self: flex-start;
        background: ${config.theme === 'dark' ? '#1e293b' : '#f1f5f9'};
        color: ${config.theme === 'dark' ? '#e2e8f0' : '#1e293b'};
        border-bottom-left-radius: 4px;
      }
      .skylinekai-typing {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
        background: ${config.theme === 'dark' ? '#1e293b' : '#f1f5f9'};
        border-radius: 16px;
        align-self: flex-start;
      }
      .skylinekai-typing span {
        width: 8px;
        height: 8px;
        background: #22d3ee;
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out both;
      }
      .skylinekai-typing span:nth-child(1) { animation-delay: -0.32s; }
      .skylinekai-typing span:nth-child(2) { animation-delay: -0.16s; }
      @keyframes typing {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }
      .skylinekai-input-area {
        padding: 12px;
        border-top: 1px solid ${config.theme === 'dark' ? '#334155' : '#e2e8f0'};
        display: flex;
        gap: 8px;
      }
      .skylinekai-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid ${config.theme === 'dark' ? '#334155' : '#e2e8f0'};
        border-radius: 24px;
        background: ${config.theme === 'dark' ? '#1e293b' : '#ffffff'};
        color: ${config.theme === 'dark' ? '#e2e8f0' : '#1e293b'};
        font-size: 14px;
        outline: none;
      }
      .skylinekai-input:focus {
        border-color: #22d3ee;
      }
      .skylinekai-send {
        width: 44px;
        height: 44px;
        border: none;
        border-radius: 50%;
        background: linear-gradient(135deg, #22d3ee 0%, #818cf8 100%);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s;
      }
      .skylinekai-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .skylinekai-send svg {
        width: 20px;
        height: 20px;
        fill: white;
      }
      @media (max-width: 480px) {
        .skylinekai-chat {
          width: calc(100vw - 40px);
          height: calc(100vh - 120px);
          max-height: 600px;
        }
      }
    `;
    document.head.appendChild(styles);

    widgetContainer = document.createElement('div');
    widgetContainer.className = 'skylinekai-widget';
    widgetContainer.innerHTML = `
      <div class="skylinekai-chat" id="skylinekai-chat">
        <div class="skylinekai-header">
          <div class="skylinekai-header-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
          <div class="skylinekai-header-text">
            <h3>SkylineKAI</h3>
            <p>AI Assistant</p>
          </div>
        </div>
        <div class="skylinekai-messages" id="skylinekai-messages"></div>
        <div class="skylinekai-input-area">
          <input type="text" class="skylinekai-input" id="skylinekai-input" placeholder="Type a message..." autocomplete="off" />
          <button class="skylinekai-send" id="skylinekai-send">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
      <button class="skylinekai-button" id="skylinekai-toggle">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
      </button>
    `;
    document.body.appendChild(widgetContainer);

    var toggleBtn = document.getElementById('skylinekai-toggle');
    var chatBox = document.getElementById('skylinekai-chat');
    var messagesContainer = document.getElementById('skylinekai-messages');
    var input = document.getElementById('skylinekai-input');
    var sendBtn = document.getElementById('skylinekai-send');

    messages.push({ role: 'assistant', content: config.welcomeMessage });
    renderMessages();

    toggleBtn.addEventListener('click', function() {
      isOpen = !isOpen;
      chatBox.classList.toggle('open', isOpen);
      if (isOpen) {
        input.focus();
      }
    });

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    function renderMessages() {
      messagesContainer.innerHTML = messages.map(function(msg) {
        return '<div class="skylinekai-message ' + msg.role + '">' + escapeHtml(msg.content) + '</div>';
      }).join('');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTyping() {
      var typing = document.createElement('div');
      typing.className = 'skylinekai-typing';
      typing.id = 'skylinekai-typing';
      typing.innerHTML = '<span></span><span></span><span></span>';
      messagesContainer.appendChild(typing);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTyping() {
      var typing = document.getElementById('skylinekai-typing');
      if (typing) typing.remove();
    }

    function sendMessage() {
      var text = input.value.trim();
      if (!text) return;

      messages.push({ role: 'user', content: text });
      renderMessages();
      input.value = '';
      sendBtn.disabled = true;

      showTyping();

      var apiUrl = getApiUrl();
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.apiKey
        },
        body: JSON.stringify({
          history: messages.map(function(m) { return { role: m.role, content: m.content }; }),
          sessionId: getSessionId()
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        hideTyping();
        messages.push({ role: 'assistant', content: data.reply || 'Sorry, I could not process that.' });
        renderMessages();
        sendBtn.disabled = false;
      })
      .catch(function(err) {
        hideTyping();
        console.error('SkylineKAI error:', err);
        messages.push({ role: 'assistant', content: 'Sorry, something went wrong. Please try again.' });
        renderMessages();
        sendBtn.disabled = false;
      });
    }

    function getApiUrl() {
      if (config.serverUrl) {
        return config.serverUrl.replace(/\/$/, '') + '/api/widget/chat';
      }
      var script = document.getElementById('skylinekai-widget');
      if (script && script.src) {
        var url = new URL(script.src);
        return url.origin + '/api/widget/chat';
      }
      return '/api/widget/chat';
    }

    function getSessionId() {
      var sessionId = localStorage.getItem('skylinekai_session');
      if (!sessionId) {
        sessionId = 'sk_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('skylinekai_session', sessionId);
      }
      return sessionId;
    }

    function escapeHtml(text) {
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  window.skylinekai = SkylineKAI.init;
})();
