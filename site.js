function setupSmoothScrolling(win, doc) {
  const anchors = doc.querySelectorAll('a[href^="#"]');
  anchors.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      // Only handle in-page anchor links with an actual target
      if (!href || !href.startsWith('#')) {
        return;
      }

      const target = doc.querySelector(href);
      if (!target) {
        return;
      }

      e.preventDefault();

      if (typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

function setupFadeInAnimations(win, doc) {
  const fadeElements = doc.querySelectorAll('.fade-in');
  if (!fadeElements.length) {
    return;
  }

  // If IntersectionObserver is not available (older browsers / test env),
  // fall back to immediately showing the elements.
  if (!('IntersectionObserver' in win)) {
    fadeElements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new win.IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => observer.observe(el));
}

function setupProjectCardHoverEffects(doc) {
  const cards = doc.querySelectorAll('.project-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-10px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
}

function setupClickAnimations(win, doc) {
  const buttons = doc.querySelectorAll('.contact-btn, .btn');
  buttons.forEach(button => {
    button.addEventListener('click', function () {
      this.style.transform = 'scale(0.95)';
      win.setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });
}

function initSiteInteractions(win = window, doc = document) {
  if (!win || !doc) {
    return;
  }

  setupSmoothScrolling(win, doc);
  setupFadeInAnimations(win, doc);
  setupProjectCardHoverEffects(doc);
  setupClickAnimations(win, doc);
}

// Auto-initialize in the browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initSiteInteractions(window, document));
  } else {
    initSiteInteractions(window, document);
  }
}

// Export functions for testing
module.exports = {
  initSiteInteractions,
  setupSmoothScrolling,
  setupFadeInAnimations,
  setupProjectCardHoverEffects,
  setupClickAnimations
};

