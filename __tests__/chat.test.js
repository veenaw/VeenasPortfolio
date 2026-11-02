const { initChat } = require('../chat');
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
describe('portfolio chat', () => {
  let win;
  beforeEach(() => {
    document.body.innerHTML = '<div id="chat-log"></div><p id="chat-status"></p><form id="chat-form"><textarea id="chat-question"></textarea><button>Ask</button></form><button data-question="Go?">Go</button>';
    win = { PORTFOLIO_CHAT_API: 'https://api.example/api/chat', fetch: jest.fn(), AbortController, setTimeout, clearTimeout };
    initChat(document, win);
  });
  const submit = () => document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
  test('renders model output as text and shows source excerpts', async () => {
    win.fetch.mockResolvedValue({ ok: true, json: async () => ({ answer: '<img src=x onerror=alert(1)>', sources: [{ id: 'weave', title: 'Weave', text: 'Go pipelines' }] }) });
    document.querySelector('textarea').value = 'Go?';
    submit();
    await tick();
    expect(document.querySelector('#chat-log img')).toBeNull();
    expect(document.querySelector('details').textContent).toContain('Go pipelines');
    expect(JSON.parse(win.fetch.mock.calls[0][1].body)).toEqual({ message: 'Go?' });
    expect(document.querySelector('form button').disabled).toBe(false);
  });
  test('missing deployment configuration makes no network request', () => {
    win.PORTFOLIO_CHAT_API = '';
    document.querySelector('textarea').value = 'hello';
    submit();
    expect(win.fetch).not.toHaveBeenCalled();
    expect(document.querySelector('#chat-status').textContent).toContain('being set up');
  });
  test('failed requests keep the question available for retry', async () => {
    win.fetch.mockResolvedValue({ ok: false, status: 429 });
    document.querySelector('textarea').value = 'hello';
    submit();
    await tick();
    expect(document.querySelector('textarea').value).toBe('hello');
    expect(document.querySelector('#chat-status').textContent).toContain('busy');
    expect(document.querySelector('form button').disabled).toBe(false);
  });
});
