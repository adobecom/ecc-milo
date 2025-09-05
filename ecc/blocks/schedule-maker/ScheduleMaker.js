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
    toastSuccess,
    clearToastSuccess,
  } = useSchedules();

  return html`
  <sp-theme color="light" scale="medium">
    <div class="sm-app">
      <div class="sm-tabs">
        ${Object.values(PAGES_CONFIG).map((page) => html`
          <button class="sm-tab ${activePage.pageComponent === page.pageComponent ? 'sm-tab--active' : ''}" onclick=${() => setActivePage(page)}>
            ${page.label}
          </button>
        `)}
      </div>
      
      ${isInitialLoading && html`
      <div class="sm-loading">
        <sp-progress-circle size="l" indeterminate label="Loading schedules" />
      </div>`}
      
      ${!isInitialLoading && html`
      <div class="sm-content">
        ${html`<${PAGES_COMPONENTS[activePage.pageComponent]} schedules=${schedules} setActivePage=${setActivePage} setActiveSchedule=${setActiveSchedule} activePage=${activePage} activeSchedule=${activeSchedule} />`}
      </div>`}
      
      ${toastError && html`
      <div class="sm-toast sm-toast--error">
        <sp-toast variant="negative" open onclose=${clearToastError} timeout=${6000}>
          ${toastError}
        </sp-toast>
      </div>`}
      ${toastSuccess && html`
      <div class="sm-toast sm-toast--success">
        <sp-toast variant="positive" open onclose=${clearToastSuccess} timeout=${6000}>
          ${toastSuccess}
        </sp-toast>
      </div>`}
    </div>
  </sp-theme>`;
}
