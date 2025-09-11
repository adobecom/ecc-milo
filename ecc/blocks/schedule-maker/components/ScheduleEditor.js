import { html } from '../htm-wrapper.js';
import { useSchedulesData, useSchedulesOperations } from '../context/SchedulesContext.js';
import useIcons from '../useIcons.js';
import { useState } from '../../../scripts/deps/preact-hook.js';
import ScheduleHeader from './editor/ScheduleHeader.js';
import BlockEditor from './editor/BlockEditor.js';

export default function ScheduleEditor() {
  const { activeSchedule } = useSchedulesData();
  const { addBlockLocally } = useSchedulesOperations();
  useIcons();

  const [editingBlockId, setEditingBlockId] = useState(null);

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
      if (blockTitleInput) {
        const inputElement = blockTitleInput.shadowRoot.querySelector('input');
        inputElement.focus();
      }
    });
  };

  if (!activeSchedule) {
    return html`
      <section class="sm-editor">
        <h2>No schedule selected</h2>
      </section>
    `;
  }

  return html`
    <section class="sm-editor">
      <${ScheduleHeader} />
      <section class="sm-editor__content">
        <section class="sm-editor__blocks">
          ${activeSchedule?.blocks?.map((block) => html`
            <${BlockEditor} \
              block=${block} \
              editingBlockId=${editingBlockId} \
              setEditingBlockId=${setEditingBlockId} \
            />
          `) || ''}
        </section>
        <button class="sm-editor__add-block" onClick=${handleAddBlock}>
          <p>Add block</p>
          <span class="icon icon-add-circle sm-icon-xs"></span>
        </button>
      </section>
    </section>
  `;
}
