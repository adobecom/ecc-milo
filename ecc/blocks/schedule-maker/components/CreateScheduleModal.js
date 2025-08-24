import { useState } from '../../../scripts/libs/preact-hook.js';
import { html } from '../htm-wrapper.js';
import Modal from './Modal.js';

export default function CreateScheduleModal({ isOpen, onClose, onConfirm }) {
  const [scheduleName, setScheduleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setScheduleName('');
    setIsSubmitting(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (!scheduleName.trim()) {
      return; // Don't submit if name is empty
    }

    setIsSubmitting(true);
    try {
      await onConfirm(scheduleName.trim());
      handleClose();
    } catch (error) {
      console.error('Error creating schedule:', error);
      // You could add error handling here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    }
  };

  // Use single-line template to avoid newline issues
  return html`
    <${Modal} isOpen=${isOpen} onClose=${handleClose} title="Create New Schedule" confirmText=${isSubmitting ? 'Creating...' : 'Create Schedule'} cancelText="Cancel" onConfirm=${handleConfirm} size="small">
      <div class="create-schedule-form">
        <label for="schedule-name" class="form-label">
          Schedule Name
        </label>
        <sp-textfield id="schedule-name" placeholder="Enter schedule name" value=${scheduleName} onInput=${(e) => setScheduleName(e.target.value)} onKeyDown=${handleKeyDown} size="l" required disabled=${isSubmitting}></sp-textfield>
        <p class="form-help-text">
          Give your schedule a descriptive name to help you identify it later.
        </p>
      </div>
    </${Modal}>`;
}
