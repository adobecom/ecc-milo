// import { getEvents, getSchedules } from '../../scripts/esp-controller.js';
// import { getSchedules } from './mockAPI/schedules-controller.js';
import { html } from './htm-wrapper.js';
import Home from './pages/Home.js';
import Schedules from './pages/Schedules.js';
import { PAGES, PAGES_CONFIG } from './constants.js';
import { useNavigation } from './context/NavigationContext.js';
import { useSchedules } from './context/SchedulesContext.js';

const PAGES_COMPONENTS = {
  [PAGES.home]: Home,
  [PAGES.schedules]: Schedules,
};

export default function ScheduleMaker() {
  const { activePage, setActivePage } = useNavigation();
  const { schedules, isLoading, activeSchedule, setActiveSchedule } = useSchedules();

  return html`
  <sp-theme color="light" scale="medium">
    <div class="schedule-maker">
      <div class="schedule-maker-tabs">
        ${Object.values(PAGES_CONFIG).map((page) => html`
          <button class="schedule-maker-tab ${activePage.pageComponent === page.pageComponent ? 'schedule-maker-tab-active' : ''}" onclick=${() => setActivePage(page)}>
            ${page.label}
          </button>
        `)}
      </div>
      ${isLoading ? html`
      <div class="schedule-maker-progress-circle">
        <sp-progress-circle size="l" indeterminate label="Loading schedules" />
      </div>` : null}
      ${!isLoading ? html`
      <div class="schedule-maker-content">
        ${html`<${PAGES_COMPONENTS[activePage.pageComponent]} schedules=${schedules} setActivePage=${setActivePage} setActiveSchedule=${setActiveSchedule} activePage=${activePage} activeSchedule=${activeSchedule} />`}
      </div>` : null}
    </div>
  </sp-theme>`;
}
