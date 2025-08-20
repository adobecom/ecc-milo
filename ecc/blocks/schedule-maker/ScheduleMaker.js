import { getSchedules } from '../../scripts/esp-controller.js';
import { html } from './htm-wrapper.js';
import { useEffect, useState } from '../../scripts/libs/preact-hook.js';
import Home from './tabs/Home.js';
import ManualCreation from './tabs/ManualCreation.js';
import SheetImporter from './tabs/SheetImporter.js';

export default function ScheduleMaker() {
  const tabs = [
    {
      label: 'Home',
      component: Home,
    },
    {
      label: 'Manual Creation',
      component: ManualCreation,
    },
    {
      label: 'Sheet Importer',
      component: SheetImporter,
    },
  ];
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    getSchedules().then((schedulesResponse) => {
      setSchedules(schedulesResponse);
    });
  }, []);

  console.log({ schedules });

  return html`
  <sp-theme color="light" scale="medium">
    <div class="schedule-maker">
      <sp-tabs selected=${tabs[0].label}>
          ${tabs.map((tab) => html`
            <sp-tab value=${tab.label} label=${tab.label}>${tab.label}</sp-tab>
          `)}
          ${tabs.map((tab) => html`
            <sp-tab-panel value=${tab.label}>
              ${html`<${tab.component} />`}
            </sp-tab-panel>
          `)}
      </sp-tabs>
    </div>
  </sp-theme>`;
}
