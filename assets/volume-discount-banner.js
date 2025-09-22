class VolumeDiscountBanner {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupBanner();
    });
  }

  setupBanner() {
    const volumeDiscountSection = document.querySelector('.volume-discount-section');
    if (!volumeDiscountSection) return;

    this.progressFill = volumeDiscountSection.querySelector('[data-progress-fill]');
    this.labels = volumeDiscountSection.querySelectorAll('[data-level]');
    this.badges = volumeDiscountSection.querySelectorAll('[data-qty]');

    // Discount mapping: quantity -> discount level
    this.discountMapping = {
      1: { level: 0, progress: 'calc(3.5% + 18px)' },    // 1x = OFF (0%)
      2: { level: 1, progress: 'calc(35% + 8px)' },   // 2x = 5%
      3: { level: 2, progress: 'calc(65% + 14px)' },   // 3x = 10%
      4: { level: 3, progress: 'calc(96% + 14px)' }   // >3x = 15%
    };

    this.attachQuantityListener();
  }

  updateVolumeDiscount(quantity) {
    // Determine which level based on quantity
    let mappedQty = quantity;
    if (quantity >= 4) mappedQty = 4;
    if (quantity < 1) mappedQty = 1;

    const discount = this.discountMapping[mappedQty];
    
    // Update progress bar with smooth animation
    if (this.progressFill) {
      // Add a slight delay for more dramatic effect
      setTimeout(() => {
        this.progressFill.style.width = discount.progress;
      }, 100);
    }

    // Update labels with staggered animation
    this.labels.forEach((label, index) => {
      setTimeout(() => {
        label.classList.toggle('active', index === discount.level);
      }, index * 50);
    });

    // Update badges with smooth transitions
    this.badges.forEach((badge, index) => {
      const badgeQty = parseInt(badge.dataset.qty);
      
      setTimeout(() => {
        badge.classList.remove('active', 'highlighted');
        
        if (badgeQty === mappedQty) {
          badge.classList.add('highlighted');
        } else if (badgeQty < mappedQty) {
          badge.classList.add('active');
        }
      }, index * 80);
    });

    // Add pulse effect to progress bar when it updates
    if (this.progressFill) {
      this.progressFill.style.animation = 'none';
      setTimeout(() => {
        this.progressFill.style.animation = 'progressPulse 0.6s ease-out';
      }, 200);
    }
  }

  attachQuantityListener() {
    const quantityInputs = document.querySelectorAll('input[name="quantity"], .quantity__input, [data-quantity-input]');
    
    quantityInputs.forEach(input => {
      // Initial update
      this.updateVolumeDiscount(parseInt(input.value) || 1);
      
      // Listen for changes
      input.addEventListener('change', (e) => {
        this.updateVolumeDiscount(parseInt(e.target.value) || 1);
      });
      
      input.addEventListener('input', (e) => {
        this.updateVolumeDiscount(parseInt(e.target.value) || 1);
      });
    });

    // Also listen for quantity buttons (+ -)
    const quantityButtons = document.querySelectorAll('.quantity__button, [data-quantity-button]');
    quantityButtons.forEach(button => {
      button.addEventListener('click', () => {
        setTimeout(() => {
          const input = button.closest('.quantity').querySelector('input');
          if (input) {
            this.updateVolumeDiscount(parseInt(input.value) || 1);
          }
        }, 100);
      });
    });

    // Re-attach listeners when variant changes (for themes that reload content)
    document.addEventListener('variant:change', () => {
      this.attachQuantityListener();
    });
    
    // Also listen for any form updates
    const productForm = document.querySelector('form[action*="/cart/add"]');
    if (productForm) {
      productForm.addEventListener('change', () => {
        setTimeout(() => this.attachQuantityListener(), 100);
      });
    }
  }
}

// Initialize the volume discount banner
new VolumeDiscountBanner();