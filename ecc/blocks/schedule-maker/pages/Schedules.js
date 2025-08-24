import { html } from '../htm-wrapper.js';
import Sidebar from '../components/Sidebar.js';

function Schedules({ schedules }) {
  console.log('Schedules', schedules);

  return html`
    <div class="schedules-page">
      <div class="schedules-page-sidebar">
        ${html`<${Sidebar} />`}
      </div>
      <div class="schedules-page-content">
        <h1>Schedules</h1>
      </div>
    </div>
  `;
}

export default Schedules;
