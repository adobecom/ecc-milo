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
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(scheduleName.trim());
      handleClose();
    } catch (error) {
      console.error('Error creating schedule:', error);
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

  return html`
    <${Modal} isOpen=${isOpen} onClose=${handleClose} title="Enter schedule title" confirmText=${isSubmitting ? 'Creating...' : 'Next'} cancelText="Cancel" onConfirm=${handleConfirm} size="small">
      <div class="create-schedule-form">
        <sp-textfield id="schedule-name" class="create-schedule-form-textfield" placeholder="Enter schedule name" value=${scheduleName} onInput=${(e) => setScheduleName(e.target.value)} onKeyDown=${handleKeyDown} size="l" required disabled=${isSubmitting}></sp-textfield>
      </div>
    </${Modal}>`;
}
