import { html } from '../htm-wrapper.js';
import { useSchedules } from '../context/SchedulesContext.js';
import useIcons from '../useIcons.js';
import { useState } from '../../../scripts/libs/preact-hook.js';

export default function ScheduleEditor() {
  const {
    isUpdating,
    isDeleting,
    updateScheduleLocally,
    deleteSchedule,
    activeSchedule,
    hasUnsavedChanges,
    deleteBlockLocally,
    addBlockLocally,
    updateBlockLocally,
    updateSchedule,
    discardChangesToActiveSchedule,
  } = useSchedules();
  useIcons();

  const [editingBlockId, setEditingBlockId] = useState(null);

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
      liveStream: false,
      mobileRiderSessionId: '',
      isComplete: false,
      isEditingBlockTitle: false,
    };

    addBlockLocally(newBlock);
    requestAnimationFrame(() => {
      const blockTitleInput = document.getElementById(`${newBlock.id}-block-title-input`);
      const inputElement = blockTitleInput.shadowRoot.querySelector('input');
      inputElement.focus();
    });
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

  const handleEditBlockTitle = (blockId) => {
    updateBlockLocally(blockId, { isEditingBlockTitle: true });
    const blockTitleInput = document.getElementById(`${blockId}-block-title-input`);
    const inputElement = blockTitleInput.shadowRoot.querySelector('input');
    // Using requestAnimationFrame to ensure the element is focused after the component is rendered
    requestAnimationFrame(() => {
      inputElement.focus();
    });
  };

  const handleBlockTitleChange = (blockId, event) => {
    updateBlockLocally(blockId, { title: event.target.value, isEditingBlockTitle: true });
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

  const handleLiveStreamChange = (blockId, event) => {
    if (!event.target.checked) {
      updateBlockLocally(blockId, { mobileRiderSessionId: '', liveStream: false });
      return;
    }
    updateBlockLocally(blockId, { liveStream: event.target.checked });
  };

  const handleMobileRiderSessionIdChange = (blockId, event) => {
    updateBlockLocally(blockId, { mobileRiderSessionId: event.target.value });
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
  console.log({ activeSchedule });

  return html`
    <section class="schedule-editor">
      <header class="schedule-editor-header">
        <div class="schedule-editor-header-title">
          <input type="text" value=${activeSchedule?.title || ''} onInput=${handleScheduleTitleChange} class="schedule-title-input" placeholder="Enter schedule title"/>
          ${hasUnsavedChanges && html`
            <span class="unsaved-indicator" title="You have unsaved changes">
              <span class="icon icon-alert-circle icon-extra-small"></span>
            </span>
          `}
        </div>
        <div class="schedule-editor-header-actions">
          ${hasUnsavedChanges && html`
            <sp-action-button icon="close-circle" size="m" onclick=${discardChangesToActiveSchedule} title="Discard unsaved changes">
              Discard
            </sp-action-button>
          `}
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
        <section class="schedule-editor-content-blocks">
          ${activeSchedule?.blocks?.map((block) => html`
            <div \
              class="schedule-editor-content-block ${editingBlockId === block.id ? 'editing' : ''} ${!block.isComplete ? 'incomplete' : ''}" \
              onFocusIn=${() => setEditingBlockId(block.id)} \
              onFocusOut=${() => setEditingBlockId(null)} \
            >
              <div class="schedule-editor-content-block-header-row">
                <sp-textfield \
                  aria-label="Block title" \
                  label="Block title" \
                  type="text" \
                  value=${block.title} \
                  oninput=${(event) => handleBlockTitleChange(block.id, event)} \
                  onBlur=${() => updateBlockLocally(block.id, { isEditingBlockTitle: false })} \
                  id="${block.id}-block-title-input" \
                  class="schedule-title-input ${block.isEditingBlockTitle || !block.title ? '' : 'schedule-block-hide'}" \
                  size="l" \
                  placeholder="Add block title" \
                />
                <button \
                  class="schedule-editor-content-block-title-button ${block.isEditingBlockTitle || !block.title ? 'schedule-block-hide' : ''}" \
                  onclick=${() => handleEditBlockTitle(block.id)} \
                >
                  ${block.title}
                  <span class="icon icon-edit"></span>
                </button>
                <div class="schedule-editor-content-block-header-actions">
                  ${!block.isComplete && editingBlockId !== block.id && html`
                    <div class="schedule-editor-content-block-incomplete-indicator">
                      <div class="schedule-editor-content-block-incomplete-indicator-circle"></div>
                      <p>Incomplete</p>
                    </div>
                  `}
                  <sp-action-button quiet size="l" onclick=${() => deleteBlockLocally(block.id)}>
                    <sp-icon slot="icon">
                      <svg width="20" height="21" viewBox="0 0 20 21" fill="none">
                        <path d="M8.24903 15.5215C7.84864 15.5215 7.51563 15.2041 7.50098 14.8008L7.25098 8.30078C7.23438 7.88672 7.55762 7.53808 7.97071 7.52246C7.98145 7.52148 7.99122 7.52148 8.00098 7.52148C8.40137 7.52148 8.73438 7.83886 8.74903 8.24218L8.99903 14.7422C9.01563 15.1562 8.69239 15.5049 8.2793 15.5205C8.26856 15.5215 8.25879 15.5215 8.24903 15.5215Z" fill="#292929"/>
                        <path d="M11.751 15.5215C11.7412 15.5215 11.7314 15.5215 11.7207 15.5205C11.3076 15.5049 10.9844 15.1562 11.001 14.7422L11.251 8.24218C11.2656 7.83886 11.5986 7.52148 11.999 7.52148C12.0088 7.52148 12.0186 7.52148 12.0293 7.52246C12.4424 7.53808 12.7656 7.88672 12.749 8.30078L12.499 14.8008C12.4844 15.2041 12.1514 15.5215 11.751 15.5215Z" fill="#292929"/>
                        <path d="M17 4.5H13.5V3.75C13.5 2.50977 12.4902 1.5 11.25 1.5H8.75C7.50977 1.5 6.5 2.50977 6.5 3.75V4.5H3C2.58594 4.5 2.25 4.83594 2.25 5.25C2.25 5.66406 2.58594 6 3 6H3.52002L3.94238 16.3418C3.99023 17.5518 4.97851 18.5 6.19043 18.5H13.8096C15.0215 18.5 16.0098 17.5518 16.0576 16.3418L16.48 6H17C17.4141 6 17.75 5.66406 17.75 5.25C17.75 4.83594 17.4141 4.5 17 4.5ZM8 3.75C8 3.33691 8.33691 3 8.75 3H11.25C11.6631 3 12 3.33691 12 3.75V4.5H8V3.75ZM14.5596 16.2812C14.543 16.6846 14.2139 17 13.8096 17H6.19043C5.78613 17 5.45703 16.6846 5.44043 16.2812L5.02075 6H14.9792L14.5596 16.2812Z" fill="#292929"/>
                      </svg>
                    </sp-icon>
                  </sp-action-button>
                </div>
              </div>
              <div class="schedule-editor-content-block-date-time-row">
                <div class="schedule-editor-content-block-date-time-wrapper">
                  <sp-field-label size="l" for="${block.id}-start-datetime-input">Start Date and Time UTC</sp-field-label>
                  <input \
                    type="datetime-local" \
                    id="${block.id}-start-datetime-input" \
                    value=${displayAsIsoString(block.startDateTime)} \
                    onInput=${(e) => handleStartDateTimeChange(block.id, e)} \
                    class="schedule-start-datetime-input" \
                    placeholder="Enter block start date and time" \
                  />
                </div>
                <div class="schedule-editor-content-block-live-stream-wrapper">
                  <sp-checkbox \
                    id="${block.id}-live-stream-checkbox" \
                    name="${block.id}-live-stream-checkbox" \
                    checked=${block.liveStream} \
                    onchange=${(event) => handleLiveStreamChange(block.id, event)} \
                  >
                    Live stream
                  </sp-checkbox>
                  ${block.liveStream && html`
                  <sp-textfield \
                    aria-label="Mobile rider session id" \
                    type="text" \
                    id="${block.id}-mobile-rider-session-id-input" \
                    value=${block.mobileRiderSessionId} \
                    oninput=${(event) => handleMobileRiderSessionIdChange(block.id, event)} \
                    class="schedule-mobile-rider-session-id-input" \
                    placeholder="Enter Mobile Rider Stream ID" \
                  />
                  `}
                </div>
              </div>
              <sp-field-label size="l" for="${block.id}-fragment-path-input">Fragment path</sp-field-label>
              <sp-textfield \
                type="text" \
                id="${block.id}-fragment-path-input" \
                value=${block.fragmentPath} \
                oninput=${(event) => handleFragmentPathChange(block.id, event)} \
                class="schedule-fragment-path-input" \
                placeholder="Enter fragment path" \
              />
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
