// Advanced Animation System
// Provides sophisticated micro-interactions and smooth animations

class AnimationSystem {
  constructor() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.observers = new Map();
    this.animationQueue = [];
    this.isProcessing = false;
    
    this.init();
  }
  
  init() {
    this.setupIntersectionObserver();
    this.setupMutationObserver();
    this.addAnimationClasses();
    this.bindEvents();
    this.processExistingElements();
  }
  
  // Setup intersection observer for scroll-triggered animations
  setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.triggerEnterAnimation(entry.target);
        } else {
          this.triggerExitAnimation(entry.target);
        }
      });
    }, {
      threshold: [0.1, 0.5, 0.9],
      rootMargin: '50px 0px'
    });
  }
  
  // Setup mutation observer for dynamically added elements
  setupMutationObserver() {
    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.processElement(node);
          }
        });
      });
    });
    
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Add CSS animation classes
  addAnimationClasses() {
    const style = document.createElement('style');
    style.textContent = `
      /* Base animation styles */
      .animate-element {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .reduced-motion .animate-element {
        transition: none !important;
        animation: none !important;
      }
      
      /* Fade animations */
      .fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
      }
      
      .fade-in.visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .fade-up {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.5s ease-out, transform 0.5s ease-out;
      }
      
      .fade-up.visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .fade-left {
        opacity: 0;
        transform: translateX(-30px);
        transition: opacity 0.5s ease-out, transform 0.5s ease-out;
      }
      
      .fade-left.visible {
        opacity: 1;
        transform: translateX(0);
      }
      
      .fade-right {
        opacity: 0;
        transform: translateX(30px);
        transition: opacity 0.5s ease-out, transform 0.5s ease-out;
      }
      
      .fade-right.visible {
        opacity: 1;
        transform: translateX(0);
      }
      
      /* Scale animations */
      .scale-in {
        opacity: 0;
        transform: scale(0.9);
        transition: opacity 0.4s ease-out, transform 0.4s ease-out;
      }
      
      .scale-in.visible {
        opacity: 1;
        transform: scale(1);
      }
      
      /* Stagger animations for lists */
      .stagger-item {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.4s ease-out, transform 0.4s ease-out;
      }
      
      .stagger-item.visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      /* Hover animations */
      .hover-lift {
        transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
      }
      
      .hover-lift:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }
      
      .hover-scale {
        transition: transform 0.2s ease-out;
      }
      
      .hover-scale:hover {
        transform: scale(1.02);
      }
      
      /* Button press animations */
      .btn-press {
        transition: transform 0.1s ease-out;
      }
      
      .btn-press:active {
        transform: scale(0.98);
      }
      
      /* Loading animations */
      .pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: .5;
        }
      }
      
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
      }
      
      @keyframes skeleton-loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
      
      /* Modal animations */
      .modal-enter {
        opacity: 0;
        transform: scale(0.95) translateY(-20px);
        transition: opacity 0.3s ease-out, transform 0.3s ease-out;
      }
      
      .modal-enter.visible {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      
      .modal-backdrop {
        opacity: 0;
        transition: opacity 0.3s ease-out;
      }
      
      .modal-backdrop.visible {
        opacity: 1;
      }
      
      /* Notification animations */
      .notification-slide {
        transform: translateX(100%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .notification-slide.visible {
        transform: translateX(0);
      }
      
      /* Form focus animations */
      .input-focus {
        transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out;
      }
      
      .input-focus:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      /* Navigation animations */
      .nav-slide {
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .nav-slide.visible {
        transform: translateX(0);
      }
      
      /* Progress animations */
      .progress-bar {
        width: 0%;
        transition: width 0.5s ease-out;
      }
      
      /* Ripple effect */
      .ripple {
        position: relative;
        overflow: hidden;
      }
      
      .ripple::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
      }
      
      .ripple:active::before {
        width: 300px;
        height: 300px;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Bind animation events
  bindEvents() {
    // Add button press animations
    document.addEventListener('click', (e) => {
      if (e.target.matches('.btn, button')) {
        this.addButtonPressAnimation(e.target);
      }
    });
    
    // Add form focus animations
    document.addEventListener('focus', (e) => {
      if (e.target.matches('input, textarea, select')) {
        e.target.classList.add('input-focus');
      }
    }, true);
    
    // Add hover animations to cards
    document.addEventListener('mouseenter', (e) => {
      if (e.target.matches('.card, .hover-lift')) {
        e.target.classList.add('hover-lift');
      }
    }, true);
  }
  
  // Process existing elements on page load
  processExistingElements() {
    // Add fade animations to cards
    document.querySelectorAll('.card').forEach((card, index) => {
      card.classList.add('fade-up');
      setTimeout(() => {
        this.intersectionObserver.observe(card);
      }, index * 50);
    });
    
    // Add stagger animations to lists
    document.querySelectorAll('.stagger-container').forEach(container => {
      const items = container.querySelectorAll('.stagger-item');
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('visible');
        }, index * 100);
      });
    });
    
    // Add animations to buttons
    document.querySelectorAll('.btn').forEach(btn => {
      btn.classList.add('btn-press', 'ripple');
    });
  }
  
  // Process individual elements
  processElement(element) {
    if (element.matches('.card')) {
      element.classList.add('fade-up');
      this.intersectionObserver.observe(element);
    }
    
    if (element.matches('.btn')) {
      element.classList.add('btn-press', 'ripple');
    }
    
    if (element.matches('input, textarea, select')) {
      element.classList.add('input-focus');
    }
  }
  
  // Trigger enter animations
  triggerEnterAnimation(element) {
    if (!this.reducedMotion) {
      element.classList.add('visible');
    }
  }
  
  // Trigger exit animations
  triggerExitAnimation(element) {
    if (!this.reducedMotion) {
      element.classList.remove('visible');
    }
  }
  
  // Add button press animation
  addButtonPressAnimation(button) {
    if (!this.reducedMotion) {
      button.classList.add('btn-press');
      
      // Create ripple effect
      if (button.classList.contains('ripple')) {
        this.createRippleEffect(button);
      }
    }
  }
  
  // Create ripple effect
  createRippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple-effect');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      transform: scale(0);
      animation: ripple-animation 0.6s linear;
      pointer-events: none;
    `;
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
  
  // Animate modal appearance
  animateModal(modal, show = true) {
    const backdrop = modal.querySelector('.modal-backdrop');
    const content = modal.querySelector('.modal-content');
    
    if (show) {
      modal.style.display = 'block';
      requestAnimationFrame(() => {
        backdrop?.classList.add('visible');
        content?.classList.add('visible');
      });
    } else {
      backdrop?.classList.remove('visible');
      content?.classList.remove('visible');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  }
  
  // Animate notifications
  animateNotification(notification, show = true) {
    if (show) {
      notification.classList.add('notification-slide');
      requestAnimationFrame(() => {
        notification.classList.add('visible');
      });
    } else {
      notification.classList.remove('visible');
      setTimeout(() => {
        notification.remove();
      }, 400);
    }
  }
  
  // Animate page transitions
  animatePageTransition(newContent) {
    const main = document.querySelector('main');
    
    // Fade out current content
    main.style.opacity = '0';
    main.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      main.innerHTML = newContent;
      main.style.opacity = '1';
      main.style.transform = 'translateY(0)';
      
      // Process new elements
      this.processExistingElements();
    }, 200);
  }
  
  // Animate progress bars
  animateProgressBar(progressBar, percentage) {
    progressBar.style.width = '0%';
    requestAnimationFrame(() => {
      progressBar.style.width = percentage + '%';
    });
  }
  
  // Animate loading states
  showLoadingAnimation(element) {
    element.classList.add('skeleton');
    element.setAttribute('aria-busy', 'true');
  }
  
  hideLoadingAnimation(element) {
    element.classList.remove('skeleton');
    element.removeAttribute('aria-busy');
  }
  
  // Animate form validation
  animateFormValidation(input, isValid) {
    if (isValid) {
      input.classList.remove('border-red-500');
      input.classList.add('border-green-500');
    } else {
      input.classList.remove('border-green-500');
      input.classList.add('border-red-500');
      
      // Shake animation for invalid input
      if (!this.reducedMotion) {
        input.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          input.style.animation = '';
        }, 500);
      }
    }
  }
  
  // Cleanup
  destroy() {
    this.intersectionObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.observers.clear();
  }
}

// Add shake animation keyframes
const shakeKeyframes = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

const shakeStyle = document.createElement('style');
shakeStyle.textContent = shakeKeyframes;
document.head.appendChild(shakeStyle);

// Initialize animation system
window.animationSystem = new AnimationSystem();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationSystem;
}