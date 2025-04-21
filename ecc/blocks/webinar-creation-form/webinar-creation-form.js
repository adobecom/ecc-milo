/* eslint-disable no-async-promise-executor */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */
import { buildNoAccessScreen, signIn } from '../../scripts/utils.js';
import { initProfileLogicTree } from '../../scripts/profile.js';
import { buildLoadingScreen, buildECCForm } from '../form-handler/form-handler-helper.js';

export default async function init(el) {
  buildLoadingScreen(el);
  await initSpectrumComponents();
  await initProfileLogicTree('webinar-creation-form', {
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
