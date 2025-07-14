import { expect } from '@esm-bundle/chai';
import errorManager, { ErrorManager } from '../../ecc/scripts/error-manager.js';

describe('ErrorManager', () => {
  let testElement;
  let toastArea;

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
  });

  afterEach(() => {
    document.body.removeChild(testElement);
  });

  describe('getToastArea', () => {
    it('should find toast area from targetEl', () => {
      const target = { targetEl: testElement };
      const result = ErrorManager.getToastArea(target);
      expect(result).to.equal(toastArea);
    });

    it('should find toast area from el', () => {
      const target = { el: testElement };
      const result = ErrorManager.getToastArea(target);
      expect(result).to.equal(toastArea);
    });

    it('should find toast area from direct element', () => {
      const result = ErrorManager.getToastArea(testElement);
      expect(result).to.equal(toastArea);
    });

    it('should fallback to document body when no toast area found', () => {
      const target = { someOtherProp: 'value' };
      const result = ErrorManager.getToastArea(target);
      expect(result).to.equal(document.body);
    });
  });

  describe('createToast', () => {
    it('should create a toast with default options', () => {
      const toast = errorManager.createToast('Test message', toastArea);
      expect(toast.tagName.toLowerCase()).to.equal('sp-toast');
      expect(toast.open).to.be.true;
      expect(toast.variant).to.equal('negative');
      expect(toast.timeout).to.equal(6000);
    });

    it('should create a toast with custom options', () => {
      const options = {
        variant: 'positive',
        timeout: 10000,
        showCloseButton: false,
      };
      const toast = errorManager.createToast('Test message', toastArea, options);
      expect(toast.variant).to.equal('positive');
      expect(toast.timeout).to.equal(10000);
    });

    it('should add close event listener', () => {
      const toast = errorManager.createToast('Test message', toastArea);
      const removeSpy = { called: false };
      const originalRemove = toast.remove;
      toast.remove = () => { removeSpy.called = true; };
      
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
      const originalCreateToast = errorManager.createToast;
      errorManager.createToast = () => { toastCount++; return document.createElement('sp-toast'); };
      
      errorManager.handleErrorResponse(testElement, resp);
      expect(toastCount).to.equal(2);
      
      errorManager.createToast = originalCreateToast;
    });

    it('should handle concurrency errors (409 status)', () => {
      const resp = {
        status: 409,
        error: {
          message: 'Request to ESP failed: {"message":"Event update invalid, event has been modified since last fetch"}',
        },
      };

      let toastCreated = false;
      const originalCreateToast = errorManager.createToast;
      errorManager.createToast = (message) => { 
        toastCreated = true;
        expect(message).to.include('updated by a different session');
        return document.createElement('sp-toast');
      };
      
      errorManager.handleErrorResponse(testElement, resp);
      expect(toastCreated).to.be.true;
      
      errorManager.createToast = originalCreateToast;
    });

    it('should handle general error messages', () => {
      const resp = {
        error: {
          message: 'General error occurred',
        },
      };

      let messageReceived = '';
      const originalCreateToast = errorManager.createToast;
      errorManager.createToast = (message) => { 
        messageReceived = message;
        return document.createElement('sp-toast');
      };
      
      errorManager.handleErrorResponse(testElement, resp);
      expect(messageReceived).to.equal('General error occurred');
      
      errorManager.createToast = originalCreateToast;
    });

    it('should do nothing when no error in response', () => {
      const resp = { success: true };
      let toastCreated = false;
      const originalCreateToast = errorManager.createToast;
      errorManager.createToast = () => { toastCreated = true; };
      
      errorManager.handleErrorResponse(testElement, resp);
      expect(toastCreated).to.be.false;
      
      errorManager.createToast = originalCreateToast;
    });
  });

  describe('showError', () => {
    it('should show error message', () => {
      let messageReceived = '';
      let variantReceived = '';
      const originalCreateToast = errorManager.createToast;
      errorManager.createToast = (message, toastArea, options) => { 
        messageReceived = message;
        variantReceived = options.variant;
        return document.createElement('sp-toast');
      };
      
      errorManager.showError(testElement, 'Test error message');
      expect(messageReceived).to.equal('Test error message');
      expect(variantReceived).to.equal('negative');
      
      errorManager.createToast = originalCreateToast;
    });
  });

  describe('showSuccess', () => {
    it('should show success message', () => {
      let messageReceived = '';
      let variantReceived = '';
      const originalCreateToast = errorManager.createToast;
      errorManager.createToast = (message, toastArea, options) => { 
        messageReceived = message;
        variantReceived = options.variant;
        return document.createElement('sp-toast');
      };
      
      errorManager.showSuccess(testElement, 'Test success message');
      expect(messageReceived).to.equal('Test success message');
      expect(variantReceived).to.equal('positive');
      
      errorManager.createToast = originalCreateToast;
    });

    it('should show success with action button', () => {
      const options = {
        actionButton: {
          text: 'Go to dashboard',
          href: '/dashboard',
        },
      };
      
      let actionButtonCreated = false;
      const originalCreateToast = errorManager.createToast;
      errorManager.createToast = (message, toastArea, options) => { 
        const toast = document.createElement('sp-toast');
        if (options.actionButton) {
          const button = document.createElement('sp-button');
          button.textContent = options.actionButton.text;
          button.href = options.actionButton.href;
          toast.appendChild(button);
          actionButtonCreated = true;
        }
        return toast;
      };
      
      errorManager.showSuccess(testElement, 'Test success message', options);
      expect(actionButtonCreated).to.be.true;
      
      errorManager.createToast = originalCreateToast;
    });
  });

  describe('showInfo', () => {
    it('should show info message', () => {
      let messageReceived = '';
      let variantReceived = '';
      const originalCreateToast = errorManager.createToast;
      errorManager.createToast = (message, toastArea, options) => { 
        messageReceived = message;
        variantReceived = options.variant;
        return document.createElement('sp-toast');
      };
      
      errorManager.showInfo(testElement, 'Test info message');
      expect(messageReceived).to.equal('Test info message');
      expect(variantReceived).to.equal('info');
      
      errorManager.createToast = originalCreateToast;
    });
  });

  describe('handleException', () => {
    it('should handle error with message', () => {
      const error = new Error('Test exception message');
      let messageReceived = '';
      const originalCreateToast = errorManager.createToast;
      errorManager.createToast = (message) => { 
        messageReceived = message;
        return document.createElement('sp-toast');
      };
      
      errorManager.handleException(testElement, error);
      expect(messageReceived).to.equal('Test exception message');
      
      errorManager.createToast = originalCreateToast;
    });

    it('should handle error without message', () => {
      const error = new Error();
      let messageReceived = '';
      const originalCreateToast = errorManager.createToast;
      errorManager.createToast = (message) => { 
        messageReceived = message;
        return document.createElement('sp-toast');
      };
      
      errorManager.handleException(testElement, error);
      expect(messageReceived).to.equal('An unexpected error occurred. Please try again.');
      
      errorManager.createToast = originalCreateToast;
    });
  });

  describe('handleCustomEvent', () => {
    it('should handle error in event detail', () => {
      const event = new CustomEvent('show-error-toast', {
        detail: { error: { message: 'Test error' } },
      });
      
      let errorHandled = false;
      const originalHandleErrorResponse = errorManager.handleErrorResponse;
      errorManager.handleErrorResponse = () => { errorHandled = true; };
      
      errorManager.handleCustomEvent(testElement, event);
      expect(errorHandled).to.be.true;
      
      errorManager.handleErrorResponse = originalHandleErrorResponse;
    });

    it('should handle message in event detail', () => {
      const event = new CustomEvent('show-error-toast', {
        detail: { message: 'Test message' },
      });
      
      let messageReceived = '';
      const originalCreateToast = errorManager.createToast;
      errorManager.createToast = (message) => { 
        messageReceived = message;
        return document.createElement('sp-toast');
      };
      
      errorManager.handleCustomEvent(testElement, event);
      expect(messageReceived).to.equal('Test message');
      
      errorManager.createToast = originalCreateToast;
    });
  });

  describe('initErrorListeners', () => {
    it('should add event listeners to element', () => {
      let listenersAdded = 0;
      const originalAddEventListener = testElement.addEventListener;
      testElement.addEventListener = (eventName) => { 
        listenersAdded++;
        expect(['show-error-toast', 'show-success-toast']).to.include(eventName);
      };
      
      errorManager.initErrorListeners(testElement, { el: testElement });
      expect(listenersAdded).to.equal(2);
      
      testElement.addEventListener = originalAddEventListener;
    });
  });

  describe('wrapAsyncFunction', () => {
    it('should wrap async function with error handling', async () => {
      const error = new Error('Test error');
      const asyncFn = async () => { throw error; };
      
      let exceptionHandled = false;
      const originalHandleException = errorManager.handleException;
      errorManager.handleException = () => { exceptionHandled = true; };
      
      const wrappedFn = errorManager.wrapAsyncFunction(asyncFn, testElement);
      
      try {
        await wrappedFn();
      } catch (e) {
        // Expected to throw
      }
      
      expect(exceptionHandled).to.be.true;
      errorManager.handleException = originalHandleException;
    });

    it('should return result when no error occurs', async () => {
      const asyncFn = async () => 'success';
      const wrappedFn = errorManager.wrapAsyncFunction(asyncFn, testElement);
      
      const result = await wrappedFn();
      expect(result).to.equal('success');
    });
  });

  describe('Legacy compatibility methods', () => {
    it('should provide buildErrorMessage compatibility', () => {
      const resp = { error: { message: 'Test error' } };
      
      let errorHandled = false;
      const originalHandleErrorResponse = errorManager.handleErrorResponse;
      errorManager.handleErrorResponse = () => { errorHandled = true; };
      
      errorManager.buildErrorMessage(testElement, resp);
      expect(errorHandled).to.be.true;
      
      errorManager.handleErrorResponse = originalHandleErrorResponse;
    });

    it('should provide showToast compatibility', () => {
      let successCalled = false;
      let errorCalled = false;
      let infoCalled = false;
      
      const originalShowSuccess = errorManager.showSuccess;
      const originalShowError = errorManager.showError;
      const originalShowInfo = errorManager.showInfo;
      
      errorManager.showSuccess = () => { successCalled = true; };
      errorManager.showError = () => { errorCalled = true; };
      errorManager.showInfo = () => { infoCalled = true; };
      
      errorManager.showToast(testElement, 'Test message', { variant: 'positive' });
      expect(successCalled).to.be.true;
      
      errorManager.showToast(testElement, 'Test message', { variant: 'negative' });
      expect(errorCalled).to.be.true;
      
      errorManager.showToast(testElement, 'Test message', { variant: 'info' });
      expect(infoCalled).to.be.true;
      
      errorManager.showSuccess = originalShowSuccess;
      errorManager.showError = originalShowError;
      errorManager.showInfo = originalShowInfo;
    });
  });

  describe('Integration tests', () => {
    it('should handle complete error flow', () => {
      const resp = {
        status: 409,
        error: {
          message: 'Request to ESP failed: {"message":"Event update invalid, event has been modified since last fetch"}',
        },
      };
      const target = {
        eventDataResp: { eventId: 'test-event-id' },
        el: testElement,
      };

      let toastCreated = false;
      const originalCreateToast = errorManager.createToast;
      errorManager.createToast = (message, toastArea, options) => { 
        toastCreated = true;
        expect(message).to.include('updated by a different session');
        const toast = document.createElement('sp-toast');
        // Simulate action button creation
        if (message.includes('updated by a different session')) {
          const button = document.createElement('sp-button');
          button.textContent = 'See the latest version';
          toast.appendChild(button);
        }
        return toast;
      };
      
      errorManager.handleErrorResponse(target, resp);
      expect(toastCreated).to.be.true;
      
      errorManager.createToast = originalCreateToast;
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
      const originalCreateToast = errorManager.createToast;
      errorManager.createToast = (message, toastArea, options) => { 
        timeouts.push(options.timeout);
        return document.createElement('sp-toast');
      };
      
      errorManager.handleErrorResponse(testElement, resp);
      expect(timeouts).to.deep.equal([6000, 9000, 12000]);
      
      errorManager.createToast = originalCreateToast;
    });
  });
}); 
