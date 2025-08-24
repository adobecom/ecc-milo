// import { getSchedules } from '../../scripts/esp-controller.js';
import { getSchedules } from './mockAPI/schedules-controller.js';
import { html } from './htm-wrapper.js';
import { useEffect, useState } from '../../scripts/libs/preact-hook.js';
import Home from './pages/Home.js';
import Schedules from './pages/Schedules.js';

export default function ScheduleMaker() {
  const tabs = [
    {
      id: 'home',
      label: 'Home',
      component: Home,
    },
    {
      id: 'schedules',
      label: 'Schedules',
      component: Schedules,
    },
  ];
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSchedule, setActiveSchedule] = useState(null);

  console.log('activeSchedule', activeSchedule);

  useEffect(() => {
    getSchedules().then((schedulesResponse) => {
      setSchedules(schedulesResponse);
      setIsLoading(false);
    });
  }, []);

  const getActiveComponent = () => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab);
    return activeTabData ? activeTabData.component : tabs[0].component;
  };

  // if (isLoading) {
  //   return html`<sp-theme color="light" scale="medium">
  //     <div class="schedule-maker">
  //       <div class="schedule-maker-tabs">
  //         <sp-progress-circle size="l" indeterminate label="Loading schedules" />
  //         </div>
  //       </div>
  //     </sp-theme>
  //   `;
  // }

  return html`
  <sp-theme color="light" scale="medium">
    <div class="schedule-maker">
      <div class="schedule-maker-tabs">
      ${tabs.map((tab) => html`
        <button class="schedule-maker-tab ${activeTab === tab.id ? 'schedule-maker-tab-active' : ''}" onClick=${() => setActiveTab(tab.id)}>
          ${tab.label}
        </button>
      `)}
      </div>
      ${isLoading ? html`
        <div class="schedule-maker-progress-circle">
          <sp-progress-circle size="l" indeterminate label="Loading schedules" />
        </div>` : null}
      ${!isLoading ? html`
        <div class="schedule-maker-content">
          ${html`<${getActiveComponent()} schedules=${schedules} setActiveTab=${setActiveTab} setActiveSchedule=${setActiveSchedule} activeTab=${activeTab} />`}
        </div>` : null}
    </div>
  </sp-theme>`;
}
