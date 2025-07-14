import { LIBS } from './scripts.js';
import { camelToSentenceCase } from './utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

/**
 * Centralized error manager for handling all error display patterns
 */
class ErrorManager {
  constructor() {
    this.defaultOptions = {
      variant: 'negative',
      timeout: 6000,
      showCloseButton: true,
    };
  }

  /**
   * Get the toast area from the target element or fallback to a default
   * @param {Object} target - Target element or props object
   * @returns {HTMLElement} Toast area element
   */
  static getToastArea(target) {
    if (target?.targetEl?.querySelector('.toast-area')) {
      return target.targetEl.querySelector('.toast-area');
    }

    if (target?.el?.querySelector('.toast-area')) {
      return target.el.querySelector('.toast-area');
    }

    if (target?.querySelector?.('.toast-area')) {
      return target.querySelector('.toast-area');
    }

    // Fallback to document body if no toast area found
    return document.body;
  }

  /**
   * Create a toast element with the given message and options
   * @param {string} message - Error message to display
   * @param {HTMLElement} toastArea - Target toast area
   * @param {Object} options - Toast options
   * @returns {HTMLElement} Created toast element
   */
  createToast(message, toastArea, options = {}) {
    const toastOptions = { ...this.defaultOptions, ...options };

    const toast = createTag('sp-toast', {
      open: true,
      ...toastOptions,
    }, message, { parent: toastArea });

    toast.addEventListener('close', (e) => {
      e.stopPropagation();
      toast.remove();
    }, { once: true });

    return toast;
  }

  /**
   * Handle error response object (from API calls)
   * @param {Object} target - Target element or props object
   * @param {Object} resp - Response object with error
   * @param {Object} options - Additional options
   */
  handleErrorResponse(target, resp, options = {}) {
    if (!resp?.error) return;

    const toastArea = this.getToastArea(target);
    const messages = [];
    const errorBag = resp.error.errors;
    const errorMessage = resp.error.message;

    // Handle validation errors (error bag)
    if (errorBag) {
      errorBag.forEach((error) => {
        const errorPathSegments = error.path.split('/');
        const text = `${camelToSentenceCase(errorPathSegments[errorPathSegments.length - 1])} ${error.message}`;
        messages.push(text);
      });

             messages.forEach((msg, i) => {
         this.createToast(msg, toastArea, {
           timeout: 6000 + (i * 3000),
           ...options,
         });
       });
     } else if (errorMessage) {
       // Handle specific error types
       if (resp.status === 409
           || errorMessage.includes('Event update invalid')
           || errorMessage.includes('Series update invalid')) {
         this.handleConcurrencyError(target, resp, options);
       } else {
         this.createToast(errorMessage, toastArea, options);
       }
     }
  }

  /**
   * Handle concurrency errors (409 status)
   * @param {Object} target - Target element or props object
   * @param {Object} resp - Response object
   * @param {Object} options - Additional options
   */
  handleConcurrencyError(target, resp, options = {}) {
    const toastArea = this.getToastArea(target);
    const isEvent = resp.error.message.includes('Event update invalid');
    const isSeries = resp.error.message.includes('Series update invalid');
    
    let message = 'The item has been updated by a different session since your last save.';
    let url = new URL(window.location.href);
    
    if (isEvent) {
      const eventId = target?.eventDataResp?.eventId || target?.eventId;
      if (eventId) {
        url.searchParams.set('eventId', eventId);
      }
    } else if (isSeries) {
      const seriesId = target?.response?.seriesId || target?.seriesId;
      if (seriesId) {
        url.searchParams.set('seriesId', seriesId);
      }
    }

    const toast = this.createToast(message, options, toastArea);
    
    createTag('sp-button', {
      slot: 'action',
      variant: 'overBackground',
      href: url.toString(),
    }, 'See the latest version', { parent: toast });
  }

  /**
   * Handle simple error messages
   * @param {Object} target - Target element or props object
   * @param {string} message - Error message
   * @param {Object} options - Toast options
   */
  showError(target, message, options = {}) {
    const toastArea = this.getToastArea(target);
    this.createToast(message, options, toastArea);
  }

  /**
   * Handle success messages
   * @param {Object} target - Target element or props object
   * @param {string} message - Success message
   * @param {Object} options - Toast options
   */
  showSuccess(target, message, options = {}) {
    const toastArea = this.getToastArea(target);
    const toast = this.createToast(message, toastArea, {
      variant: 'positive',
      ...options,
    });

    // Handle action button if provided
    if (options.actionButton) {
      const { text, href, variant = 'overBackground', treatment = 'outline' } = options.actionButton;
      createTag('sp-button', {
        slot: 'action',
        variant,
        treatment,
        href,
      }, text, { parent: toast });
    }
  }

  /**
   * Handle info messages
   * @param {Object} target - Target element or props object
   * @param {string} message - Info message
   * @param {Object} options - Toast options
   */
  showInfo(target, message, options = {}) {
    const toastArea = this.getToastArea(target);
    this.createToast(message, {
      variant: 'info',
      ...options,
    }, toastArea);
  }

  /**
   * Handle caught exceptions
   * @param {Object} target - Target element or props object
   * @param {Error} error - Caught error
   * @param {Object} options - Toast options
   */
  handleException(target, error, options = {}) {
    const message = error.message || 'An unexpected error occurred. Please try again.';
    this.showError(target, message, options);
  }

  /**
   * Handle custom error events
   * @param {Object} target - Target element or props object
   * @param {CustomEvent} event - Custom error event
   */
  handleCustomEvent(target, event) {
    const { error, message, options = {} } = event.detail;
    
    if (error) {
      this.handleErrorResponse(target, { error }, options);
    } else if (message) {
      this.showError(target, message, options);
    }
  }

  /**
   * Legacy compatibility method for buildErrorMessage
   * @param {Object} props - Props object
   * @param {Object} resp - Response object
   */
  buildErrorMessage(props, resp) {
    this.handleErrorResponse(props, resp);
  }

  /**
   * Legacy compatibility method for showToast
   * @param {Object} props - Props object
   * @param {string} message - Message to show
   * @param {Object} options - Toast options
   */
  showToast(props, message, options = {}) {
    const variant = options.variant || 'info';
    
    switch (variant) {
      case 'positive':
        this.showSuccess(props, message, options);
        break;
      case 'negative':
        this.showError(props, message, options);
        break;
      case 'info':
      default:
        this.showInfo(props, message, options);
        break;
    }
  }

  /**
   * Initialize error event listeners on an element
   * @param {HTMLElement} element - Element to attach listeners to
   * @param {Object} props - Props object for context
   */
  initErrorListeners(element, props) {
    element.addEventListener('show-error-toast', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.handleCustomEvent(props, e);
    });

    element.addEventListener('show-success-toast', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.showSuccess(props, e.detail.message || 'Success!', e.detail);
    });
  }

  /**
   * Create a wrapped async function that automatically handles errors
   * @param {Function} fn - Async function to wrap
   * @param {Object} target - Target for error display
   * @param {Object} options - Error handling options
   * @returns {Function} Wrapped function
   */
  wrapAsyncFunction(fn, target, options = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleException(target, error, options);
        throw error; // Re-throw to maintain original behavior
      }
    };
  }
}

// Create singleton instance
const errorManager = new ErrorManager();

// Export both the class and singleton instance
export { ErrorManager };
export default errorManager; 
