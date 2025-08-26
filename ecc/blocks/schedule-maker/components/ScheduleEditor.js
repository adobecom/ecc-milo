import { html } from '../htm-wrapper.js';

export default function ScheduleEditor({ activeSchedule }) {
  console.log('activeSchedule', activeSchedule);

  const handleDeleteAll = () => {
    console.log('handleDeleteAll');
  };

  const handleCopyLink = () => {
    console.log('handleCopyLink');
  };

  const handleSave = () => {
    console.log('handleSave');
  };

  return html`
    <section class="schedule-editor">
      <header class="schedule-editor-header">
        <h2>${activeSchedule?.title}</h2>
        <div class="schedule-editor-header-actions">
          <sp-action-button icon="delete" size="m" onclick=${handleDeleteAll}>Delete All</sp-action-button>
          <sp-action-button icon="copy" size="m" onclick=${handleCopyLink}>Copy link</sp-action-button>
          <sp-action-button icon="save" size="m" onclick=${handleSave}>Save</sp-action-button>
        </div>
      </header>
      <section class="schedule-editor-content">
        <div class="schedule-editor-content-tags">
          Placeholder for tags
        </div>
        <div class="schedule-editor-content-blocks">
          Placeholder for blocks
        </div>
        <div class="schedule-editor-content-add-block">
          Placeholder for add block
        </div>
      </section>
    </section>
  `;
}
