import { LIBS } from '../../scripts/scripts.js';
import { getCaasTags, getClouds } from '../../scripts/esp-controller.js';
import { generateToolTip, readBlockConfig } from '../../scripts/utils.js';
import CloudManagementConsole from '../../components/cmc/cmc.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

export default async function init(el) {
  generateToolTip(el);

  const blockConfig = readBlockConfig(el);

  el.innerHTML = '';

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
    const { cloudType, tags } = cloud;
    savedTags[cloudType] = tags || [];
  });

  customElements.define('cloud-management-console', CloudManagementConsole);

  const tagManager = createTag('cloud-management-console', { class: 'cloud-management-console' }, '', { parent: el });
  tagManager.tags = caasTags.namespaces.caas;
  tagManager.savedTags = savedTags;
  tagManager.config = blockConfig;
  tagManager.clouds = clouds;
}
