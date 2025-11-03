import { useEffect, useRef } from '../../../scripts/deps/preact-hook.js';
import { html } from '../htm-wrapper.js';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  showActions = true,
  size = 'medium', // small, medium, large
}) {
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus the modal
      modalRef.current.focus();

      // Find focusable elements
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements.length > 0) {
        [firstFocusableRef.current, lastFocusableRef.current] = [
          focusableElements[0],
          focusableElements[focusableElements.length - 1],
        ];
      }
    }
  }, [isOpen]);

  // Handle tab key for focus trapping
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault();
          lastFocusableRef.current?.focus();
        }
      } else if (document.activeElement === lastFocusableRef.current) {
        e.preventDefault();
        firstFocusableRef.current?.focus();
      }
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'modal-small',
    medium: 'modal-medium',
    large: 'modal-large',
  };

  // Render actions separately to avoid nested html templates
  const renderActions = () => {
    if (!showActions) return null;
    return html`
      <div class="modal-actions">
        <sp-button treatment="outline" static-color="black" size="l" onClick=${onClose}>
          ${cancelText}
        </sp-button>
        <sp-button size="l" static-color="black" onClick=${onConfirm}>
          ${confirmText}
        </sp-button>
      </div>`;
  };

  // Use single-line template to avoid newline issues
  return html`
    <div class="modal-overlay" onClick=${handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal ${sizeClasses[size]}" ref=${modalRef} tabindex="-1" onKeyDown=${handleKeyDown} role="document">
        <div class="modal-header">
          ${title && html`<h2 id="modal-title" class="modal-title">
            ${title}
          </h2>`}
          <sp-action-button quiet size="s" onClick=${onClose} aria-label="Close modal" class="modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18" slot="icon">
              <path fill="currentColor" fill-rule="evenodd" d="M13.243,3.343,9,7.586,4.757,3.343a.5.5,0,0,0-.707,0l-.707.707a.5.5,0,0,0,0,.707L7.586,9,3.343,13.243a.5.5,0,0,0,0,.707l.707.707a.5.5,0,0,0,.707,0L9,10.414l4.243,4.243a.5.5,0,0,0,.707,0l.707-.707a.5.5,0,0,0,0-.707L10.414,9l4.243-4.243a.5.5,0,0,0,0-.707l-.707-.707A.5.5,0,0,0,13.243,3.343Z"/>
            </svg>
          </sp-action-button>
        </div>
        <div class="modal-content">
          ${children}
        </div>
        ${renderActions()}
      </div>
    </div>`;
}
