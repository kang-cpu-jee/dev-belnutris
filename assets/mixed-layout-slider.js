// Mixed Layout Slider - Transform Based Implementation
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing transform-based sliders...');
  
  const initSlider = (sliderContainer) => {
    console.log('Initializing transform-based slider...');
    
    const slider = sliderContainer.querySelector('.product__media-list');
    const dots = sliderContainer.querySelectorAll('.mixed-layout-slider-dot');
    const prevButton = sliderContainer.querySelector('.slider-button--prev');
    const nextButton = sliderContainer.querySelector('.slider-button--next');
    const counter = sliderContainer.querySelector('.slider-counter--current');
    
    if (!slider || !dots.length) {
      console.log('Missing required elements');
      return;
    }
    
    const slides = Array.from(slider.children);
    let currentSlide = 0;
    
    console.log(`Found ${slides.length} slides`);
    
    if (slides.length === 0) {
      console.error('No slides found!');
      return;
    }
    
    // Set up slider container with proper overflow
    slider.style.display = 'block';
    slider.style.overflow = 'hidden';
    slider.style.width = '100%';
    slider.style.position = 'relative';
    slider.style.height = 'auto';
    
    console.log('Setting up slides wrapper...');
    
    // Create slides wrapper for single slide display
    const slidesWrapper = document.createElement('div');
    slidesWrapper.style.display = 'flex';
    slidesWrapper.style.width = `${slides.length * 100}%`;
    slidesWrapper.style.transition = 'transform 0.3s ease-in-out';
    slidesWrapper.style.height = '100%';
    slidesWrapper.style.willChange = 'transform';
    slidesWrapper.style.position = 'relative';
    
    // Move original slides to wrapper (don't clone, move them)
    slides.forEach((slide, index) => {
      slide.style.width = `${100 / slides.length}%`;
      slide.style.flex = '0 0 auto';
      slide.style.margin = '0';
      slide.style.padding = '0';
      slide.style.boxSizing = 'border-box';
      slide.style.minWidth = `${100 / slides.length}%`;
      slide.style.display = 'block';
      slide.style.position = 'relative';
      slidesWrapper.appendChild(slide);
    });
    
    // Clear slider and add wrapper
    slider.innerHTML = '';
    slider.appendChild(slidesWrapper);
    
    console.log('Slides wrapper created and added to slider');
    console.log('Wrapper width:', slidesWrapper.style.width);
    console.log('Slide width:', slides[0]?.style.width);
    console.log('Total slides in wrapper:', slidesWrapper.children.length);
    
    // Calculate and apply equal height based on tallest slide
    const setEqualHeight = () => {
      console.log('Setting equal height...');
      
      // Reset heights first
      slides.forEach(slide => {
        slide.style.height = 'auto';
      });
      
      // Get all images in slides
      const images = slidesWrapper.querySelectorAll('img');
      console.log('Found images:', images.length);
      
      const imagePromises = Array.from(images).map(img => {
        return new Promise(resolve => {
          if (img.complete && img.naturalHeight > 0) {
            resolve();
          } else {
            const onLoad = () => {
              img.removeEventListener('load', onLoad);
              img.removeEventListener('error', onLoad);
              resolve();
            };
            img.addEventListener('load', onLoad);
            img.addEventListener('error', onLoad);
          }
        });
      });
      
      // Wait for all images to load, then calculate heights
      Promise.all(imagePromises).then(() => {
        setTimeout(() => {
          let maxHeight = 0;
          
          slides.forEach((slide, index) => {
            const mediaContainer = slide.querySelector('.product-media-container');
            if (mediaContainer) {
              const height = mediaContainer.offsetHeight;
              console.log(`Slide ${index} height:`, height);
              if (height > maxHeight) {
                maxHeight = height;
              }
            }
          });
          
          console.log('Max height found:', maxHeight);
          
          if (maxHeight > 0) {
            // Apply the max height to all slides
            sliderContainer.style.setProperty('--slides-max-height', maxHeight + 'px');
            sliderContainer.classList.add('equal-height-initialized');
            
            // Update slider container height
            slider.style.height = maxHeight + 'px';
            slidesWrapper.style.height = maxHeight + 'px';
            
            console.log('Equal height applied:', maxHeight + 'px');
          }
        }, 100);
      }).catch(error => {
        console.error('Error loading images:', error);
      });
    };
    
    // Call equal height function
    setEqualHeight();
    
    // Re-calculate on window resize
    window.addEventListener('resize', () => {
      console.log('Window resized, recalculating equal height');
      setEqualHeight();
    });
    
    // Initialize first slide
    setTimeout(() => {
      console.log('Initializing first slide');
      updateSlider(0, true);
    }, 200);
    
    // Debug function to check slider state
    const debugSliderState = () => {
      console.log('=== Slider Debug Info ===');
      console.log('Slides in wrapper:', slidesWrapper.children.length);
      console.log('Original slides array length:', slides.length);
      console.log('Current slide index:', currentSlide);
      console.log('Wrapper transform:', slidesWrapper.style.transform);
      console.log('Wrapper width:', slidesWrapper.style.width);
      console.log('Slider height:', slider.style.height);
      console.log('========================');
    };
    
    // Add debug to console for testing
    window.debugSlider = debugSliderState;
    
    // Add function to manually reset transition state
    window.resetSliderTransition = () => {
      console.log('Manually resetting isTransitioning flag');
      isTransitioning = false;
    };
    
    let isTransitioning = false;
    
    const updateSlider = (index, immediate = false) => {
      if (isTransitioning && !immediate) return;
      
      // Validate index
      if (index < 0 || index >= slides.length) {
        console.error('Invalid slide index:', index);
        return;
      }
      
      isTransitioning = true;
      
      const translateX = -(index * (100 / slides.length));
      console.log(`Moving to slide ${index}, translateX: ${translateX}%`);
      
      if (immediate) {
        slidesWrapper.style.transition = 'none';
        slidesWrapper.style.transform = `translateX(${translateX}%)`;
        // Force reflow
        slidesWrapper.offsetHeight;
        slidesWrapper.style.transition = 'transform 0.3s ease-in-out';
      } else {
        slidesWrapper.style.transform = `translateX(${translateX}%)`;
      }
      
      // Update dots
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      
      // Update counter
      if (counter) {
        counter.textContent = index + 1;
      }
      
      currentSlide = index;
      console.log(`Moved to slide ${index}, current wrapper transform:`, slidesWrapper.style.transform);
      
      // Set a backup timeout to reset isTransitioning in case something goes wrong
      const transitionTimeout = setTimeout(() => {
        if (isTransitioning) {
          console.warn('Force resetting isTransitioning flag');
          isTransitioning = false;
        }
      }, 1000);
      
      setTimeout(() => {
        isTransitioning = false;
        clearTimeout(transitionTimeout);
        console.log('Transition completed, isTransitioning set to false');
      }, immediate ? 50 : 350);
    };
    
    const goNext = () => {
      console.log('goNext called, isTransitioning:', isTransitioning);
      if (isTransitioning) {
        console.log('Blocked by isTransitioning');
        return;
      }
      
      // Check if slides are still in wrapper
      const wrapperChildrenCount = slidesWrapper.children.length;
      const originalSlidesCount = slides.length;
      console.log('Wrapper children:', wrapperChildrenCount, 'Original slides:', originalSlidesCount);
      
      if (wrapperChildrenCount !== originalSlidesCount) {
        console.error('Slides missing from wrapper! Reinitializing...');
        console.log('Current wrapper children:', Array.from(slidesWrapper.children).map(c => c.id));
        return;
      }
      
      const nextIndex = currentSlide + 1 >= slides.length ? 0 : currentSlide + 1;
      console.log(`Going to next slide: ${currentSlide} -> ${nextIndex}`);
      updateSlider(nextIndex);
    };

    const goPrev = () => {
      console.log('goPrev called, isTransitioning:', isTransitioning);
      if (isTransitioning) {
        console.log('Blocked by isTransitioning');
        return;
      }
      
      // Check if slides are still in wrapper
      const wrapperChildrenCount = slidesWrapper.children.length;
      const originalSlidesCount = slides.length;
      console.log('Wrapper children:', wrapperChildrenCount, 'Original slides:', originalSlidesCount);
      
      if (wrapperChildrenCount !== originalSlidesCount) {
        console.error('Slides missing from wrapper! Reinitializing...');
        console.log('Current wrapper children:', Array.from(slidesWrapper.children).map(c => c.id));
        return;
      }
      
      const prevIndex = currentSlide - 1 < 0 ? slides.length - 1 : currentSlide - 1;
      console.log(`Going to previous slide: ${currentSlide} -> ${prevIndex}`);
      updateSlider(prevIndex);
    };    // Navigation events
    if (nextButton) {
      console.log('Adding next button event listener');
      nextButton.addEventListener('click', (e) => {
        console.log('Next button clicked');
        e.preventDefault();
        goNext();
      });
    } else {
      console.log('No next button found');
    }
    
    if (prevButton) {
      console.log('Adding prev button event listener');
      prevButton.addEventListener('click', (e) => {
        console.log('Prev button clicked');
        e.preventDefault();
        goPrev();
      });
    } else {
      console.log('No prev button found');
    }
    
    console.log('Found dots:', dots.length);
    dots.forEach((dot, index) => {
      console.log(`Adding event listener to dot ${index}`);
      dot.addEventListener('click', (e) => {
        console.log(`Dot ${index} clicked, isTransitioning:`, isTransitioning);
        e.preventDefault();
        e.stopPropagation();
        if (isTransitioning) {
          console.log('Dot click blocked by isTransitioning');
          return;
        }
        console.log(`Going to slide ${index} via dot`);
        updateSlider(index);
      });
    });
    
    // Touch support
    let startX = 0;
    let endX = 0;
    
    slider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });
    
    slider.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const swipeDistance = startX - endX;
      
      if (Math.abs(swipeDistance) > 50) {
        if (swipeDistance > 0) {
          goNext();
        } else {
          goPrev();
        }
      }
    }, { passive: true });
    
    // Mouse drag support
    let isDragging = false;
    let startMouseX = 0;
    
    slider.addEventListener('mousedown', (e) => {
      isDragging = true;
      startMouseX = e.clientX;
      slider.style.cursor = 'grabbing';
      e.preventDefault();
    });
    
    slider.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
    });
    
    slider.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      slider.style.cursor = 'grab';
      
      const dragDistance = startMouseX - e.clientX;
      
      if (Math.abs(dragDistance) > 50) {
        if (dragDistance > 0) {
          goNext();
        } else {
          goPrev();
        }
      }
    });
    
    slider.addEventListener('mouseleave', () => {
      if (isDragging) {
        isDragging = false;
        slider.style.cursor = 'grab';
      }
    });
    
    // Mouse wheel support with throttling
    let wheelTimeout;
    slider.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      if (isTransitioning || wheelTimeout) return;
      
      wheelTimeout = setTimeout(() => {
        wheelTimeout = null;
      }, 300);
      
      if (e.deltaY > 0 || e.deltaX > 0) {
        goNext();
      } else {
        goPrev();
      }
    }, { passive: false });
    
    // Keyboard support
    sliderContainer.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
      }
    });
    
    // Window resize handler
    window.addEventListener('resize', () => {
      updateSlider(currentSlide);
    });
    
    // Set initial state
    slider.style.cursor = 'grab';
    sliderContainer.setAttribute('tabindex', '0');
    updateSlider(0, true); // Use immediate mode for initial setup
    
    console.log('Transform-based slider initialized successfully');
  };
  
  // Initialize all sliders
  const initializeSliders = () => {
    const mixedSliders = document.querySelectorAll('.mixed-layout-slider');
    
    console.log(`Found ${mixedSliders.length} mixed layout sliders`);
    
    mixedSliders.forEach(sliderContainer => {
      if (sliderContainer.hasAttribute('data-slider-initialized')) return;
      
      initSlider(sliderContainer);
      sliderContainer.setAttribute('data-slider-initialized', 'true');
    });
  };

  // Initialize immediately
  initializeSliders();
  
  // Watch for dynamic content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && (node.classList?.contains('mixed-layout-slider') || node.querySelector?.('.mixed-layout-slider'))) {
            setTimeout(initializeSliders, 100);
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});