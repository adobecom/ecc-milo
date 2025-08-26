import { html } from '../htm-wrapper.js';
import Sidebar from '../components/Sidebar.js';
import ScheduleEditor from '../components/ScheduleEditor.js';
import SheetImporter from '../components/SheetImporter.js';
import useNavigation from '../hooks/useNavigation.js';

function Schedules({ schedules, activeSchedule, setActiveSchedule }) {
  const { activePage } = useNavigation();

  return html`
    <div class="schedules-page">
      <h1>Schedule Maker</h1>
      <div class="schedules-page-content-container">
        <div class="schedules-page-sidebar">
          ${html`<${Sidebar} schedules=${schedules} activeSchedule=${activeSchedule} setActiveSchedule=${setActiveSchedule} />`}
        </div>
        <div class="schedules-page-content">
          <h2>Schedules</h2>
          ${activePage.mode === 'edit' ? html`
            <${ScheduleEditor} />` : html`
            <${SheetImporter} />`}
        </div>
      </div>
    </div>
  `;
}

export default Schedules;
