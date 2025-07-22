import { expect } from '@esm-bundle/chai';
import ErrorManager from '../../ecc/scripts/error-manager.js';

describe('ErrorManager', () => {
  let testElement;
  let toastArea;
  let contextErrorManager;

  beforeEach(() => {
    // Create test DOM structure
    testElement = document.createElement('div');
    const spTheme = document.createElement('sp-theme');
    spTheme.className = 'toast-area';
    toastArea = document.createElement('div');
    toastArea.className = 'toast-area';
    spTheme.appendChild(toastArea);
    testElement.appendChild(spTheme);
    document.body.appendChild(testElement);

    // Create context-aware error manager for testing
    contextErrorManager = new ErrorManager(testElement);
  });

  afterEach(() => {
    document.body.removeChild(testElement);
  });

  describe('createToast', () => {
    it('should create a toast with default options', () => {
      const toast = contextErrorManager.createToast('Test message', toastArea);
      expect(toast.tagName.toLowerCase()).to.equal('sp-toast');
      // Check if properties are set (they might be attributes instead)
      expect(toast.open === true || toast.getAttribute('open') === 'true').to.be.true;
      expect(toast.variant || toast.getAttribute('variant')).to.equal('negative');
      expect(Number(toast.timeout || toast.getAttribute('timeout'))).to.equal(6000);
    });

    it('should create a toast with custom options', () => {
      const options = {
        variant: 'positive',
        timeout: 10000,
        showCloseButton: false,
      };
      const toast = contextErrorManager.createToast('Test message', toastArea, options);
      expect(toast.variant || toast.getAttribute('variant')).to.equal('positive');
      expect(Number(toast.timeout || toast.getAttribute('timeout'))).to.equal(10000);
    });

    it('should add close event listener', () => {
      const toast = contextErrorManager.createToast('Test message', toastArea);
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

  describe('handleErrorResponse', () => {
    it('should handle validation errors (error bag)', () => {
      const resp = {
        error: {
          errors: [
            { path: '/title', message: 'Title is required' },
            { path: '/description', message: 'Description is required' },
          ],
        },
      };

      let toastCount = 0;
      const originalCreateToast = contextErrorManager.createToast;
      contextErrorManager.createToast = () => { toastCount += 1; return document.createElement('sp-toast'); };

      contextErrorManager.handleErrorResponse(resp);
      expect(toastCount).to.equal(2);

      contextErrorManager.createToast = originalCreateToast;
    });

    it('should handle concurrency errors (409 status)', () => {
      const resp = {
        status: 409,
        error: { message: 'Request to ESP failed: {"message":"Event update invalid, event has been modified since last fetch"}' },
      };

      let toastCreated = false;
      const originalCreateToast = contextErrorManager.createToast;
      contextErrorManager.createToast = (message) => {
        toastCreated = true;
        expect(message).to.include('updated by a different session');
        return document.createElement('sp-toast');
      };

      contextErrorManager.handleErrorResponse(resp);
      expect(toastCreated).to.be.true;

      contextErrorManager.createToast = originalCreateToast;
    });

    it('should handle general error messages', () => {
      const resp = { error: { message: 'General error occurred' } };

      let messageReceived = '';
      const originalCreateToast = contextErrorManager.createToast;
      contextErrorManager.createToast = (message) => {
        messageReceived = message;
        return document.createElement('sp-toast');
      };

      contextErrorManager.handleErrorResponse(resp);
      expect(messageReceived).to.equal('General error occurred');

      contextErrorManager.createToast = originalCreateToast;
    });

    it('should do nothing when no error in response', () => {
      const resp = { success: true };
      let toastCreated = false;
      const originalCreateToast = contextErrorManager.createToast;
      contextErrorManager.createToast = () => { toastCreated = true; };

      contextErrorManager.handleErrorResponse(resp);
      expect(toastCreated).to.be.false;

      contextErrorManager.createToast = originalCreateToast;
    });
  });

  describe('handleException', () => {
    it('should handle error with message', () => {
      const error = new Error('Test exception message');
      let messageReceived = '';
      const originalCreateToast = contextErrorManager.createToast;
      contextErrorManager.createToast = (message) => {
        messageReceived = message;
      };

      contextErrorManager.handleException(error);
      expect(messageReceived).to.equal('Test exception message');

      contextErrorManager.createToast = originalCreateToast;
    });

    it('should handle error without message', () => {
      const error = new Error();
      let messageReceived = '';
      const originalCreateToast = contextErrorManager.createToast;
      contextErrorManager.createToast = (message) => {
        messageReceived = message;
      };

      contextErrorManager.handleException(error);
      expect(messageReceived).to.equal('An unexpected error occurred. Please try again.');

      contextErrorManager.createToast = originalCreateToast;
    });
  });

  describe('wrapAsyncFunction', () => {
    it('should handle exceptions in wrapped function', async () => {
      const error = new Error('Test error');
      const asyncFn = async () => {
        throw error;
      };

      let exceptionHandled = false;
      const originalHandleException = contextErrorManager.handleException;
      contextErrorManager.handleException = () => {
        exceptionHandled = true;
      };

      const wrappedFn = contextErrorManager.wrapAsyncFunction(asyncFn);

      try {
        await wrappedFn();
      } catch (e) {
        // Expected to re-throw
      }

      expect(exceptionHandled).to.be.true;
      contextErrorManager.handleException = originalHandleException;
    });

    it('should pass through successful results', async () => {
      const asyncFn = async () => 'success';
      const wrappedFn = contextErrorManager.wrapAsyncFunction(asyncFn);

      const result = await wrappedFn();
      expect(result).to.equal('success');
    });
  });

  describe('Legacy compatibility methods', () => {
    it('should handle buildErrorMessage', () => {
      const resp = { error: { message: 'Test error' } };

      let errorHandled = false;
      const originalHandleErrorResponse = contextErrorManager.handleErrorResponse;
      contextErrorManager.handleErrorResponse = () => {
        errorHandled = true;
      };

      contextErrorManager.buildErrorMessage(testElement, resp);
      expect(errorHandled).to.be.true;

      contextErrorManager.handleErrorResponse = originalHandleErrorResponse;
    });
  });

  describe('Integration tests', () => {
    it('should handle complete error flow', () => {
      const resp = { error: { message: 'Integration test error' } };

      let toastCreated = false;
      const originalCreateToast = contextErrorManager.createToast;
      contextErrorManager.createToast = (message) => {
        toastCreated = true;
        expect(message).to.equal('Integration test error');
        return document.createElement('sp-toast');
      };

      contextErrorManager.handleErrorResponse(resp);
      expect(toastCreated).to.be.true;

      contextErrorManager.createToast = originalCreateToast;
    });

    it('should handle multiple validation errors with staggered timeouts', () => {
      const resp = {
        error: {
          errors: [
            { path: '/field1', message: 'Error 1' },
            { path: '/field2', message: 'Error 2' },
            { path: '/field3', message: 'Error 3' },
          ],
        },
      };

      const timeouts = [];
      const originalCreateToast = contextErrorManager.createToast;
      contextErrorManager.createToast = (message, toastAreaParam, options) => {
        timeouts.push(options.timeout);
        return document.createElement('sp-toast');
      };

      contextErrorManager.handleErrorResponse(resp);
      expect(timeouts).to.deep.equal([6000, 9000, 12000]);

      contextErrorManager.createToast = originalCreateToast;
    });
  });
});
