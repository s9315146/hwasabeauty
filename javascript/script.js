/**
 * 화사뷰티 (HWASA BEAUTY) - Pure JavaScript Interaction Module
 */

// List of images inside the image/hero directory to display in the carousel
const HERO_IMAGES = [
  './image/hero/01.jpg',
  './image/hero/02.jpg',
  './image/hero/03.jpg',
  './image/hero/04.jpg',
  './image/hero/05.jpg',
  './image/hero/06.jpg'
];

document.addEventListener('DOMContentLoaded', () => {
  renderHeroCarousel();
  initCarousel();
  initBeforeAfterSlider();
  initFaqAccordion();
});

/* Dynamically render hero section carousel slides and dot indicators */
function renderHeroCarousel() {
  const slidesContainer = document.getElementById('hero-slides-container');
  const dotsContainer = document.getElementById('hero-dots-container');
  if (!slidesContainer || !dotsContainer) return;

  slidesContainer.innerHTML = HERO_IMAGES.map((imgSrc, index) => {
    const isActive = index === 0;
    return `
      <div class="carousel-slide absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}">
        <img src="${imgSrc}" alt="화사뷰티 ${String(index + 1).padStart(2, '0')}" class="w-full h-full object-cover brightness-[1.08] saturate-[1.06] contrast-[1.01]" />
      </div>
    `;
  }).join('');

  dotsContainer.innerHTML = HERO_IMAGES.map((_, index) => {
    const isActive = index === 0;
    return `
      <button onclick="handleDotClick(${index})" class="dot-btn ${isActive ? 'w-6 bg-white' : 'w-2 bg-white/50'} h-2 rounded-full transition-all" aria-label="슬라이드 ${index + 1}"></button>
    `;
  }).join('');
}

/* Drawer Navigation Toggle */
function toggleDrawer(show) {
  const drawer = document.getElementById('drawer');
  if (!drawer) return;
  if (show) {
    drawer.classList.remove('hidden');
    drawer.classList.add('flex');
  } else {
    drawer.classList.add('hidden');
    drawer.classList.remove('flex');
  }
}

/* Modal Management */
function openModal(id, preselectService = '') {
  const modal = document.getElementById(id);
  if (!modal) return;
  
  if (preselectService && id === 'bookingModal') {
    const serviceSelect = document.getElementById('bookingServiceSelect');
    if (serviceSelect) {
      for (let option of serviceSelect.options) {
        if (option.text.includes(preselectService)) {
          option.selected = true;
          break;
        }
      }
    }
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = '';
}

/* Hero Carousel Slider */
let currentSlide = 0;
let carouselTimer = null;

function initCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  if (!slides.length) return;
  setSlide(0);
  resetCarouselTimer();
  initHeroTouch();
}

function resetCarouselTimer() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
  }
  const slides = document.querySelectorAll('.carousel-slide');
  if (!slides.length) return;
  carouselTimer = setInterval(() => {
    const next = (currentSlide + 1) % slides.length;
    setSlide(next);
  }, 5000);
}

function handleDotClick(index) {
  setSlide(index);
  resetCarouselTimer();
}

function initHeroTouch() {
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;

  let startX = 0;
  let startY = 0;
  let isThresholdMet = false;

  heroSection.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isThresholdMet = false;
  }, { passive: true });

  heroSection.addEventListener('touchmove', (e) => {
    if (isThresholdMet) return;

    const diffX = e.touches[0].clientX - startX;
    const diffY = e.touches[0].clientY - startY;

    // Check if horizontal swipe is dominant and exceeds threshold of 50px
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      isThresholdMet = true;
      const slides = document.querySelectorAll('.carousel-slide');
      if (!slides.length) return;

      if (diffX < 0) {
        // Swipe left -> Next slide
        const next = (currentSlide + 1) % slides.length;
        setSlide(next);
        resetCarouselTimer();
      } else {
        // Swipe right -> Previous slide
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        setSlide(prev);
        resetCarouselTimer();
      }
    }
  }, { passive: true });
}

function setSlide(index) {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.dot-btn');
  if (!slides.length) return;

  slides.forEach((slide, i) => {
    if (i === index) {
      slide.classList.remove('opacity-0', 'z-0');
      slide.classList.add('opacity-100', 'z-10');
      if (dots[i]) {
        dots[i].classList.add('w-6', 'bg-white');
        dots[i].classList.remove('w-2', 'bg-white/50');
      }
    } else {
      slide.classList.add('opacity-0', 'z-0');
      slide.classList.remove('opacity-100', 'z-10');
      if (dots[i]) {
        dots[i].classList.remove('w-6', 'bg-white');
        dots[i].classList.add('w-2', 'bg-white/50');
      }
    }
  });
  currentSlide = index;
}

/* Before & After Drag Comparison Slider */
function initBeforeAfterSlider() {
  const container = document.getElementById('baContainer');
  const overlay = document.getElementById('beforeOverlay');
  const handle = document.getElementById('baHandle');
  if (!container || !overlay || !handle) return;

  let isDragging = false;

  const updatePosition = (clientX) => {
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;
    
    const percentage = (x / rect.width) * 100;
    overlay.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;
  };

  const startDragging = (e) => {
    isDragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    updatePosition(clientX);
  };

  const stopDragging = () => {
    isDragging = false;
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    updatePosition(clientX);
  };

  container.addEventListener('mousedown', startDragging);
  container.addEventListener('touchstart', startDragging, { passive: true });

  window.addEventListener('mouseup', stopDragging);
  window.addEventListener('touchend', stopDragging);

  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: true });
}

/* FAQ Accordion Toggle */
function initFaqAccordion() {
  const faqButtons = document.querySelectorAll('.faq-btn');
  faqButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector('.faq-icon');
      
      const isOpen = !content.classList.contains('hidden');
      
      // Close all other FAQs
      document.querySelectorAll('.faq-content').forEach((c) => c.classList.add('hidden'));
      document.querySelectorAll('.faq-icon').forEach((i) => i.classList.remove('rotate-180'));

      if (!isOpen) {
        content.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
      }
    });
  });
}

/* Copy Address Utility */
function copyAddress() {
  const addressText = '서울특별시 강남구 테헤란로 123, 뷰티타워 4층';
  navigator.clipboard.writeText(addressText)
    .then(() => {
      alert('도로명 주소가 클립보드에 복사되었습니다.\n지도 앱에 붙여넣어 바로 찾아오실 수 있습니다.');
    })
    .catch(() => {
      alert(`주소: ${addressText}`);
    });
}
