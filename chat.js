function initChat(doc, win) {
  const form = doc.querySelector('#chat-form');
  if (!form || form.dataset.initialized) return;
  form.dataset.initialized = 'true';
  const input = doc.querySelector('#chat-question');
  const log = doc.querySelector('#chat-log');
  const status = doc.querySelector('#chat-status');
  const send = form.querySelector('button');
  const prompts = doc.querySelectorAll('[data-question]');
  let busy = false;
  const add = (role, text) => {
    const article = doc.createElement('article');
    article.className = 'chat-message';
    const label = doc.createElement('strong');
    label.textContent = role;
    const body = doc.createElement('p');
    body.textContent = text;
    article.append(label, body);
    log.append(article);
    log.scrollTop = log.scrollHeight;
    return article;
  };
  prompts.forEach(button => button.addEventListener('click', () => {
    input.value = button.dataset.question;
    input.focus();
  }));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message || busy) return;
    if (!win.PORTFOLIO_CHAT_API) {
      status.textContent = 'Chat is being set up. Please use the contact links below to reach Veena.';
      return;
    }
    busy = true;
    send.disabled = true;
    prompts.forEach(button => { button.disabled = true; });
    add('You', message);
    status.textContent = 'Preparing an answer…';
    const controller = new win.AbortController();
    const timeout = win.setTimeout(() => controller.abort(), 40000);
    try {
      const response = await win.fetch(win.PORTFOLIO_CHAT_API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }), signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(response.status === 429 ? 'The assistant is busy. Try again in a minute.' : 'The assistant is unavailable. Please try again or contact Veena.');
      }
      const data = await response.json();
      if (typeof data.answer !== 'string' || !Array.isArray(data.sources)) throw new Error('Could not read the answer. Please try again.');
      const article = add('Veena’s AI assistant', data.answer);
      data.sources.forEach(source => {
        const details = doc.createElement('details');
        const summary = doc.createElement('summary');
        summary.textContent = `[${source.id}] ${source.title}`;
        const facts = doc.createElement('p');
        facts.textContent = source.text;
        details.append(summary, facts);
        article.append(details);
      });
      if (input.value.trim() === message) input.value = '';
      status.textContent = 'Answer ready. You can ask another question.';
    } catch (error) {
      status.textContent = error.name === 'AbortError' ? 'The request timed out. Please try again.' : (error.message || 'Connection failed. Please try again.');
    } finally {
      win.clearTimeout(timeout);
      busy = false;
      send.disabled = false;
      prompts.forEach(button => { button.disabled = false; });
    }
  });
}
if (typeof module !== 'undefined') module.exports = { initChat };
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initChat(document, window));
  else initChat(document, window);
}
