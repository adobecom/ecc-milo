import { html } from '../htm-wrapper.js';
import { useSchedules } from '../context/SchedulesContext.js';
import useIcons from '../useIcons.js';

export default function ScheduleEditor() {
  const {
    isUpdating,
    isDeleting,
    updateScheduleLocally,
    deleteSchedule,
    activeSchedule,
    hasUnsavedChanges,
    addBlockLocally,
    updateBlockLocally,
    updateSchedule,
    discardChangesToActiveSchedule,
  } = useSchedules();
  useIcons();

  const handleDeleteAll = async () => {
    if (!activeSchedule) return;

    try {
      await deleteSchedule(activeSchedule.scheduleId);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleCopyLink = () => {
    // TODO: Add logic to copy link
  };

  const handleAddBlock = () => {
    if (!activeSchedule) return;

    const newBlock = {
      id: `block-${Math.random().toString(36).substring(2, 15)}`,
      title: '',
      fragmentPath: '',
      startDateTime: 0,
      mobileRiderSessionId: '',
    };

    addBlockLocally(newBlock);
  };

  const handleSave = async () => {
    if (!activeSchedule) return;

    try {
      await updateSchedule(activeSchedule.scheduleId, activeSchedule);
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleDiscardChanges = () => {
    discardChangesToActiveSchedule();
  };

  const handleScheduleTitleChange = (event) => {
    updateScheduleLocally(activeSchedule.scheduleId, { title: event.target.value });
  };

  const handleTitleChange = (blockId, event) => {
    updateBlockLocally(blockId, { title: event.target.value });
  };

  const handleFragmentPathChange = (blockId, event) => {
    updateBlockLocally(blockId, { fragmentPath: event.target.value });
  };

  const handleStartDateTimeChange = (blockId, event) => {
    // Add Z to make it a UTC date
    const date = new Date(`${event.target.value}Z`);
    const timestamp = date.getTime() || 0;
    updateBlockLocally(blockId, { startDateTime: timestamp });
  };

  const displayAsIsoString = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toISOString().slice(0, 16);
  };

  if (!activeSchedule) {
    return html`
      <section class="schedule-editor">
        <h2>No schedule selected</h2>
      </section>
    `;
  }

  return html`
    <section class="schedule-editor">
      <header class="schedule-editor-header">
        <div class="schedule-editor-header-title">
          <input type="text" value=${activeSchedule?.title || ''} onInput=${handleScheduleTitleChange} class="schedule-title-input" placeholder="Enter schedule title"/>
          ${hasUnsavedChanges ? html`
            <span class="unsaved-indicator" title="You have unsaved changes">
              <span class="icon icon-alert-circle icon-extra-small"></span>
            </span>
          ` : ''}
        </div>
        <div class="schedule-editor-header-actions">
          ${hasUnsavedChanges ? html`
            <sp-action-button icon="close-circle" size="m" onclick=${handleDiscardChanges} title="Discard unsaved changes">
              Discard
            </sp-action-button>
          ` : ''}
          <sp-action-button icon="delete" size="m" onclick=${handleDeleteAll} disabled=${isDeleting}>
            ${isDeleting ? 'Deleting...' : 'Delete All'}
          </sp-action-button>
          <sp-action-button icon="copy" size="m" onclick=${handleCopyLink}>Copy link</sp-action-button>
          <sp-action-button icon="save" size="m" onclick=${handleSave} disabled=${isUpdating || !hasUnsavedChanges} class=${hasUnsavedChanges ? 'save-button-unsaved' : ''}>
            ${isUpdating ? 'Saving...' : 'Save'}
          </sp-action-button>
        </div>
      </header>
      <section class="schedule-editor-content">
        <div class="schedule-editor-content-tags">
          Placeholder for tags
        </div>
        <section class="schedule-editor-content-blocks">
          ${activeSchedule?.blocks?.map((block) => html`
            <div class="schedule-editor-content-block">
              <input type="text" value=${block.title} onInput=${(event) => handleTitleChange(block.id, event)} class="schedule-title-input" placeholder="Enter block title"/>
              <sp-field-label for="${block.id}-start-datetime-input">Start date and time UTC</sp-field-label>
              <input type="datetime-local" id="${block.id}-start-datetime-input" value=${displayAsIsoString(block.startDateTime)} onInput=${(e) => handleStartDateTimeChange(block.id, e)} class="schedule-start-datetime-input" placeholder="Enter block start date and time"/>
              <input type="text" value=${block.fragmentPath} onInput=${(event) => handleFragmentPathChange(block.id, event)} class="schedule-fragment-path-input" placeholder="Enter fragment path"/>
            </div>
          `) || ''}
        </section>
        <button class="schedule-editor-content-add-block" onClick=${handleAddBlock}>
          <p>Add block</p>
          <span class="icon icon-add-circle icon-extra-small"></span>
        </button>
      </section>
    </section>
  `;
}
