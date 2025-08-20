import { render } from '../../scripts/libs/preact.js';
import { initProfileLogicTree } from '../../scripts/profile.js';
import { html } from './htm-wrapper.js';
import ScheduleMaker from './ScheduleMaker.js';
import { buildNoAccessScreen, signIn } from '../../scripts/utils.js';
import { LIBS } from '../../scripts/scripts.js';

export default async function init(el) {
  el.innerHTML = '';

  await Promise.all([
    import(`${LIBS}/deps/lit-all.min.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/theme.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/button.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/tabs.js`),
  ]);

  initProfileLogicTree('schedule-maker', {
    noProfile: () => {
      signIn();
    },
    noAccessProfile: () => {
      buildNoAccessScreen(el);
    },
    validProfile: () => {
      render(html`<${ScheduleMaker} />`, el);
    },
  });
}
