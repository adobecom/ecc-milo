import { html } from './htm-wrapper.js';
import Home from './pages/Home.js';
import Schedules from './pages/Schedules.js';
import { PAGES } from './constants.js';
import { useNavigation } from './context/NavigationContext.js';
import { useSchedulesData, useSchedulesUI } from './context/SchedulesContext.js';
import { useEffect } from '../../scripts/deps/preact-hook.js';
import { ScheduleURLUtility } from './utils.js';

const PAGES_COMPONENTS = {
  [PAGES.home]: Home,
  [PAGES.schedules]: Schedules,
};

export default function ScheduleMaker() {
  const { schedules, setActiveSchedule } = useSchedulesData();
  const {
    toastError,
    clearToastError,
    toastSuccess,
    clearToastSuccess,
    isInitialLoading,
  } = useSchedulesUI();
  const { activePage, goToEditSchedule } = useNavigation();
  // On load, check if there is a schedule in the URL
  useEffect(() => {
    async function handleScheduleInUrl() {
      if (isInitialLoading) return;
      const urlParams = new URLSearchParams(window.location.search);
      const scheduleParam = urlParams.get('schedule');
      if (scheduleParam) {
        goToEditSchedule();
        const scheduleData = await ScheduleURLUtility.extractScheduleFromURL(window.location.href);
        const { scheduleId } = scheduleData;
        const schedule = schedules.find((s) => s.scheduleId === scheduleId);
        if (schedule) {
          setActiveSchedule(schedule);
        }
      }
    }

    handleScheduleInUrl();
  }, [isInitialLoading]);

  return html`
  <sp-theme color="light" scale="medium">
    <div class="sm-app">
      ${isInitialLoading && html`
      <div class="sm-loading">
        <sp-progress-circle size="l" indeterminate label="Loading schedules" />
      </div>`}
      
      ${!isInitialLoading && html`
      <div class="sm-content">
        ${html`<${PAGES_COMPONENTS[activePage.pageComponent]} />`}
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
