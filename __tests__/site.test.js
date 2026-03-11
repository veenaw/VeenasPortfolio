const fs = require('fs');
const path = require('path');

const {
  initSiteInteractions,
  setupFadeInAnimations
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

  test('smooth scrolling safely ignores links without valid in-page targets', () => {
    const externalLink = document.createElement('a');
    externalLink.href = '/external';
    document.body.appendChild(externalLink);

    const missingTargetLink = document.createElement('a');
    missingTargetLink.href = '#does-not-exist';
    document.body.appendChild(missingTargetLink);

    initSiteInteractions(window, document);

    const externalClick = new MouseEvent('click', { bubbles: true, cancelable: true });
    const missingClick = new MouseEvent('click', { bubbles: true, cancelable: true });

    externalLink.dispatchEvent(externalClick);
    missingTargetLink.dispatchEvent(missingClick);

    expect(externalClick.defaultPrevented).toBe(false);
    expect(missingClick.defaultPrevented).toBe(false);
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

  test('fade-in sections are observed when IntersectionObserver is available', () => {
    loadHtmlIntoDocument();

    const fadeElements = Array.from(document.querySelectorAll('.fade-in'));
    expect(fadeElements.length).toBeGreaterThan(0);

    let observedElements = [];
    let capturedCallback = null;

    const OriginalIO = window.IntersectionObserver;

    class FakeIntersectionObserver {
      constructor(callback, options) {
        capturedCallback = callback;
        this.options = options;
      }

      observe(el) {
        observedElements.push(el);
      }
    }

    window.IntersectionObserver = FakeIntersectionObserver;

    setupFadeInAnimations(window, document);

    expect(observedElements.length).toBe(fadeElements.length);
    expect(typeof capturedCallback).toBe('function');

    const entries = observedElements.map(el => ({
      isIntersecting: true,
      target: el
    }));
    capturedCallback(entries);

    observedElements.forEach(el => {
      expect(el.classList.contains('visible')).toBe(true);
    });

    if (OriginalIO) {
      window.IntersectionObserver = OriginalIO;
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

  test("contact section is the unified \"Let's build the future\" block", () => {
    const contactSection = document.querySelector('#contact');
    expect(contactSection).not.toBeNull();

    const futureSection = contactSection.querySelector('.future-section');
    expect(futureSection).not.toBeNull();

    const heading = futureSection.querySelector('.future-heading');
    expect(heading).not.toBeNull();
    expect(heading.textContent).toMatch(/Let's build/i);
    expect(heading.textContent).toMatch(/the future/i);

    const buttons = futureSection.querySelectorAll('.contact-btn');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  test('initSiteInteractions no-ops when window or document are missing', () => {
    expect(() => initSiteInteractions(null, document)).not.toThrow();
    expect(() => initSiteInteractions(window, null)).not.toThrow();
  });
});

describe('site bootstrap auto-initialization', () => {
  test('attaches a DOMContentLoaded listener when document is still loading', () => {
    jest.resetModules();

    const originalWindow = global.window;
    const originalDocument = global.document;

    global.window = {};
    global.document = {
      readyState: 'loading',
      addEventListener: jest.fn()
    };

    jest.isolateModules(() => {
      require('../site');
    });

    global.window = originalWindow;
    global.document = originalDocument;
  });
});

