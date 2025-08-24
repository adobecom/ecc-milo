import { useState } from '../../../scripts/libs/preact-hook.js';
import { html } from '../htm-wrapper.js';
import BuildTableIcon from '../components/BuildTableIcon.js';

export default function Home({ schedules, setActiveTab, setActiveSchedule }) {
  const [filteredSchedules, setFilteredSchedules] = useState(schedules);
  const handleCreateManually = () => {
    console.log('handleCreateManually');
    setActiveTab('manual-creation');
  };

  const handleCreateFromSheet = () => {
    console.log('handleCreateFromSheet');
    setActiveTab('sheet-importer');
  };

  const handleSelectSchedule = (schedule) => {
    setActiveSchedule(schedule);
    setActiveTab('manual-creation');
  };

  const handleSearch = (e) => {
    console.log('handleSearch');
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
    <div class="home-tab">
      <h1>Schedule Maker</h1>
      <div class="home-quick-actions">
        <div class="home-quick-actions-icon">
          ${html`<${BuildTableIcon} />`}
        </div>
        <div class="home-quick-actions-content">
          <h2>Create a new schedule</h2>
          <div class="home-quick-actions-content-buttons">
            <sp-button size="xl" static-color="black" treatment="outline" onClick=${handleCreateManually}>
              Create Manually
            </sp-button>
            <sp-button size="xl" onClick=${handleCreateFromSheet}>
              Create from Sheet
            </sp-button>
          </div>
        </div>
      </div>
      <div class="home-schedules">
        <div class="home-schedules-header">
          <h2>Select Schedule</h2>
          <sp-search placeholder="Search schedules" size="l" oninput=${handleSearch} onsubmit=${handleSearch} />
        </div>
        <ul class="home-schedules-list">
          ${filteredSchedules.map((schedule) => html`
            <li class="home-schedules-list-item">
              <sp-action-button quiet size="l" onClick=${() => handleSelectSchedule(schedule)}>
                ${schedule.title}
              </sp-action-button>
            </li>
          `)}
        </ul>
      </div>
    </div>
  `;
}
