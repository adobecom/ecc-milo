import { useState } from '../../../scripts/deps/preact-hook.js';
import { html } from '../htm-wrapper.js';
import Modal from './Modal.js';
import BuildTableIcon from './BuildTableIcon.js';
import { useSchedulesOperations, useSchedulesData } from '../context/SchedulesContext.js';
import { useNavigation } from '../context/NavigationContext.js';
import { SUPPORTED_REPOS, DEFAULT_REPO_NAME } from '../repos.js';
import { setRepoForSchedule } from '../schedule-repo-store.js';

export default function AddScheduleModal({ isOpen, onClose }) {
  const [scheduleName, setScheduleName] = useState('');
  const [selectedRepo, setSelectedRepo] = useState(DEFAULT_REPO_NAME);
  const { createAndAddSchedule } = useSchedulesOperations();
  const { setActiveSchedule } = useSchedulesData();
  const { goToEditSchedule, goToSheetImport } = useNavigation();

  const handleClose = () => {
    setScheduleName('');
    setSelectedRepo(DEFAULT_REPO_NAME);
    onClose();
  };

  const handleCreateManuallySchedule = async () => {
    const newSchedule = {
      title: scheduleName,
      isComplete: false,
      blocks: [],
    };
    const newScheduleResponse = await createAndAddSchedule(newSchedule);
    if (!newScheduleResponse.error) {
      setRepoForSchedule(newScheduleResponse.scheduleId, selectedRepo);
    }
    setActiveSchedule(newScheduleResponse);
    setScheduleName('');
    setSelectedRepo(DEFAULT_REPO_NAME);
    goToEditSchedule();
    onClose();
  };

  const handleCreateFromSheet = () => {
    if (!scheduleName.trim()) return;
    goToSheetImport(scheduleName, selectedRepo);
    setScheduleName('');
    setSelectedRepo(DEFAULT_REPO_NAME);
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
        <div class="add-schedule-form-repo-row">
          <sp-field-label size="l" for="schedule-repo">Repository</sp-field-label>
          <sp-picker \
            id="schedule-repo" \
            class="add-schedule-form-repo-picker" \
            size="l" \
            value=${selectedRepo} \
            onChange=${(e) => setSelectedRepo(e.target.value)} \
          >
            ${SUPPORTED_REPOS.map((r) => html`
              <sp-menu-item key=${r.repo} value=${r.repo}>
                ${r.label}${r.isFloodgate ? ' (fg)' : ''}
              </sp-menu-item>
            `)}
          </sp-picker>
        </div>
        <div class="add-schedule-form-buttons">
          <sp-button size="l" static-color="black" treatment="outline" onClick=${handleCreateManuallySchedule} disabled=${!scheduleName.trim()}>
            Create Manually
          </sp-button>
          <sp-button size="l" static-color="black" treatment="outline" onClick=${handleCreateFromSheet} disabled=${!scheduleName.trim()}>
            Create from Sheet
          </sp-button>
        </div>
      </div>
    </${Modal}>`;
}
