import { useState } from '../../../scripts/libs/preact-hook.js';
import { html } from '../htm-wrapper.js';
import Modal from './Modal.js';
import BuildTableIcon from './BuildTableIcon.js';
import { useSchedules } from '../context/SchedulesContext.js';
import { useNavigation } from '../context/NavigationContext.js';

export default function AddScheduleModal({ isOpen, onClose }) {
  const [scheduleName, setScheduleName] = useState('');
  const { createAndAddSchedule, setActiveSchedule } = useSchedules();
  const { goToEditSchedule } = useNavigation();
  const handleClose = () => {
    setScheduleName('');
    onClose();
  };

  const handleCreateManuallySchedule = async () => {
    const newSchedule = {
      title: scheduleName,
      blocks: [],
    };
    const newScheduleResponse = await createAndAddSchedule(newSchedule);
    setActiveSchedule(newScheduleResponse);
    goToEditSchedule();
    onClose();
  };

  const handleCreateFromSheet = () => {
    if (!scheduleName.trim()) return;
    onClose();
  };

  return html`
    <${Modal} \
      isOpen=${isOpen} \
      onClose=${handleClose} \
      size="small"\
      showActions=${false} \
    >
      <div class="add-schedule-form-container">
        <${BuildTableIcon} />
        <h2>Create new schedule</h2>
        <sp-textfield \
          id="schedule-name" \
          class="add-schedule-form-textfield" \
          placeholder="Add schedule name" \
          size="l" \
          value=${scheduleName} \
          onInput=${(e) => setScheduleName(e.target.value)} \
        ></sp-textfield>
        <div class="add-schedule-form-buttons">
          <sp-button size="l" static-color="black" treatment="outline" onClick=${handleCreateManuallySchedule}>
            Create Manually
          </sp-button>
          <sp-button size="l" static-color="black" treatment="outline" onClick=${handleCreateFromSheet}>
            Create from Sheet
          </sp-button>
        </div>
      </div>
    </${Modal}>`;
}
