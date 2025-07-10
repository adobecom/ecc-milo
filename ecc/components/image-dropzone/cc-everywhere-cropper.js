import { LIBS } from '../../scripts/scripts.js';
import {
  getErrorMsg,
  createDocConfig,
  createMergeVideosDocConfig,
  createDefaultExportConfig,
  executeQuickAction,
  processFilesForQuickAction,
  loadAndInitializeCCEverywhere,
} from './cc-everywhere-utils.js';

const { createTag, getConfig } = await import(`${LIBS}/utils/utils.js`);

let ccEverywhere;
let quickActionContainer;

export function runQuickAction(quickActionId, data) {
  const exportConfig = createDefaultExportConfig();

  quickActionContainer = createTag('div', { id: `${quickActionId}-container`, class: 'quick-action-container' });
  document.body.append(quickActionContainer);

  const docConfig = createDocConfig(data[0], 'image');
  const videoDocConfig = quickActionId === 'merge-videos' ? createMergeVideosDocConfig(data) : createDocConfig(data[0], 'video');

  const appConfig = {
    receiveQuickActionErrors: true,
    callbacks: {
      onError: (error) => {
        quickActionContainer.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error } }));
      },
    },
  };

  if (!ccEverywhere) return;

  // Execute the quick action using the helper function
  executeQuickAction(
    ccEverywhere,
    quickActionId,
    docConfig,
    appConfig,
    exportConfig,
    videoDocConfig,
  );
}

// eslint-disable-next-line default-param-last
async function startSDK(data = [''], quickAction) {
  if (!ccEverywhere) {
    ccEverywhere = await loadAndInitializeCCEverywhere(getConfig);
  }
  runQuickAction(quickAction, data);
}

async function startSDKWithUnconvertedFiles(files, quickAction, triggerElement) {
  let data = await processFilesForQuickAction(files, quickAction);
  if (!data[0]) {
    const msg = await getErrorMsg(files, quickAction, getConfig);
    triggerElement.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: msg } }));
    return;
  }

  if (data.some((item) => !item)) {
    const msg = await getErrorMsg(files, quickAction, getConfig);
    triggerElement.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: msg } }));
    data = data.filter((item) => item);
  }

  startSDK(data, quickAction);
}

export default async function init(dropzone, triggerElement) {
  triggerElement.addEventListener('click', () => {
    console.log('dropzone', dropzone);
    console.log('file', dropzone.file);
    const { file } = dropzone;
    startSDKWithUnconvertedFiles([file], 'crop-image', triggerElement);
  });
}
