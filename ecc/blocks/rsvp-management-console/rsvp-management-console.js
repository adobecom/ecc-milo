import { LIBS } from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/utils.js';
import FieldManagementTable from '../../components/field-management-table/field-management-table.js';
import FieldTemplates from '../../components/field-templates/field-templates.js';

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
  'textfield',
  'switch',
  'dialog',
  'underlay',
  'button-group',
  'field-label',
];

function buildLoadingScreen(el) {
  el.classList.add('loading');
  const loadingScreen = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'loading-screen' });
  createTag('sp-progress-circle', { size: 'l', indeterminate: true }, '', { parent: loadingScreen });
  createTag('sp-field-label', {}, 'Loading RSVP Management Console...', { parent: loadingScreen });

  el.prepend(loadingScreen);

  return loadingScreen;
}

async function buildRMC(el, blockConfig) {
  // Create sp-theme inside the block element
  const spTheme = createTag('sp-theme', { color: 'light', scale: 'medium' }, '', { parent: el });

  customElements.define('field-templates', FieldTemplates);
  customElements.define('field-management-table', FieldManagementTable);

  const fieldManagementTable = createTag('field-management-table', { class: 'field-management-table' }, '', { parent: spTheme });
  fieldManagementTable.config = blockConfig;
  fieldManagementTable.spTheme = spTheme;
}

export default async function init(el) {
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

  // For now, we'll skip the profile check since this is a new feature
  buildRMC(el, blockConfig);
  loadingScreen.remove();
}
