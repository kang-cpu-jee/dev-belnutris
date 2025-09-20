/**
 * Product Info Section JavaScript
 * Handles FAQ accordion functionality and enhanced interactions
 */

class ProductInfoSection extends HTMLElement {
  constructor() {
    super();
    this.accordions = this.querySelectorAll('.product-info-section__faq-item');
    this.init();
  }

  init() {
    this.setupAccordions();
    this.setupKeyboardNavigation();
    this.setupAnimations();
  }

  setupAccordions() {
    this.accordions.forEach((accordion, index) => {
      const summary = accordion.querySelector('.product-info-section__faq-question');
      const content = accordion.querySelector('.product-info-section__faq-answer');
      
      if (!summary || !content) return;

      // Add ARIA attributes for accessibility
      summary.setAttribute('aria-expanded', 'false');
      summary.setAttribute('aria-controls', `faq-content-${index}`);
      content.setAttribute('id', `faq-content-${index}`);
      content.setAttribute('role', 'region');

      // Handle accordion toggle
      summary.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleAccordion(accordion, summary, content);
      });

      // Handle initial state
      if (accordion.hasAttribute('open')) {
        summary.setAttribute('aria-expanded', 'true');
      }
    });
  }

  toggleAccordion(accordion, summary, content) {
    const isOpen = accordion.hasAttribute('open');
    
    if (isOpen) {
      this.closeAccordion(accordion, summary, content);
    } else {
      this.openAccordion(accordion, summary, content);
    }
  }

  openAccordion(accordion, summary, content) {
    accordion.setAttribute('open', '');
    summary.setAttribute('aria-expanded', 'true');
    
    // Smooth animation
    content.style.maxHeight = '0';
    content.style.overflow = 'hidden';
    
    requestAnimationFrame(() => {
      content.style.transition = 'max-height 0.3s ease-out, opacity 0.3s ease-out';
      content.style.maxHeight = content.scrollHeight + 'px';
      content.style.opacity = '1';
    });

    // Clean up after animation
    setTimeout(() => {
      content.style.maxHeight = '';
      content.style.overflow = '';
      content.style.transition = '';
    }, 300);

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('accordion:open', {
      detail: { accordion, summary, content }
    }));
  }

  closeAccordion(accordion, summary, content) {
    summary.setAttribute('aria-expanded', 'false');
    
    // Smooth animation
    content.style.maxHeight = content.scrollHeight + 'px';
    content.style.overflow = 'hidden';
    content.style.transition = 'max-height 0.3s ease-out, opacity 0.3s ease-out';
    
    requestAnimationFrame(() => {
      content.style.maxHeight = '0';
      content.style.opacity = '0.7';
    });

    // Clean up after animation
    setTimeout(() => {
      accordion.removeAttribute('open');
      content.style.maxHeight = '';
      content.style.overflow = '';
      content.style.transition = '';
      content.style.opacity = '';
    }, 300);

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('accordion:close', {
      detail: { accordion, summary, content }
    }));
  }

  setupKeyboardNavigation() {
    this.accordions.forEach((accordion) => {
      const summary = accordion.querySelector('.product-info-section__faq-question');
      
      if (!summary) return;

      summary.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault();
            summary.click();
            break;
          case 'ArrowDown':
            e.preventDefault();
            this.focusNextAccordion(accordion);
            break;
          case 'ArrowUp':
            e.preventDefault();
            this.focusPreviousAccordion(accordion);
            break;
          case 'Home':
            e.preventDefault();
            this.focusFirstAccordion();
            break;
          case 'End':
            e.preventDefault();
            this.focusLastAccordion();
            break;
        }
      });
    });
  }

  focusNextAccordion(currentAccordion) {
    const accordions = Array.from(this.accordions);
    const currentIndex = accordions.indexOf(currentAccordion);
    const nextIndex = (currentIndex + 1) % accordions.length;
    const nextSummary = accordions[nextIndex].querySelector('.product-info-section__faq-question');
    if (nextSummary) nextSummary.focus();
  }

  focusPreviousAccordion(currentAccordion) {
    const accordions = Array.from(this.accordions);
    const currentIndex = accordions.indexOf(currentAccordion);
    const previousIndex = currentIndex === 0 ? accordions.length - 1 : currentIndex - 1;
    const previousSummary = accordions[previousIndex].querySelector('.product-info-section__faq-question');
    if (previousSummary) previousSummary.focus();
  }

  focusFirstAccordion() {
    const firstSummary = this.accordions[0]?.querySelector('.product-info-section__faq-question');
    if (firstSummary) firstSummary.focus();
  }

  focusLastAccordion() {
    const lastSummary = this.accordions[this.accordions.length - 1]?.querySelector('.product-info-section__faq-question');
    if (lastSummary) lastSummary.focus();
  }

  setupAnimations() {
    // Intersection Observer for fade-in animations
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      // Observe FAQ items for staggered animation
      this.accordions.forEach((accordion, index) => {
        accordion.style.opacity = '0';
        accordion.style.transform = 'translateY(20px)';
        accordion.style.animationDelay = `${index * 0.1}s`;
        observer.observe(accordion);
      });
    }
  }

  // Public methods for external control
  openAll() {
    this.accordions.forEach((accordion) => {
      const summary = accordion.querySelector('.product-info-section__faq-question');
      const content = accordion.querySelector('.product-info-section__faq-answer');
      if (!accordion.hasAttribute('open')) {
        this.openAccordion(accordion, summary, content);
      }
    });
  }

  closeAll() {
    this.accordions.forEach((accordion) => {
      const summary = accordion.querySelector('.product-info-section__faq-question');
      const content = accordion.querySelector('.product-info-section__faq-answer');
      if (accordion.hasAttribute('open')) {
        this.closeAccordion(accordion, summary, content);
      }
    });
  }
}

// Register the custom element
customElements.define('product-info-section', ProductInfoSection);

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// Initialize section if it exists
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.product-info-section');
  sections.forEach((section) => {
    if (!section.classList.contains('product-info-section--initialized')) {
      section.classList.add('product-info-section--initialized');
      new ProductInfoSection();
    }
  });
});

// Export for potential external use
window.ProductInfoSection = ProductInfoSection;