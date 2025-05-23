import {
  buildNoAccessScreen,
  signIn,
} from '../../scripts/utils.js';

import { initProfileLogicTree } from '../../scripts/profile.js';
import { buildLoadingScreen, buildECCForm, initSpectrumComponents, initCustomLitComponents } from './form-handler-helper.js';

export default async function init(el) {
  buildLoadingScreen(el);
  initCustomLitComponents();
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
