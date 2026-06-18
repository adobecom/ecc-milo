import { useState } from '../../../scripts/deps/preact-hook.js';
import { html } from '../htm-wrapper.js';
import BuildTableIcon from '../components/BuildTableIcon.js';
import AddScheduleModal from '../components/AddScheduleModal.js';
import { useNavigation } from '../context/NavigationContext.js';
import { useSchedulesData } from '../context/SchedulesContext.js';
import SearchInput from '../components/SearchInput.js';

export default function Home() {
  const { goToEditSchedule } = useNavigation();
  const { schedules, setActiveSchedule } = useSchedulesData();
  const [filteredSchedules, setFilteredSchedules] = useState(schedules);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSelectSchedule = (schedule) => {
    const url = new URL(window.location);
    url.searchParams.delete('schedule');
    url.searchParams.set('scheduleId', schedule.scheduleId);
    window.history.replaceState({}, '', url);

    setActiveSchedule(schedule);
    goToEditSchedule();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
    const localFilteredSchedules = schedules.filter((schedule) => {
      const lowerCaseTitle = schedule.title.toLowerCase();
      const lowerCaseSearchValue = search.toLowerCase();
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
            <sp-button size="xl" static-color="black" treatment="outline" onClick=${() => setIsCreateModalOpen(true)}>
              New schedule
            </sp-button>
          </div>
        </div>
      </div>
      <div class="sm-home__schedules">
        <div class="sm-home__schedules-header">
          <h2>Select Schedule</h2>
          <${SearchInput} \
            placeholder="Search schedules" \
            value=${search} \
            onInput="${handleSearch}" \
            className="sm-home__schedules-search" \
          />
        </div>
        <ul class="sm-home__schedules-list">
          ${filteredSchedules?.map((schedule) => html`
            <li class="sm-home__schedules-item">
              <sp-action-button quiet size="l" onClick=${() => handleSelectSchedule(schedule)}>
                ${schedule.title}
              </sp-action-button>
            </li>`)}
        </ul>
      </div>
      <${AddScheduleModal} \
        isOpen=${isCreateModalOpen} \
        onClose=${() => setIsCreateModalOpen(false)} \
      />
    </div>`;
}
