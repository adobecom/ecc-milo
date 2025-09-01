import { useState } from '../../../scripts/libs/preact-hook.js';
import { html } from '../htm-wrapper.js';

function Sidebar({ schedules, activeSchedule, setActiveSchedule }) {
  const [search, setSearch] = useState('');

  const handleAddSchedule = () => {
    console.log('handleAddSchedule');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('handleSearch', e.target.value);
    setSearch(e.target.value);
  };

  const handleSelectSchedule = (schedule) => {
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
      <sp-button class="side-bar-button" icon="add" size="xl" static-color="black" onclick=${handleAddSchedule}>Add Schedule</sp-button>
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
