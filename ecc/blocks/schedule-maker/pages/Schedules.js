import { html } from '../htm-wrapper.js';
import Sidebar from '../components/Sidebar.js';
import ScheduleEditor from '../components/ScheduleEditor.js';
import SheetImporter from '../components/SheetImporter.js';
import { useNavigation } from '../context/NavigationContext.js';
import { useEffect } from '../../../scripts/libs/preact-hook.js';

function Schedules({ schedules, activeSchedule, setActiveSchedule }) {
  const { activePage } = useNavigation();

  useEffect(() => {
    console.log('Schedules');
  }, []);

  return html`
    <div class="schedules-page">
      <h1>Schedule Maker</h1>
      <div class="schedules-page-content-container">
        <div class="schedules-page-sidebar">
          ${html`<${Sidebar} schedules=${schedules} activeSchedule=${activeSchedule} setActiveSchedule=${setActiveSchedule} />`}
        </div>
        <div class="schedules-page-content">
          ${activePage.mode === 'edit' ? html`
            <${ScheduleEditor} />` : html`
            <${SheetImporter} />`}
        </div>
      </div>
    </div>
  `;
}

export default Schedules;
