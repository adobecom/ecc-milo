import { html } from '../htm-wrapper.js';
import { useSchedules } from '../context/SchedulesContext.js';
import useIcons from '../useIcons.js';

export default function ScheduleEditor() {
  const { isUpdating, isDeleting, updateSchedule, deleteSchedule, activeSchedule } = useSchedules();
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
    console.log('handleCopyLink');
  };

  const handleAddBlock = () => {
  };

  const handleSave = async () => {
    if (!activeSchedule) return;

    try {
      await updateSchedule(activeSchedule.scheduleId, activeSchedule);
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  console.log({ activeSchedule });

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
        <h2>${activeSchedule?.title}</h2>
        <div class="schedule-editor-header-actions">
          <sp-action-button icon="delete" size="m" onclick=${handleDeleteAll} disabled=${isDeleting}>
            ${isDeleting ? 'Deleting...' : 'Delete All'}
          </sp-action-button>
          <sp-action-button icon="copy" size="m" onclick=${handleCopyLink}>Copy link</sp-action-button>
          <sp-action-button icon="save" size="m" onclick=${handleSave} disabled=${isUpdating}>
            ${isUpdating ? 'Saving...' : 'Save'}
          </sp-action-button>
        </div>
      </header>
      <section class="schedule-editor-content">
        <div class="schedule-editor-content-tags">
          Placeholder for tags
        </div>
        <section class="schedule-editor-content-blocks">
          ${activeSchedule?.blocks.map((block) => html`
            <div class="schedule-editor-content-block">
              <h3>${block.title}</h3>
              <p>${block.fragmentPath}</p>
            </div>
          `)}
        </section>
        <button class="schedule-editor-content-add-block" onClick=${handleAddBlock}>
          <p>Add block</p>
          <span class="icon icon-add-circle icon-extra-small"></span>
        </button>
      </section>
    </section>
  `;
}
