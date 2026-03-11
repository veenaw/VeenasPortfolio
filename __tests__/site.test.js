const fs = require('fs');
const path = require('path');

const {
  initSiteInteractions
} = require('../site');

function loadHtmlIntoDocument() {
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
  // Replace the existing document contents with the portfolio HTML
  document.documentElement.innerHTML = html;
}

describe('Veena Portfolio Site interactions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    loadHtmlIntoDocument();

    // Ensure a predictable environment object for our init function
    initSiteInteractions(window, document);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('smooth scrolling is wired for in-page navigation links', () => {
    const contactLink = document.querySelector('a[href="#contact"]');
    const contactSection = document.querySelector('#contact');

    // Guard to ensure the elements exist in the test DOM
    expect(contactLink).not.toBeNull();
    expect(contactSection).not.toBeNull();

    // Mock scrollIntoView so we can assert on it
    contactSection.scrollIntoView = jest.fn();

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });

    contactLink.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
    expect(contactSection.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(contactSection.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({
        behavior: 'smooth',
        block: 'start'
      })
    );
  });

  test('fade-in sections become visible when IntersectionObserver is not available', () => {
    // Simulate an environment without IntersectionObserver
    const originalIO = window.IntersectionObserver;
    delete window.IntersectionObserver;

    loadHtmlIntoDocument();
    initSiteInteractions(window, document);

    const fadeElements = document.querySelectorAll('.fade-in');
    expect(fadeElements.length).toBeGreaterThan(0);
    fadeElements.forEach(el => {
      expect(el.classList.contains('visible')).toBe(true);
    });

    // Restore original IntersectionObserver (if any) for other tests
    if (originalIO) {
      window.IntersectionObserver = originalIO;
    } else {
      delete window.IntersectionObserver;
    }
  });

  test('project cards respond to hover with transform styles', () => {
    const card = document.querySelector('.project-card');
    expect(card).not.toBeNull();

    const mouseEnter = new MouseEvent('mouseenter', { bubbles: true });
    const mouseLeave = new MouseEvent('mouseleave', { bubbles: true });

    card.dispatchEvent(mouseEnter);
    expect(card.style.transform).toBe('translateY(-10px) scale(1.02)');

    card.dispatchEvent(mouseLeave);
    expect(card.style.transform).toBe('translateY(0) scale(1)');
  });

  test('contact and CTA buttons get a click animation and reset', () => {
    const button = document.querySelector('.contact-btn, .btn');
    expect(button).not.toBeNull();

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    button.dispatchEvent(clickEvent);

    // Immediately after click, we expect the scale to be applied
    expect(button.style.transform).toBe('scale(0.95)');

    // After the timeout, the style should reset
    jest.advanceTimersByTime(200);
    expect(button.style.transform).toBe('');
  });
});

