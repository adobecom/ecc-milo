import { LIBS } from './scripts.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

/**
 * Toast Manager for handling all toast display patterns
 */
export default class ToastManager {
  constructor(toastArea) {
    this.options = {
      variant: 'info',
      timeout: 6000,
      showCloseButton: true,
    };
    this.toastArea = toastArea || document.body;
  }

  /**
   * Create a toast element with the given message and options
   * @param {string} message - Message to display
   * @param {HTMLElement} postArea - Target toast area (optional, uses default if not provided)
   * @param {Object} options - Toast options
   * @returns {HTMLElement} Created toast element
   */
  createToast(message, postArea = this.toastArea, options = {}) {
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
   * Show a basic toast message
   * @param {string} message - Message to show
   * @param {Object} options - Toast options
   * @returns {HTMLElement} Created toast element
   */
  show(message, options = {}) {
    return this.createToast(message, this.toastArea, options);
  }

  /**
   * Show an info toast
   * @param {string} message - Info message
   * @param {Object} options - Toast options
   * @returns {HTMLElement} Created toast element
   */
  showInfo(message, options = {}) {
    return this.createToast(message, this.toastArea, {
      variant: 'info',
      ...options,
    });
  }

  /**
   * Show a success toast
   * @param {string} message - Success message
   * @param {Object} options - Toast options
   * @returns {HTMLElement} Created toast element
   */
  showSuccess(message, options = {}) {
    const toast = this.createToast(message, this.toastArea, {
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
   * Show an error toast
   * @param {string} message - Error message
   * @param {Object} options - Toast options
   * @returns {HTMLElement} Created toast element
   */
  showError(message, options = {}) {
    return this.createToast(message, this.toastArea, {
      variant: 'negative',
      ...options,
    });
  }

  /**
   * Show a warning toast
   * @param {string} message - Warning message
   * @param {Object} options - Toast options
   * @returns {HTMLElement} Created toast element
   */
  showWarning(message, options = {}) {
    return this.createToast(message, this.toastArea, {
      variant: 'warning',
      ...options,
    });
  }

  /**
   * Create a toast with custom action button
   * @param {string} message - Message to display
   * @param {Object} actionButton - Action button configuration
   * @param {Object} options - Toast options
   * @returns {HTMLElement} Created toast element
   */
  showWithAction(message, actionButton, options = {}) {
    return this.showSuccess(message, { ...options, actionButton });
  }

  /**
   * Initialize toast event listeners on an element
   * @param {HTMLElement} element - Element to attach listeners to
   */
  initToastListeners(element) {
    element.addEventListener('show-toast', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const { message, options = {} } = e.detail;
      this.show(message, options);
    });

    element.addEventListener('show-info-toast', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.showInfo(e.detail.message || 'Info', e.detail);
    });

    element.addEventListener('show-success-toast', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.showSuccess(e.detail.message || 'Success!', e.detail);
    });

    element.addEventListener('show-error-toast', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.showError(e.detail.message || 'Error occurred', e.detail);
    });

    element.addEventListener('show-warning-toast', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.showWarning(e.detail.message || 'Warning', e.detail);
    });
  }
}
