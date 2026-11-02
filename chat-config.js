// Public backend URL only. Never put API keys in browser files.
window.PORTFOLIO_CHAT_API = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://127.0.0.1:8000/api/chat'
  : ''; // Set to https://YOUR-BACKEND/api/chat after deploying the backend.
