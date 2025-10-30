import { html } from '../htm-wrapper.js';
import Modal from './Modal.js';
import { useSchedulesUI } from '../context/SchedulesContext.js';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, scheduleTitle }) {
  const { isDeleting } = useSchedulesUI();

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      window.lana?.log(`Error deleting schedule: ${error}`);
    }
  };

  return html`
    <${Modal} \
      isOpen=${isOpen} \
      onClose=${onClose} \
      title="Delete Schedule" \
      confirmText=${isDeleting ? 'Deleting...' : 'Delete'} \
      cancelText="Cancel" \
      onConfirm=${handleConfirm} \
      size="small" \
    >
      <div>
        <p>
          Are you sure you want to delete the schedule "${scheduleTitle || 'Untitled'}"? 
        </p>
      </div>
    </${Modal}>`;
}
