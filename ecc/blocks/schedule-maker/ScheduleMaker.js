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
  const {
    schedules,
    isInitialLoading,
    activeSchedule,
    setActiveSchedule,
    toastError,
    clearToastError,
  } = useSchedules();

  return html`
  <sp-theme color="light" scale="medium">
    <div class="schedule-maker-app">
      <div class="schedule-maker-tabs">
        ${Object.values(PAGES_CONFIG).map((page) => html`
          <button class="schedule-maker-tab ${activePage.pageComponent === page.pageComponent ? 'schedule-maker-tab-active' : ''}" onclick=${() => setActivePage(page)}>
            ${page.label}
          </button>
        `)}
      </div>
      
      ${isInitialLoading && html`
      <div class="schedule-maker-progress-circle">
        <sp-progress-circle size="l" indeterminate label="Loading schedules" />
      </div>`}
      
      ${!isInitialLoading && html`
      <div class="schedule-maker-content">
        ${html`<${PAGES_COMPONENTS[activePage.pageComponent]} schedules=${schedules} setActivePage=${setActivePage} setActiveSchedule=${setActiveSchedule} activePage=${activePage} activeSchedule=${activeSchedule} />`}
      </div>`}
      
      ${toastError && html`
      <div class="schedule-maker-toast schedule-maker-toast-error">
        <sp-toast variant="negative" open onclose=${clearToastError}>
          ${toastError}
        </sp-toast>
      </div>`}
    </div>
  </sp-theme>`;
}
