import { useState } from '../../../scripts/deps/preact-hook.js';
import { html } from '../htm-wrapper.js';
import Modal from './Modal.js';
import { useSchedulesUI } from '../context/SchedulesContext.js';

export default function CreateManuallyScheduleModal({ isOpen, onClose, onConfirm }) {
  const [scheduleName, setScheduleName] = useState('');
  const { isCreating } = useSchedulesUI();

  const handleClose = () => {
    setScheduleName('');
    onClose();
  };

  const handleConfirm = async () => {
    if (!scheduleName.trim()) {
      return;
    }

    try {
      await onConfirm(scheduleName.trim());
      handleClose();
    } catch (error) {
      window.lana?.log(`Error creating schedule: ${error}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    }
  };

  return html`
    <${Modal} isOpen=${isOpen} onClose=${handleClose} title="Enter schedule title" confirmText=${isCreating ? 'Creating...' : 'Next'} cancelText="Cancel" onConfirm=${handleConfirm} size="small">
      <div class="create-schedule-form">
        <sp-textfield \
          id="schedule-name" \
          class="create-schedule-form-textfield" \
          placeholder="Enter schedule name" \
          value=${scheduleName} \
          onInput=${(e) => setScheduleName(e.target.value)} \
          onKeyDown=${handleKeyDown} \
          size="l" \
          required \
          disabled=${isCreating} \
        ></sp-textfield>
      </div>
    </${Modal}>`;
}
