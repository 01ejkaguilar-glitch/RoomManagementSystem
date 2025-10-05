/**
 * Modal Management System
 * Handles opening, closing, and managing modal interactions
 */

// Global modal functions
window.modalSystem = {
  // Open a modal
  openModal: function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      
      // Add animation classes
      setTimeout(() => {
        modal.querySelector('.modal-backdrop').classList.add('opacity-100');
        modal.querySelector('.modal-content').classList.add('scale-100', 'opacity-100');
      }, 10);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus first input if available
      const firstInput = modal.querySelector('input, textarea, select');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
      
      // Add escape key listener
      this.addEscapeListener(modalId);
    }
  },
  
  // Close a modal
  closeModal: function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      // Add closing animation
      modal.querySelector('.modal-backdrop').classList.remove('opacity-100');
      modal.querySelector('.modal-content').classList.remove('scale-100', 'opacity-100');
      
      // Hide modal after animation
      setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Clear form if exists
        const form = modal.querySelector('form');
        if (form) {
          form.reset();
          this.clearFormErrors(form);
        }
      }, 200);
      
      // Remove escape key listener
      this.removeEscapeListener();
    }
  },
  
  // Add escape key functionality
  addEscapeListener: function(modalId) {
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal(modalId);
      }
    };
    document.addEventListener('keydown', this.escapeHandler);
  },
  
  // Remove escape key listener
  removeEscapeListener: function() {
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }
  },
  
  // Clear form validation errors
  clearFormErrors: function(form) {
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.border-red-500').forEach(el => {
      el.classList.remove('border-red-500');
      el.classList.add('border-gray-300');
    });
  },
  
  // Show form validation errors
  showFormErrors: function(formId, errors) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // Clear existing errors
    this.clearFormErrors(form);
    
    // Show new errors
    Object.keys(errors).forEach(fieldName => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      const errorMessage = errors[fieldName];
      
      if (field) {
        // Style the field
        field.classList.remove('border-gray-300');
        field.classList.add('border-red-500');
        
        // Add error message
        const errorEl = document.createElement('p');
        errorEl.className = 'error-message text-red-500 text-xs mt-1';
        errorEl.textContent = errorMessage;
        field.parentNode.appendChild(errorEl);
      }
    });
  },
  
  // Submit form via AJAX
  submitForm: function(formId, callback) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const formData = new FormData(form);
    const url = form.action;
    const method = form.method || 'POST';
    
    // Show loading state
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
    
    fetch(url, {
      method: method,
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Close modal and refresh page or update UI
        this.closeModal(form.closest('.modal').id);
        if (callback) callback(data);
        else location.reload();
      } else {
        // Show validation errors
        if (data.errors) {
          this.showFormErrors(formId, data.errors);
        }
      }
    })
    .catch(error => {
      console.error('Form submission error:', error);
      alert('An error occurred. Please try again.');
    })
    .finally(() => {
      // Restore button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  }
};

// Make functions globally available
window.openModal = window.modalSystem.openModal.bind(window.modalSystem);
window.closeModal = window.modalSystem.closeModal.bind(window.modalSystem);
window.submitForm = window.modalSystem.submitForm.bind(window.modalSystem);

// Auto-initialize modals on page load
document.addEventListener('DOMContentLoaded', function() {
  // Add initial styling to modals
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
    
    // Add initial classes for animations
    const backdrop = modal.querySelector('.modal-backdrop');
    const content = modal.querySelector('.modal-content');
    
    if (backdrop) {
      backdrop.classList.add('opacity-0', 'transition-opacity', 'duration-200');
    }
    if (content) {
      content.classList.add('scale-95', 'opacity-0', 'transition-all', 'duration-200');
    }
  });
});