import { html } from '../../htm-wrapper.js';
import { useSchedules } from '../../context/SchedulesContext.js';
import { useState } from '../../../../scripts/libs/preact-hook.js';

export default function ScheduleHeader() {
  const {
    isUpdating,
    isDeleting,
    updateScheduleLocally,
    deleteSchedule,
    activeSchedule,
    hasUnsavedChanges,
    updateSchedule,
    discardChangesToActiveSchedule,
    setToastSuccess,
  } = useSchedules();

  const [isEditingScheduleTitle, setIsEditingScheduleTitle] = useState(false);

  const handleDeleteAll = async () => {
    if (!activeSchedule) return;

    try {
      await deleteSchedule(activeSchedule.scheduleId);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleCopyLink = () => {
    if (hasUnsavedChanges) {
      alert('You have unsaved changes. Please save or discard them before copying the link.');
      return;
    }
    // TODO: Implement actual link copying logic
    setToastSuccess('Link copied to clipboard');
  };

  const handleSave = async () => {
    if (!activeSchedule) return;

    try {
      await updateSchedule(activeSchedule.scheduleId, activeSchedule);
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleScheduleTitleChange = (event) => {
    updateScheduleLocally(activeSchedule.scheduleId, { title: event.target.value });
  };

  const handleEditScheduleTitle = () => {
    setIsEditingScheduleTitle(true);
    const scheduleTitleInput = document.getElementById('schedule-title-input');
    if (!scheduleTitleInput) return;
    requestAnimationFrame(() => {
      scheduleTitleInput.focus();
    });
  };

  if (!activeSchedule) {
    return html`
      <header class="sm-editor__header">
        <h2>No schedule selected</h2>
      </header>
    `;
  }

  return html`
    <header class="sm-editor__header">
      <div class="sm-editor__header-title">
        <sp-textfield \
          type="text" \
          size="xl" \
          id="schedule-title-input" \
          value=${activeSchedule?.title || ''} \
          onInput=${handleScheduleTitleChange} \
          class="sm-input--title ${isEditingScheduleTitle ? '' : 'sm-hidden'}" \
          onBlur=${() => setIsEditingScheduleTitle(false)} \
          onFocusIn=${() => setIsEditingScheduleTitle(true)} \
          placeholder="Enter schedule title" \
        ></sp-textfield>
        <button \
          class="sm-title-button sm-title-button--header ${isEditingScheduleTitle ? 'sm-hidden' : ''}" \
          onclick=${() => handleEditScheduleTitle()} \
        >
          ${activeSchedule?.title || ''}
          <span class="icon icon-edit"></span>
        </button>
      </div>
      <div class="sm-editor__header-actions">
        ${hasUnsavedChanges && html`
          <sp-action-button icon="close-circle" size="m" onclick=${discardChangesToActiveSchedule} title="Discard unsaved changes">
            Discard
          </sp-action-button>
        `}
        <sp-action-button icon="delete" size="m" onclick=${handleDeleteAll} disabled=${isDeleting}>
          ${isDeleting ? 'Deleting...' : 'Delete All'}
        </sp-action-button>
        <sp-action-button icon="copy" size="m" onclick=${handleCopyLink}>Copy link</sp-action-button>
        <sp-action-button icon="save" size="m" onclick=${handleSave} disabled=${isUpdating || !hasUnsavedChanges} class=${hasUnsavedChanges ? 'sm-button--unsaved' : ''}>
          ${isUpdating ? 'Saving...' : 'Save'}
        </sp-action-button>
      </div>
    </header>
  `;
}
