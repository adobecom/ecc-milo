import { LIBS } from './scripts.js';
import { camelToSentenceCase } from './utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

/**
 * Centralized error manager for handling all error display patterns
 */
class ErrorManager {
  constructor(context = null) {
    this.defaultOptions = {
      variant: 'negative',
      timeout: 6000,
      showCloseButton: true,
    };
    this.context = context;
  }

  /**
   * Create a new error manager instance with a specific context
   * @param {Object} context - Props object or target element
   * @returns {ErrorManager} New error manager instance with context
   */
  static withContext(context) {
    return new ErrorManager(context);
  }

  /**
   * Get the toast area from the target element or fallback to a default
   * @param {Object} target - Target element or props object (optional if context is set)
   * @returns {HTMLElement} Toast area element
   */
  getToastArea(target = null) {
    const context = target || this.context;

    if (context?.targetEl?.querySelector('.toast-area')) {
      return context.targetEl.querySelector('.toast-area');
    }

    if (context?.el?.querySelector('.toast-area')) {
      return context.el.querySelector('.toast-area');
    }

    if (context?.querySelector?.('.toast-area')) {
      return context.querySelector('.toast-area');
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
   * @param {Object} resp - Response object with error
   * @param {Object} options - Additional options
   * @param {Object} target - Optional target override
   */
  handleErrorResponse(resp, options = {}, target = null) {
    if (!resp?.error) return;

    const context = target || this.context;
    const toastArea = this.getToastArea(context);
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
        this.handleConcurrencyError(resp, options, target);
      } else {
        this.createToast(errorMessage, toastArea, options);
      }
    }
  }

  /**
   * Handle concurrency errors (409 status)
   * @param {Object} resp - Response object
   * @param {Object} options - Additional options
   * @param {Object} target - Optional target override
   */
  handleConcurrencyError(resp, options = {}, target = null) {
    const context = target || this.context;
    const toastArea = this.getToastArea(context);
    const isEvent = resp.error.message.includes('Event update invalid');
    const isSeries = resp.error.message.includes('Series update invalid');

    const message = 'The item has been updated by a different session since your last save.';
    const url = new URL(window.location.href);

    if (isEvent) {
      const eventId = context?.eventDataResp?.eventId || context?.eventId;
      if (eventId) {
        url.searchParams.set('eventId', eventId);
      }
    } else if (isSeries) {
      const seriesId = context?.response?.seriesId || context?.seriesId;
      if (seriesId) {
        url.searchParams.set('seriesId', seriesId);
      }
    }

    const toast = this.createToast(message, toastArea, options);

    createTag('sp-button', {
      slot: 'action',
      variant: 'overBackground',
      href: url.toString(),
    }, 'See the latest version', { parent: toast });
  }

  /**
   * Handle simple error messages
   * @param {string} message - Error message
   * @param {Object} options - Toast options
   * @param {Object} target - Optional target override
   */
  showError(message, options = {}, target = null) {
    const context = target || this.context;
    const toastArea = this.getToastArea(context);
    this.createToast(message, toastArea, options);
  }

  /**
   * Handle success messages
   * @param {string} message - Success message
   * @param {Object} options - Toast options
   * @param {Object} target - Optional target override
   */
  showSuccess(message, options = {}, target = null) {
    const context = target || this.context;
    const toastArea = this.getToastArea(context);
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
   * @param {string} message - Info message
   * @param {Object} options - Toast options
   * @param {Object} target - Optional target override
   */
  showInfo(message, options = {}, target = null) {
    const context = target || this.context;
    const toastArea = this.getToastArea(context);
    this.createToast(message, toastArea, {
      variant: 'info',
      ...options,
    });
  }

  /**
   * Handle caught exceptions
   * @param {Error} error - Caught error
   * @param {Object} options - Toast options
   * @param {Object} target - Optional target override
   */
  handleException(error, options = {}, target = null) {
    const message = error.message || 'An unexpected error occurred. Please try again.';
    this.showError(message, options, target);
  }

  /**
   * Handle custom error events
   * @param {CustomEvent} event - Custom error event
   * @param {Object} target - Optional target override
   */
  handleCustomEvent(event, target = null) {
    const { error, message, options = {} } = event.detail;

    if (error) {
      this.handleErrorResponse({ error }, options, target);
    } else if (message) {
      this.showError(message, options, target);
    }
  }

  /**
   * Create a wrapped async function that automatically handles errors
   * @param {Function} fn - Async function to wrap
   * @param {Object} options - Error handling options
   * @param {Object} target - Optional target override
   * @returns {Function} Wrapped function
   */
  wrapAsyncFunction(fn, options = {}, target = null) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleException(error, options, target);
        throw error; // Re-throw to maintain original behavior
      }
    };
  }

  // Legacy compatibility methods - these maintain the old API
  /**
   * Legacy compatibility method for buildErrorMessage
   * @param {Object} props - Props object
   * @param {Object} resp - Response object
   */
  buildErrorMessage(props, resp) {
    this.handleErrorResponse(resp, {}, props);
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
        this.showSuccess(message, options, props);
        break;
      case 'negative':
        this.showError(message, options, props);
        break;
      case 'info':
      default:
        this.showInfo(message, options, props);
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
      this.handleCustomEvent(e, props);
    });

    element.addEventListener('show-success-toast', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.showSuccess(e.detail.message || 'Success!', e.detail, props);
    });
  }

  // Static methods for backward compatibility
  static getToastArea(target) {
    return new ErrorManager().getToastArea(target);
  }
}

// Create singleton instance
const errorManager = new ErrorManager();

// Export both the class and singleton instance
export { ErrorManager };
export default errorManager;
