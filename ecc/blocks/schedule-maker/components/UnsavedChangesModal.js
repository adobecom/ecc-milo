import { html } from '../htm-wrapper.js';
import Modal from './Modal.js';
import { useSchedulesOperations } from '../context/SchedulesContext.js';

export default function UnsavedChangesModal({
  isOpen,
  onClose,
  onProceed,
}) {
  const { discardChangesToActiveSchedule } = useSchedulesOperations();

  const handleDiscard = () => {
    // Discard changes and proceed
    discardChangesToActiveSchedule();
    onProceed();
    onClose();
  };

  const handleCancel = () => {
    // Just close the modal without proceeding
    onClose();
  };

  return html`
    <${Modal} \
      isOpen=${isOpen} \
      onClose=${handleCancel} \
      onConfirm=${handleDiscard} \
      confirmText="Discard" \
      cancelText="Cancel" \
      title="Unsaved Changes" \
      showActions=${true} \
      size="small" \
    >
        <div>
          <p>
            You have unsaved changes. Would you like to discard them?
          </p>
        </div>
    </${Modal}>`;
}
