import { LIBS } from '../../scripts/scripts.js';
import { getCaasTags, getClouds, getLocales } from '../../scripts/esp-controller.js';
import {
  buildNoAccessScreen,
  generateToolTip,
  readBlockConfig,
  signIn,
} from '../../scripts/utils.js';
import CloudManagementConsole from '../../components/cmc/cmc.js';
import { initProfileLogicTree } from '../../scripts/profile.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

const SPECTRUM_COMPONENTS = [
  'theme',
  'toast',
  'checkbox',
  'menu',
  'picker',
  'button',
  'progress-circle',
  'action-button',
];

function deepGetTagByTagID(tags, tagID) {
  const tagIDs = tagID.replace('caas:', '').split('/');
  let currentTag = tags;

  tagIDs.forEach((id) => {
    currentTag = currentTag.tags[id];
  });

  return currentTag;
}

function buildLoadingScreen(el) {
  el.classList.add('loading');
  const loadingScreen = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'loading-screen' });
  createTag('sp-progress-circle', { size: 'l', indeterminate: true }, '', { parent: loadingScreen });
  createTag('sp-field-label', {}, 'Loading Adobe Events Cloud Management Console...', { parent: loadingScreen });

  el.prepend(loadingScreen);

  return loadingScreen;
}

async function buildCMC(el, blockConfig) {
  const spTheme = createTag('sp-theme', { color: 'light', scale: 'medium' });
  el.parentElement.replaceChild(spTheme, el);

  spTheme.appendChild(el);

  const caasResp = await getCaasTags();

  if (!caasResp) return;

  const caasTags = caasResp.namespaces.caas;

  if (!caasTags) return;

  const clouds = await getClouds();

  const savedTags = {};
  const savedLangs = {};

  const locales = await getLocales();

  console.log(locales);

  clouds.forEach((cloud) => {
    const { cloudType, cloudTags, cloudLangs } = cloud;

    if (!cloudTags) return;

    const fullTags = cloudTags.map((tag) => deepGetTagByTagID(caasTags, tag.caasId));

    savedTags[cloudType] = fullTags || [];
    savedLangs[cloudType] = cloudLangs || [];
  });

  customElements.define('cloud-management-console', CloudManagementConsole);

  const tagManager = createTag('cloud-management-console', { class: 'cloud-management-console' }, '', { parent: el });
  tagManager.tags = caasTags;
  tagManager.savedTags = savedTags;
  tagManager.savedLangs = savedLangs;
  tagManager.config = blockConfig;
  tagManager.clouds = clouds;
}

export default async function init(el) {
  generateToolTip(el);

  const blockConfig = readBlockConfig(el);

  const promises = Array.from(SPECTRUM_COMPONENTS).map(async (component) => {
    await import(`${LIBS}/features/spectrum-web-components/dist/${component}.js`);
  });

  el.innerHTML = '';
  await Promise.all([
    import(`${LIBS}/deps/lit-all.min.js`),
    ...promises,
  ]);

  const loadingScreen = buildLoadingScreen(el);

  await initProfileLogicTree('cmc', {
    noProfile: () => {
      signIn();
    },
    noAccessProfile: () => {
      buildNoAccessScreen(el);
    },
    validProfile: () => {
      buildCMC(el, blockConfig);
      loadingScreen.remove();
    },
  });
}
