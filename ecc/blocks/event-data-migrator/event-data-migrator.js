import { LIBS } from '../../scripts/scripts.js';
import { getSeriesForUser } from '../../scripts/esp-controller.js';
import { buildNoAccessScreen, generateToolTip, readBlockConfig, signIn } from '../../scripts/utils.js';
import EventDataMigrator from '../../components/event-data-migrator/event-data-migrator.js';
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

function buildLoadingScreen(el) {
  el.classList.add('loading');
  const loadingScreen = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'loading-screen' });
  createTag('sp-progress-circle', { size: 'l', indeterminate: true }, '', { parent: loadingScreen });
  createTag('sp-field-label', {}, 'Loading Event Data Migrator...', { parent: loadingScreen });

  el.prepend(loadingScreen);

  return loadingScreen;
}

async function buildMigrator(el, blockConfig) {
  const spTheme = createTag('sp-theme', { color: 'light', scale: 'medium' });
  el.parentElement.replaceChild(spTheme, el);

  spTheme.appendChild(el);

  const series = await getSeriesForUser();

  if (!series) return;

  customElements.define('event-data-migrator', EventDataMigrator);

  const migrator = createTag('event-data-migrator', { class: 'event-data-migrator' }, '', { parent: el });
  migrator.series = series;
  migrator.config = blockConfig;
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

  await initProfileLogicTree('event-data-migrator', {
    noProfile: () => {
      signIn();
    },
    noAccessProfile: () => {
      buildNoAccessScreen(el);
    },
    validProfile: () => {
      buildMigrator(el, blockConfig);
      loadingScreen.remove();
    },
  });
}
