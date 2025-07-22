import { expect } from '@esm-bundle/chai';
import ErrorManager from '../../ecc/scripts/error-manager.js';
import ToastManager from '../../ecc/scripts/toast-manager.js';

describe('ErrorManager', () => {
  let testElement;
  let contextErrorManager;

  beforeEach(() => {
    testElement = document.createElement('div');
    testElement.innerHTML = '<sp-theme class="toast-area"></sp-theme>';
    document.body.appendChild(testElement);
    contextErrorManager = new ErrorManager(testElement);
  });

  afterEach(() => {
    document.body.removeChild(testElement);
  });

  describe('constructor', () => {
    it('should initialize with context and create internal toastManager', () => {
      expect(contextErrorManager.context).to.equal(testElement);
      expect(contextErrorManager.toastManager).to.be.instanceOf(ToastManager);
    });
  });

  describe('handleErrorResponse', () => {
    it('should handle validation errors (error bag)', () => {
      const resp = {
        error: {
          errors: [
            { path: '/field1', message: 'is required' },
            { path: '/field2', message: 'is invalid' },
          ],
        },
      };

      let toastCreated = false;
      let messageReceived = '';
      const originalCreateToast = contextErrorManager.toastManager.createToast;
      contextErrorManager.toastManager.createToast = (message) => {
        toastCreated = true;
        messageReceived = message;
        return document.createElement('sp-toast');
      };

              contextErrorManager.handleErrorResponse(resp);
        expect(toastCreated).to.be.true;
        expect(messageReceived).to.include('Field2 is invalid');

      contextErrorManager.toastManager.createToast = originalCreateToast;
    });

          it('should handle concurrency errors (409 status)', () => {
        const resp = { status: 409, error: { message: 'Event update invalid' } };

        let toastCreated = false;
        const originalCreateToast = contextErrorManager.toastManager.createToast;
        contextErrorManager.toastManager.createToast = (message) => {
          toastCreated = true;
          expect(message).to.include('updated by a different session');
          return document.createElement('sp-toast');
        };

      contextErrorManager.handleErrorResponse(resp);
      expect(toastCreated).to.be.true;

      contextErrorManager.toastManager.createToast = originalCreateToast;
    });

    it('should handle general error messages', () => {
      const resp = { error: { message: 'General error occurred' } };

      let messageReceived = '';
      const originalCreateToast = contextErrorManager.toastManager.createToast;
      contextErrorManager.toastManager.createToast = (message) => {
        messageReceived = message;
        return document.createElement('sp-toast');
      };

      contextErrorManager.handleErrorResponse(resp);
      expect(messageReceived).to.equal('General error occurred');

      contextErrorManager.toastManager.createToast = originalCreateToast;
    });

    it('should do nothing when no error in response', () => {
      const resp = { success: true };
      let toastCreated = false;
      const originalCreateToast = contextErrorManager.toastManager.createToast;
      contextErrorManager.toastManager.createToast = () => { toastCreated = true; };

      contextErrorManager.handleErrorResponse(resp);
      expect(toastCreated).to.be.false;

      contextErrorManager.toastManager.createToast = originalCreateToast;
    });
  });

  describe('Integration tests', () => {
    it('should handle complete error flow', () => {
      const resp = { error: { message: 'Integration test error' } };

      let toastCreated = false;
      const originalCreateToast = contextErrorManager.toastManager.createToast;
      contextErrorManager.toastManager.createToast = (message) => {
        toastCreated = true;
        expect(message).to.equal('Integration test error');
        return document.createElement('sp-toast');
      };

      contextErrorManager.handleErrorResponse(resp);
      expect(toastCreated).to.be.true;

      contextErrorManager.toastManager.createToast = originalCreateToast;
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
      const originalCreateToast = contextErrorManager.toastManager.createToast;
      contextErrorManager.toastManager.createToast = (message, toastAreaParam, options) => {
        timeouts.push(options.timeout);
        return document.createElement('sp-toast');
      };

      contextErrorManager.handleErrorResponse(resp);
      expect(timeouts).to.deep.equal([6000, 9000, 12000]);

      contextErrorManager.toastManager.createToast = originalCreateToast;
    });
  });
});
