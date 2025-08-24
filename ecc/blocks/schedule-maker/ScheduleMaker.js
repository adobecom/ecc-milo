// import { getSchedules } from '../../scripts/esp-controller.js';
import { getSchedules } from './mockAPI/schedules-controller.js';
import { html } from './htm-wrapper.js';
import { useEffect, useState } from '../../scripts/libs/preact-hook.js';
import useNavigation from './hooks/useNavigation.js';
import Home from './pages/Home.js';
import Schedules from './pages/Schedules.js';
import { PAGES, PAGES_CONFIG } from './constants.js';

const PAGES_COMPONENTS = {
  [PAGES.home]: Home,
  [PAGES.schedules]: Schedules,
};

export default function ScheduleMaker() {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [activeSchedule, setActiveSchedule] = useState(null);
  const { activePage, setActivePage } = useNavigation();

  useEffect(() => {
    getSchedules().then((schedulesResponse) => {
      setSchedules(schedulesResponse);
      setIsLoading(false);
    });
  }, []);

  console.log('PAGES_COMPONENTS', PAGES_COMPONENTS);
  console.log('activePage', activePage);
  console.log('activePage.pageComponent', activePage.pageComponent);

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
          ${html`<${PAGES_COMPONENTS[activePage.pageComponent]} schedules=${schedules} setActivePage=${setActivePage} setActiveSchedule=${setActiveSchedule} activePage=${activePage} />`}
          </div>` : null}
      </div>
    </sp-theme>
  `;
}
