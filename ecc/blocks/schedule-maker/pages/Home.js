import { useState } from '../../../scripts/libs/preact-hook.js';
import { html } from '../htm-wrapper.js';
import BuildTableIcon from '../components/BuildTableIcon.js';
import CreateManuallyScheduleModal from '../components/CreateManuallyScheduleModal.js';
import { useNavigation } from '../context/NavigationContext.js';
import { useSchedules } from '../context/SchedulesContext.js';

export default function Home({ schedules }) {
  const { goToEditSchedule, goToSheetImport } = useNavigation();
  const [filteredSchedules, setFilteredSchedules] = useState(schedules);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { createAndAddSchedule, setActiveSchedule } = useSchedules();

  const handleCreateManuallyBtn = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateFromSheetBtn = () => {
    goToSheetImport();
  };

  const handleSelectSchedule = (schedule) => {
    setActiveSchedule(schedule);
    goToEditSchedule();
  };

  const handleCreateSchedule = async (scheduleName) => {
    const newSchedule = {
      title: scheduleName,
      blocks: [],
    };
    const newScheduleResponse = await createAndAddSchedule(newSchedule);
    setActiveSchedule(newScheduleResponse);
    goToEditSchedule();
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = e.target.value;
    const localFilteredSchedules = schedules.filter((schedule) => {
      const lowerCaseTitle = schedule.title.toLowerCase();
      const lowerCaseSearchValue = searchValue.toLowerCase();
      return lowerCaseTitle.includes(lowerCaseSearchValue);
    });
    setFilteredSchedules(localFilteredSchedules);
  };

  return html`
    <div class="sm-page">
      <h1 class="sm-page__title">Schedule Maker</h1>
      <div class="sm-home__quick-actions">
        <div class="sm-home__quick-actions-icon"><${BuildTableIcon} /></div>
        <div class="sm-home__quick-actions-content">
          <h2>Create a new schedule</h2>
          <div class="sm-home__quick-actions-buttons">
            <sp-button size="xl" static-color="black" treatment="outline" onClick=${handleCreateManuallyBtn}>
              Create Manually
            </sp-button>
            <sp-button size="xl" static-color="black" treatment="outline" onClick=${handleCreateFromSheetBtn}>
              Create from Sheet
            </sp-button>
          </div>
        </div>
      </div>
      <div class="sm-home__schedules">
        <div class="sm-home__schedules-header">
          <h2>Select Schedule</h2>
          <sp-search placeholder="Search schedules" size="l" oninput=${handleSearch} onsubmit=${handleSearch} />
        </div>
        <ul class="sm-home__schedules-list">
          ${filteredSchedules.map((schedule) => html`
            <li class="sm-home__schedules-item">
              <sp-action-button quiet size="l" onClick=${() => handleSelectSchedule(schedule)}>
                ${schedule.title}
              </sp-action-button>
            </li>`)}
        </ul>
      </div>
      <${CreateManuallyScheduleModal} isOpen=${isCreateModalOpen} onClose=${handleCloseCreateModal} onConfirm=${handleCreateSchedule} />
    </div>`;
}
