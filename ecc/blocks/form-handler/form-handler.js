import {
  buildNoAccessScreen,
  signIn,
} from '../../scripts/utils.js';

import { LIBS } from '../../scripts/scripts.js';
import { initProfileLogicTree } from '../../scripts/profile.js';
import { buildLoadingScreen, buildECCForm, SPECTRUM_COMPONENTS } from './form-handler-helper.js';

async function initSpectrumComponents() {
  const miloLibs = LIBS;
  const promises = Array.from(SPECTRUM_COMPONENTS).map(async (component) => {
    await import(`${miloLibs}/features/spectrum-web-components/dist/${component}.js`);
  });
  await Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    ...promises,
  ]);
}

export default async function init(el) {
  buildLoadingScreen(el);
  await initSpectrumComponents();
  await initProfileLogicTree('event-creation-form', {
    noProfile: () => {
      signIn();
    },
    noAccessProfile: () => {
      buildNoAccessScreen(el);
      el.classList.remove('loading');
    },
    validProfile: () => {
      buildECCForm(el).then(() => {
        el.classList.remove('loading');
      });
    },
  });
}
