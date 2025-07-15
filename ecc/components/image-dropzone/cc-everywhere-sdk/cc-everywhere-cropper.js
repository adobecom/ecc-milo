import { LIBS } from '../../../scripts/scripts.js';
import {
  getErrorMsg,
  createDocConfig,
  createMergeVideosDocConfig,
  createDefaultExportConfig,
  executeQuickAction,
  processFilesForQuickAction,
  loadAndInitializeCCEverywhere,
} from './cc-everywhere-utils.js';

const { getConfig } = await import(`${LIBS}/utils/utils.js`);

let ccEverywhere;

export function runQuickAction(quickActionId, dropzone, data) {
  const exportConfig = createDefaultExportConfig();

  const docConfig = createDocConfig(data[0], 'image');
  const videoDocConfig = quickActionId === 'merge-videos' ? createMergeVideosDocConfig(data) : createDocConfig(data[0], 'video');

  const appConfig = {
    receiveQuickActionErrors: true,
    callbacks: {
      onError: (error) => {
        dropzone.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error } }));
      },
      onPublish: (params, result) => {
        // Handle the cropped image result
        if (result && result.asset && result.asset[0]) {
          const asset = result.asset[0];

          // Convert base64 to blob
          const base64Data = asset.data.split(',')[1]; // Remove data:image/png;base64, prefix
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i += 1) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: asset.fileType });

          // Create a new File object
          const croppedFile = new File([blob], asset.fileName || 'cropped-image.png', {
            type: asset.fileType,
            lastModified: Date.now(),
          });

          dropzone.handleCroppedFile(croppedFile);
        }
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

async function startSDK(quickAction, dropzone, data = ['']) {
  if (!ccEverywhere) {
    ccEverywhere = await loadAndInitializeCCEverywhere(getConfig);
  }
  runQuickAction(quickAction, dropzone, data);
}

async function startSDKWithUnconvertedFiles(files, quickAction, dropzone) {
  let data = await processFilesForQuickAction(files, quickAction);
  if (!data[0]) {
    const msg = await getErrorMsg(files, quickAction, getConfig);
    dropzone.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: msg } }));
    return;
  }

  if (data.some((item) => !item)) {
    const msg = await getErrorMsg(files, quickAction, getConfig);
    dropzone.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: msg } }));
    data = data.filter((item) => item);
  }

  startSDK(quickAction, dropzone, data);
}

export function initCropper(dropzone, triggerElement) {
  triggerElement.addEventListener('click', () => {
    console.log('dropzone', dropzone);
    console.log('file', dropzone.file);
    const { file } = dropzone;
    startSDKWithUnconvertedFiles([file], 'crop-image', dropzone);
  });
}
