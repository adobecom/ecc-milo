import { render } from '../../scripts/libs/preact.js';
import { initProfileLogicTree } from '../../scripts/profile.js';
import { html } from './htm-wrapper.js';
import ScheduleMaker from './ScheduleMaker.js';
import { buildNoAccessScreen, signIn } from '../../scripts/utils.js';
import { LIBS } from '../../scripts/scripts.js';
import { NavigationProvider } from './context/NavigationContext.js';
import { SchedulesProvider } from './context/SchedulesContext.js';

export default async function init(el) {
  el.innerHTML = '';

  await Promise.all([
    import(`${LIBS}/deps/lit-all.min.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/theme.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/button.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/tabs.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/search.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/action-button.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/progress-circle.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/icon.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/textfield.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/toast.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/checkbox.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/field-label.js`),
  ]);

  initProfileLogicTree('schedule-maker', {
    noProfile: () => {
      signIn();
    },
    noAccessProfile: () => {
      buildNoAccessScreen(el);
    },
    validProfile: () => {
      render(
        html`
          <${SchedulesProvider}>
            <${NavigationProvider}>
                <${ScheduleMaker} />
            </${NavigationProvider}>
          </${SchedulesProvider}>
        `,
        el,
      );
    },
  });
}
