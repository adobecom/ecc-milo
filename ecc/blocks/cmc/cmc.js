import { LIBS } from '../../scripts/scripts.js';
import { getCaasTags, getClouds } from '../../scripts/esp-controller.js';
import { buildNoAccessScreen, generateToolTip, getDevToken, getEventServiceEnv, readBlockConfig, signIn } from '../../scripts/utils.js';
import CloudManagementConsole from '../../components/cmc/cmc.js';
import { initProfileLogicTree } from '../../scripts/profile.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function deepGetTagByTagID(tags, tagID) {
  const tagIDs = tagID.replace('caas:', '').split('/');
  let currentTag = tags;

  tagIDs.forEach((tag) => {
    currentTag = currentTag.tags[tag];
  });

  return currentTag;
}

function buildLoadingScreen(el) {
  el.classList.add('loading');
  const loadingScreen = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'loading-screen' });
  createTag('sp-progress-circle', { size: 'l', indeterminate: true }, '', { parent: loadingScreen });
  createTag('sp-field-label', {}, 'Loading Adobe Events Cloud Management Console...', { parent: loadingScreen });

  el.prepend(loadingScreen);
}

async function buildCMC(el, blockConfig) {
  await Promise.all([
    import(`${LIBS}/deps/lit-all.min.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/theme.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/toast.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/checkbox.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/menu.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/picker.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/button.js`),
  ]);

  const spTheme = createTag('sp-theme', { color: 'light', scale: 'medium' });
  el.parentElement.replaceChild(spTheme, el);

  spTheme.appendChild(el);

  const caasTags = await getCaasTags();

  if (!caasTags) return;

  const clouds = await getClouds();

  const savedTags = {};
  clouds.forEach((cloud) => {
    const { cloudType, cloudTags } = cloud;

    if (!cloudTags) return;

    const fullTags = cloudTags.map((tag) => deepGetTagByTagID(caasTags, tag.caasId));

    savedTags[cloudType] = fullTags || [];
  });

  customElements.define('cloud-management-console', CloudManagementConsole);

  const tagManager = createTag('cloud-management-console', { class: 'cloud-management-console' }, '', { parent: el });
  tagManager.tags = caasTags.namespaces.caas;
  tagManager.savedTags = savedTags;
  tagManager.config = blockConfig;
  tagManager.clouds = clouds;
}

export default async function init(el) {
  generateToolTip(el);

  const blockConfig = readBlockConfig(el);

  el.innerHTML = '';
  buildLoadingScreen(el);

  const devToken = getDevToken();
  if (devToken && ['local', 'dev'].includes(getEventServiceEnv())) {
    buildCMC(el, blockConfig);
    return;
  }

  await initProfileLogicTree('cmc', {
    noProfile: () => {
      signIn();
    },
    noAccessProfile: () => {
      buildNoAccessScreen(el);
    },
    validProfile: () => {
      buildCMC(el, blockConfig);
    },
  });
}
