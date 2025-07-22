import { LIBS } from './scripts.js';
import { camelToSentenceCase, getToastArea } from './utils.js';
import ToastManager from './toast-manager.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

/**
 * Error Handler for handling complex error scenarios
 * Uses ToastManager internally for toast creation
 */
export default class ErrorManager {
  constructor(context) {
    // Extract toast area from context
    const toastArea = getToastArea(context);

    // Use composition - ErrorManager has a ToastManager
    this.toastManager = new ToastManager(toastArea);

    // Store the full context for error handling
    this.context = context;
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
        this.toastManager.createToast(msg, this.toastManager.toastArea, {
          timeout: 6000 + (i * 3000),
          ...options,
        });
      });
    } else if (errorMessage) {
      // Handle specific error types
      if (resp.status === 409 || error.status === 409) {
        this.handleConcurrencyError(error, options);
      } else {
        this.toastManager.createToast(errorMessage, this.toastManager.toastArea, options);
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

    const toast = this.toastManager.createToast(message, this.toastManager.toastArea, options);

    createTag('sp-button', {
      slot: 'action',
      href: url.toString(),
    }, 'See the latest version', { parent: toast });
  }
}
