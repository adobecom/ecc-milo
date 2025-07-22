import { LIBS } from './scripts.js';
import { camelToSentenceCase } from './utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

/**
 * Centralized error manager for handling all error display patterns
 */
export default class ErrorManager {
  constructor(context) {
    this.options = {
      variant: 'negative',
      timeout: 6000,
      showCloseButton: true,
    };
    this.context = context;
    this.postArea = this.getPostArea();
  }

  getPostArea() {
    if (this.context?.targetEl?.querySelector('.toast-area')) {
      return this.context.targetEl.querySelector('.toast-area');
    }

    if (this.context?.el?.querySelector('.toast-area')) {
      return this.context.el.querySelector('.toast-area');
    }

    if (this.context?.querySelector?.('.toast-area')) {
      return this.context.querySelector('.toast-area');
    }

    return document.body.querySelector('.toast-area') || document.body;
  }

  /**
   * Create a toast element with the given message and options
   * @param {string} message - Error message to display
   * @param {HTMLElement} postArea - Target toast area
   * @param {Object} options - Toast options
   * @returns {HTMLElement} Created toast element
   */
  createToast(message, postArea, options = {}) {
    const toastOptions = { ...this.options, ...options };

    const toast = createTag('sp-toast', {
      open: true,
      ...toastOptions,
    }, message, { parent: postArea });

    toast.addEventListener('close', (e) => {
      e.stopPropagation();
      toast.remove();
    }, { once: true });

    return toast;
  }

  /**
   * Handle error response object (from API calls)
   * @param {Object} resp - Response object with error or direct error object
   * @param {Object} options - Additional options
   * @param {Object} target - Optional target override
   */
  handleErrorResponse(resp, options = {}) {
    // Handle both response objects with error property and direct error objects
    const error = resp.error || resp;
    const messages = [];
    const errorBag = error.errors;
    const errorMessage = error.message;

    // Handle validation errors (error bag)
    if (errorBag) {
      errorBag.forEach((err) => {
        const errorPathSegments = err.path.split('/');
        const text = `${camelToSentenceCase(errorPathSegments[errorPathSegments.length - 1])} ${err.message}`;
        messages.push(text);
      });

      messages.forEach((msg, i) => {
        this.createToast(msg, this.postArea, {
          timeout: 6000 + (i * 3000),
          ...options,
        });
      });
    } else if (errorMessage) {
      // Handle specific error types
      if (resp.status === 409 || error.status === 409) {
        this.handleConcurrencyError(error, options);
      } else {
        this.createToast(errorMessage, this.postArea, options);
      }
    }
  }

  /**
   * Handle concurrency errors (409 status)
   * @param {Object} resp - Response object
   * @param {Object} options - Additional options
   * @param {Object} target - Optional target override
   */
  handleConcurrencyError(error, options = {}) {
    const isEvent = error.message.includes('Event update invalid');
    const isSeries = error.message.includes('Series update invalid');

    const message = 'The item has been updated by a different session since your last save.';
    const url = new URL(window.location.href);

    if (isEvent) {
      const eventId = this.context?.eventDataResp?.eventId || this.context?.eventId;
      if (eventId) {
        url.searchParams.set('eventId', eventId);
      }
    } else if (isSeries) {
      const seriesId = this.context?.response?.seriesId || this.context?.seriesId;
      if (seriesId) {
        url.searchParams.set('seriesId', seriesId);
      }
    }

    const toast = this.createToast(message, this.postArea, options);

    createTag('sp-button', {
      slot: 'action',
      href: url.toString(),
    }, 'See the latest version', { parent: toast });
  }

  /**
   * Handle simple error messages
   * @param {string} message - Error message
   * @param {Object} options - Toast options
   * @param {Object} target - Optional target override
   * @returns {HTMLElement} Created toast element
   */
  showError(message, options = {}) {
    return this.createToast(message, this.postArea, options);
  }

  /**
   * Handle success messages
   * @param {string} message - Success message
   * @param {Object} options - Toast options
   * @param {Object} target - Optional target override
   * @returns {HTMLElement} Created toast element
   */
  showSuccess(message, options = {}) {
    const toast = this.createToast(message, this.postArea, {
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

    return toast;
  }

  /**
   * Handle info messages
   * @param {string} message - Info message
   * @param {Object} options - Toast options
   * @param {Object} target - Optional target override
   * @returns {HTMLElement} Created toast element
   */
  showInfo(message, options = {}) {
    return this.createToast(message, this.postArea, {
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
  handleException(error, options = {}) {
    const message = error.message || 'An unexpected error occurred. Please try again.';
    this.showError(message, options);
  }

  /**
   * Handle custom error events
   * @param {CustomEvent} event - Custom error event
   * @param {Object} target - Optional target override
   */
  handleCustomEvent(event) {
    const { error, message, options = {} } = event.detail;

    if (error) {
      this.handleErrorResponse({ error }, options);
    } else if (message) {
      this.showError(message, options);
    }
  }

  /**
   * Create a wrapped async function that automatically handles errors
   * @param {Function} fn - Async function to wrap
   * @param {Object} options - Error handling options
   * @param {Object} target - Optional target override
   * @returns {Function} Wrapped function
   */
  wrapAsyncFunction(fn, options = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleException(error, options);
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
}
