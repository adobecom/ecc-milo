import { expect } from '@esm-bundle/chai';
import ToastManager from '../../ecc/scripts/toast-manager.js';

describe('ToastManager', () => {
  let testElement;
  let toastArea;
  let spTheme;
  let toastManager;

  beforeEach(() => {
    // Create test DOM structure
    testElement = document.createElement('div');
    spTheme = document.createElement('sp-theme');
    spTheme.className = 'toast-area';
    toastArea = document.createElement('div');
    toastArea.className = 'toast-area';
    spTheme.appendChild(toastArea);
    testElement.appendChild(spTheme);
    document.body.appendChild(testElement);

    // Create toast manager for testing - pass the toast area directly
    toastManager = new ToastManager(spTheme);
  });

  afterEach(() => {
    document.body.removeChild(testElement);
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(toastManager.options.variant).to.equal('info');
      expect(toastManager.options.timeout).to.equal(6000);
      expect(toastManager.options.showCloseButton).to.be.true;
    });

    it('should find toast area from context', () => {
      expect(toastManager.toastArea).to.equal(spTheme);
    });
  });

  describe('createToast', () => {
    it('should create a toast with default options', () => {
      const toast = toastManager.createToast('Test message', toastArea);
      expect(toast.tagName.toLowerCase()).to.equal('sp-toast');
      expect(toast.open === true || toast.getAttribute('open') === 'true').to.be.true;
      expect(toast.variant || toast.getAttribute('variant')).to.equal('info');
      expect(Number(toast.timeout || toast.getAttribute('timeout'))).to.equal(6000);
    });

    it('should create a toast with custom options', () => {
      const options = {
        variant: 'positive',
        timeout: 10000,
        showCloseButton: false,
      };
      const toast = toastManager.createToast('Test message', toastArea, options);
      expect(toast.variant || toast.getAttribute('variant')).to.equal('positive');
      expect(Number(toast.timeout || toast.getAttribute('timeout'))).to.equal(10000);
    });

    it('should add close event listener', () => {
      const toast = toastManager.createToast('Test message', toastArea);
      const removeSpy = { called: false };
      const originalRemove = toast.remove;
      toast.remove = () => {
        removeSpy.called = true;
      };
      toast.dispatchEvent(new CustomEvent('close'));
      expect(removeSpy.called).to.be.true;
      toast.remove = originalRemove;
    });
  });

  describe('show methods', () => {
    it('should show basic toast', () => {
      let messageReceived = '';
      const originalCreateToast = toastManager.createToast;
      toastManager.createToast = (message) => {
        messageReceived = message;
        return document.createElement('sp-toast');
      };

      toastManager.show('Test message');
      expect(messageReceived).to.equal('Test message');

      toastManager.createToast = originalCreateToast;
    });

    it('should show info toast', () => {
      let variantReceived = '';
      const originalCreateToast = toastManager.createToast;
      toastManager.createToast = (message, postArea, options) => {
        variantReceived = options.variant;
        return document.createElement('sp-toast');
      };

      toastManager.showInfo('Test info');
      expect(variantReceived).to.equal('info');

      toastManager.createToast = originalCreateToast;
    });

    it('should show success toast', () => {
      let variantReceived = '';
      const originalCreateToast = toastManager.createToast;
      toastManager.createToast = (message, postArea, options) => {
        variantReceived = options.variant;
        return document.createElement('sp-toast');
      };

      toastManager.showSuccess('Test success');
      expect(variantReceived).to.equal('positive');

      toastManager.createToast = originalCreateToast;
    });

    it('should show error toast', () => {
      let variantReceived = '';
      const originalCreateToast = toastManager.createToast;
      toastManager.createToast = (message, postArea, options) => {
        variantReceived = options.variant;
        return document.createElement('sp-toast');
      };

      toastManager.showError('Test error');
      expect(variantReceived).to.equal('negative');

      toastManager.createToast = originalCreateToast;
    });

    it('should show warning toast', () => {
      let variantReceived = '';
      const originalCreateToast = toastManager.createToast;
      toastManager.createToast = (message, postArea, options) => {
        variantReceived = options.variant;
        return document.createElement('sp-toast');
      };

      toastManager.showWarning('Test warning');
      expect(variantReceived).to.equal('warning');

      toastManager.createToast = originalCreateToast;
    });
  });
});
