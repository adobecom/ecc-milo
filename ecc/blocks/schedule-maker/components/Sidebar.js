import { useState } from '../../../scripts/libs/preact-hook.js';
import { html } from '../htm-wrapper.js';
import { useSchedules } from '../context/SchedulesContext.js';

function Sidebar({ schedules, activeSchedule, setActiveSchedule }) {
  const [search, setSearch] = useState('');
  const { hasUnsavedChanges } = useSchedules();

  const handleAddSchedule = () => {
    if (hasUnsavedChanges) {
      alert('You have unsaved changes. Please save or discard them before adding a new schedule.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('handleSearch', e.target.value);
    setSearch(e.target.value);
  };

  const handleSelectSchedule = (schedule) => {
    if (hasUnsavedChanges) {
      alert('You have unsaved changes. Please save or discard them before selecting a new schedule.');
      return;
    }
    setActiveSchedule(schedule);
  };

  const filteredSchedules = schedules?.filter(
    (schedule) => {
      const searchTerm = search.toLowerCase();
      const title = schedule.title.toLowerCase();
      return title.includes(searchTerm);
    },
  );

  return html`
    <div class="side-bar">
      <sp-button class="side-bar-button" size="xl" static-color="black" onclick=${handleAddSchedule}>
        <span slot="icon" class="icon icon-add-circle"></span>
        Add Schedule
      </sp-button>
      <sp-search class="side-bar-search" placeholder="Search schedules" oninput=${handleSearch}></sp-search>
      <h2>Select schedule</h2>
      <div class="side-bar-schedules">
          ${filteredSchedules?.map((schedule) => html`
            <button key="${schedule.id}" class="side-bar-schedule ${activeSchedule?.scheduleId === schedule.scheduleId ? 'active' : ''}" onclick=${() => handleSelectSchedule(schedule)}>${schedule.title}</button>
          `)}
      </div>
    </div>
  `;
}

export default Sidebar;
