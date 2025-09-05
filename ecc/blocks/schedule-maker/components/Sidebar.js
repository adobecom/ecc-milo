import { useState } from '../../../scripts/libs/preact-hook.js';
import { html } from '../htm-wrapper.js';
import { useSchedules } from '../context/SchedulesContext.js';
import { useNavigation } from '../context/NavigationContext.js';

function Sidebar({ schedules, activeSchedule, setActiveSchedule, setIsAddScheduleModalOpen }) {
  const [search, setSearch] = useState('');
  const { hasUnsavedChanges } = useSchedules();
  const { goToEditSchedule } = useNavigation();

  const handleAddSchedule = () => {
    if (hasUnsavedChanges) {
      alert('You have unsaved changes. Please save or discard them before adding a new schedule.');
      return;
    }
    setIsAddScheduleModalOpen(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
  };

  const handleSelectSchedule = (schedule) => {
    if (hasUnsavedChanges) {
      alert('You have unsaved changes. Please save or discard them before selecting a new schedule.');
      return;
    }
    setActiveSchedule(schedule);
    goToEditSchedule();
  };

  const filteredSchedules = schedules?.filter(
    (schedule) => {
      const searchTerm = search.toLowerCase();
      const title = schedule.title.toLowerCase();
      return title.includes(searchTerm);
    },
  );

  return html`
    <div class="sm-sidebar">
      <sp-button class="sm-sidebar__button" size="l" static-color="black" onclick=${handleAddSchedule}>
        <span slot="icon" class="icon icon-add-circle"></span>
        Add Schedule
      </sp-button>
      <sp-search class="sm-sidebar__search" placeholder="Search schedules" oninput=${handleSearch}></sp-search>
      <h2>Select schedule</h2>
      <div class="sm-sidebar__schedules">
          ${filteredSchedules?.map((schedule) => html`
            <button \
              key="${schedule.id}" \
              class="sm-sidebar__schedule ${activeSchedule?.scheduleId === schedule.scheduleId ? 'sm-sidebar__schedule--active' : ''}" \
              onclick=${() => handleSelectSchedule(schedule)} \
            >
              ${schedule.title}
              ${!schedule.isComplete && html`
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M9.99936 15.1233C9.76871 15.1315 9.54398 15.0496 9.37275 14.895C9.04242 14.5304 9.04242 13.9751 9.37275 13.6104C9.5421 13.4521 9.76758 13.3677 9.99939 13.3757C10.2357 13.3662 10.4653 13.4559 10.6324 13.6231C10.7945 13.7908 10.8816 14.017 10.8738 14.2499C10.8862 14.4846 10.8042 14.7145 10.6461 14.8886C10.4725 15.0531 10.2382 15.1382 9.99936 15.1233Z" fill="#F03823"/>
                    <path d="M10 11.75C9.58594 11.75 9.25 11.4141 9.25 11V7C9.25 6.58594 9.58594 6.25 10 6.25C10.4141 6.25 10.75 6.58594 10.75 7V11C10.75 11.4141 10.4141 11.75 10 11.75Z" fill="#F03823"/>
                    <path d="M16.7334 18H3.2666C2.46631 18 1.74365 17.5898 1.33398 16.9023C0.924314 16.2148 0.906734 15.3838 1.28759 14.6797L8.021 2.23242C8.41455 1.50488 9.17286 1.05273 10 1.05273C10.8271 1.05273 11.5855 1.50488 11.979 2.23242L18.7124 14.6797C19.0933 15.3838 19.0757 16.2148 18.666 16.9023C18.2563 17.5898 17.5337 18 16.7334 18ZM10 2.55273C9.86572 2.55273 9.53223 2.59082 9.34033 2.94531L2.60693 15.3926C2.42382 15.7314 2.55664 16.0244 2.62255 16.1338C2.68798 16.2441 2.88183 16.5 3.26659 16.5H16.7334C17.1182 16.5 17.312 16.2441 17.3774 16.1338C17.4434 16.0244 17.5762 15.7314 17.3931 15.3926L10.6597 2.94531C10.4678 2.59082 10.1343 2.55273 10 2.55273Z" fill="#F03823"/>
                  </svg>
              `}
            </button>
          `)}
      </div>
    </div>
  `;
}

export default Sidebar;
