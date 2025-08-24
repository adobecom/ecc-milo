import { useEffect, useRef } from '../../../scripts/libs/preact-hook.js';
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
        <sp-button treatment="outline" size="m" onClick=${onClose}>
          ${cancelText}
        </sp-button>
        <sp-button size="m" onClick=${onConfirm}>
          ${confirmText}
        </sp-button>
      </div>`;
  };

  // Use single-line template to avoid newline issues
  return html`
    <div class="modal-overlay" onClick=${handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal ${sizeClasses[size]}" ref=${modalRef} tabindex="-1" onKeyDown=${handleKeyDown} role="document">
        <div class="modal-header">
          <h2 id="modal-title" class="modal-title">
            ${title}
          </h2>
          <sp-action-button quiet size="s" onClick=${onClose} aria-label="Close modal" class="modal-close">
            <sp-icon name="close" size="s"></sp-icon>
          </sp-action-button>
        </div>
        <div class="modal-content">
          ${children}
        </div>
        ${renderActions()}
      </div>
    </div>`;
}
