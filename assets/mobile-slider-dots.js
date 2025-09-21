// Mobile Slider Dots Functionality
document.addEventListener('DOMContentLoaded', function() {
  const mobileSliderGallery = document.querySelector('.mobile-slider-gallery');
  if (!mobileSliderGallery) return;

  const sliderList = mobileSliderGallery.querySelector('.product__media-list');
  const dots = mobileSliderGallery.querySelectorAll('.mobile-slider-dot');
  const slides = mobileSliderGallery.querySelectorAll('.product__media-item');
  
  if (!sliderList || !dots.length || !slides.length) return;

  let currentSlide = 0;
  const totalSlides = slides.length;

  // Update dots active state
  function updateDots(activeIndex) {
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  }

  // Go to specific slide with smooth scrolling
  function goToSlide(slideIndex) {
    // Handle looping
    if (slideIndex < 0) {
      slideIndex = totalSlides - 1;
    } else if (slideIndex >= totalSlides) {
      slideIndex = 0;
    }
    
    currentSlide = slideIndex;
    const slideWidth = slides[0].offsetWidth;
    sliderList.scrollTo({
      left: slideWidth * slideIndex,
      behavior: 'smooth'
    });
    updateDots(slideIndex);
  }

  // Add click event to dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
    });
  });

  // Listen to scroll events to update active dot
  let scrollTimeout;
  sliderList.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const slideWidth = slides[0].offsetWidth;
      const scrollLeft = sliderList.scrollLeft;
      const newCurrentSlide = Math.round(scrollLeft / slideWidth);
      
      if (newCurrentSlide !== currentSlide) {
        currentSlide = newCurrentSlide;
        updateDots(currentSlide);
      }
    }, 150);
  });

  // Add swipe/touch support for looping
  let startX = 0;
  let endX = 0;

  sliderList.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  sliderList.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    const difference = startX - endX;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(difference) > threshold) {
      if (difference > 0) {
        // Swipe left - next slide
        goToSlide(currentSlide + 1);
      } else {
        // Swipe right - previous slide
        goToSlide(currentSlide - 1);
      }
    }
  });

  // Add keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!mobileSliderGallery.contains(document.activeElement)) return;
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToSlide(currentSlide - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToSlide(currentSlide + 1);
    }
  });

  // Initialize
  updateDots(0);
});