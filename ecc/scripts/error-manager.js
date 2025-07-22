import { LIBS } from './scripts.js';
import { camelToSentenceCase, getToastArea } from './utils.js';
import ToastManager from './toast-manager.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

/**
 * Error Manager for handling all error display patterns
 * Extends ToastManager to provide error-specific functionality
 */
export default class ErrorManager extends ToastManager {
  constructor(context) {
    // Extract toast area from context before calling super()
    const toastArea = getToastArea(context);
    super(toastArea);

    // Store the full context for error handling
    this.context = context;

    // Override default options for error manager
    this.options = {
      variant: 'negative',
      timeout: 6000,
      showCloseButton: true,
    };
  }

  /**
   * Handle error response object (from API calls)
   * @param {Object} resp - Response object with error or direct error object
   * @param {Object} options - Additional options
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
        this.createToast(msg, this.toastArea, {
          timeout: 6000 + (i * 3000),
          ...options,
        });
      });
    } else if (errorMessage) {
      // Handle specific error types
      if (resp.status === 409 || error.status === 409) {
        this.handleConcurrencyError(error, options);
      } else {
        this.createToast(errorMessage, this.toastArea, options);
      }
    }
  }

  /**
   * Handle concurrency errors (409 status)
   * @param {Object} error - Error object
   * @param {Object} options - Additional options
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

    const toast = this.createToast(message, this.toastArea, options);

    createTag('sp-button', {
      slot: 'action',
      href: url.toString(),
    }, 'See the latest version', { parent: toast });
  }
}
