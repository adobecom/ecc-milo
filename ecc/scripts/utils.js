import { LIBS } from './scripts.js';
import { getEventServiceHost } from './environment.js';

const { createTag, getConfig } = await import(`${LIBS}/utils/utils.js`);

let secretCache = [];

export async function getSystemConfig(configType = '') {
  const configUrlBase = '/ecc/system/config.json';
  const configUrl = `${configUrlBase}?sheet=${configType}`;
  const config = await fetch(configUrl);
  const configData = await config.json().then((json) => json.data);

  return configData;
}

export function getIcon(tag) {
  const img = document.createElement('img');
  img.className = `icon icon-${tag}`;
  img.src = `${getConfig().codeRoot}/icons/${tag}.svg`;
  img.alt = tag;

  return img;
}

export function yieldToMain() {
  return new Promise((r) => {
    setTimeout(r, 0);
  });
}

export function handlize(str) {
  return str?.toLowerCase().trim().replaceAll(' ', '-');
}

export function camelToSentenceCase(camelCaseStr) {
  let sentenceCaseStr = camelCaseStr.replace(/([A-Z])/g, ' $1').toLowerCase();
  sentenceCaseStr = sentenceCaseStr.charAt(0).toUpperCase() + sentenceCaseStr.slice(1);
  return sentenceCaseStr;
}

export function isEmptyObject(o) {
  return Object.keys(o).length === 0 && o.constructor === Object;
}

export function convertTo24HourFormat(timeStr) {
  const timeFormat = /^(0?[1-9]|1[0-2]):([0-5][0-9]) (AM|PM)$/;

  if (!timeStr.match(timeFormat)) {
    throw new Error("Invalid time format. Expected format: 'h:mm AM/PM'");
  }

  const [time, period] = timeStr.split(' ');
  const [, minutes] = time.split(':').map(Number);
  let [hours] = time.split(':').map(Number);

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:00`;
}

export function parse24HourFormat(timeStr) {
  if (!timeStr) return null;

  const timeFormat = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

  if (!timeStr.match(timeFormat)) {
    throw new Error("Invalid time format. Expected format: 'HH:mm:ss'");
  }

  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours < 12 ? 'AM' : 'PM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return {
    hours: formattedHours,
    minutes: formattedMinutes,
    period,
  };
}

export function getEventPageHost(relativeDomain) {
  return getEventServiceHost(relativeDomain);
}

export function addTooltipToEl(tooltipText, appendee) {
  if (!tooltipText || !appendee) return;

  const toolTipTrigger = createTag('sp-action-button', { size: 's' }, getIcon('info'));
  createTag('sp-tooltip', { 'self-managed': true, variant: 'info' }, tooltipText, { parent: toolTipTrigger });

  appendee.append(toolTipTrigger);
}

export function generateToolTip(el) {
  const heading = el.querySelector('h2, h3, h4');
  const em = el.querySelector('p > em');

  const tooltipText = em?.textContent.trim();

  if (heading && tooltipText) {
    addTooltipToEl(tooltipText, heading);
    em.parentElement?.remove();
  }
}

export function buildNoAccessScreen(el) {
  el.removeAttribute('style');
  el.classList.add('no-access');
  el.innerHTML = '';

  const h1 = createTag('h1', {}, 'You do not have sufficient access to view.');
  const area = createTag('div', { class: 'no-access-area' });
  const noAccessDescription = createTag('p', {}, 'If you have another authorized account, please sign in with that account to access this page.');
  const requestAccessButton = createTag('a', { class: 'con-button primary', href: 'https://adobe.enterprise.slack.com/archives/C07KPJYA760' }, 'Request Access');

  el.append(h1, area);
  area.append(getIcon('browser-access-forbidden-lg'), noAccessDescription, requestAccessButton);
}

export function querySelectorAllDeep(selector, root = document) {
  const elements = [];

  function recursiveQuery(r) {
    elements.push(...r.querySelectorAll(selector));

    r.querySelectorAll('*').forEach((el) => {
      if (el.shadowRoot) {
        recursiveQuery(el.shadowRoot);
      }
    });
  }

  recursiveQuery(root);

  return elements;
}

function mergeOptions(defaultOptions, overrideOptions) {
  const combinedOptions = { ...defaultOptions, ...overrideOptions };

  Object.keys(overrideOptions).forEach((key) => {
    if (overrideOptions[key] === false) {
      delete combinedOptions[key];
    }
  });

  return combinedOptions;
}

export async function decorateLabeledTextfield(cell, inputOpts = {}, labelOpts = {}) {
  cell.classList.add('labeled-text-field-row');
  const cols = cell.querySelectorAll(':scope > div');
  if (!cols.length) return;
  const [labelCol, placeholderCol] = cols;

  const text = labelCol?.textContent.trim();

  const phText = placeholderCol?.textContent.trim();
  const maxCharNum = placeholderCol?.querySelector('strong')?.textContent.trim();
  const isRequired = text.endsWith('*');

  const label = createTag('sp-field-label', mergeOptions({
    for: 'text-input',
    'side-aligned': 'start',
    class: 'text-field-label',
  }, labelOpts), text);

  const input = createTag('sp-textfield', mergeOptions(
    {
      class: 'text-input',
      placeholder: phText,
      size: 'xl',
    },
    inputOpts,
  ));

  if (isRequired) {
    input.required = true;
    label.required = true;
  }

  if (maxCharNum) input.setAttribute('maxlength', maxCharNum);

  const wrapper = createTag('div', { class: 'labeled-text-field-wrapper' });
  cell.innerHTML = '';
  wrapper.append(label, input);
  cell.append(wrapper);
}

export async function decorateTextfield(cell, extraOptions, negativeHelperText = '') {
  cell.classList.add('text-field-row');
  const cols = cell.querySelectorAll(':scope > div');
  if (!cols.length) return;
  let placeholderCol;
  let maxLengthCol;
  if (cols.length === 1) {
    [placeholderCol] = cols;
  } else if (cols.length === 2) {
    [placeholderCol, maxLengthCol] = cols;
  }
  const text = placeholderCol.textContent.trim();

  const attrTextEl = createTag('div', { class: 'attr-text' }, maxLengthCol.textContent.trim());
  const maxCharNum = maxLengthCol?.querySelector('strong')?.textContent.trim();
  const isRequired = attrTextEl.textContent.trim().endsWith('*');

  const input = createTag('sp-textfield', mergeOptions(
    {
      class: 'text-input',
      placeholder: text,
      quiet: true,
      size: 'xl',
    },
    extraOptions,
  ));

  if (isRequired) input.required = true;

  if (negativeHelperText) {
    createTag('sp-help-text', { variant: 'negative', slot: 'negative-help-text' }, negativeHelperText, { parent: input });
  }

  if (maxCharNum) input.setAttribute('maxlength', maxCharNum);

  const wrapper = createTag('div', { class: 'info-field-wrapper' });
  cell.innerHTML = '';
  wrapper.append(input, attrTextEl);
  cell.append(wrapper);
}

export function changeInputValue(input, attr, value) {
  if (!input) return;
  input[attr] = value || '';
  input.dispatchEvent(new Event('change'));
}

export async function decorateTextarea(cell, extraOptions) {
  cell.classList.add('text-field-row');
  const cols = cell.querySelectorAll(':scope > div');
  if (!cols.length) return;
  let placeholderCol;
  let maxLengthCol;
  if (cols.length === 1) {
    [placeholderCol] = cols;
  } else if (cols.length === 2) {
    [placeholderCol, maxLengthCol] = cols;
  }
  const text = placeholderCol.textContent.trim();

  const attrTextEl = createTag('div', { class: 'attr-text' }, maxLengthCol.textContent.trim());
  const maxCharNum = maxLengthCol?.querySelector('strong')?.textContent.trim();
  const isRequired = attrTextEl.textContent.trim().endsWith('*');

  const input = createTag('sp-textfield', mergeOptions(
    {
      multiline: true,
      class: 'textarea-input',
      placeholder: text,
      ...extraOptions,
    },
    extraOptions,
  ));

  if (isRequired) input.required = true;

  if (maxCharNum) input.setAttribute('maxlength', maxCharNum);

  const wrapper = createTag('div', { class: 'info-field-wrapper' });
  cell.innerHTML = '';
  wrapper.append(input, attrTextEl);
  cell.append(wrapper);
}

export function signIn() {
  if (typeof window.adobeIMS?.signIn !== 'function') {
    window?.lana.log({ message: 'IMS signIn method not available', tags: 'errorType=warn,module=gnav' });
    return;
  }

  window.adobeIMS?.signIn();
}

export async function getSecret(key) {
  if (secretCache.length === 0) {
    const resp = await fetch('/ecc/system/secrets.json')
      .then((r) => r)
      .catch((e) => window.lana?.log(`Failed to fetch Google Places API key: ${e}`));

    if (!resp.ok) return null;

    const json = await resp.json();
    secretCache = json.data;
  }

  const secret = secretCache.find((s) => s.key === key);
  return secret.value;
}

export function getServiceName(link) {
  try {
    const url = new URL(link);
    const { hostname } = url;
    return hostname.replace('.com', '').replace('www.', '');
  } catch (error) {
    window.lana?.log(`Error trying to get service name:\n${JSON.stringify(error, null, 2)}`);
    return '';
  }
}

export async function miloReplaceKey(key) {
  try {
    const placeholders = await import(`${LIBS}/features/placeholders.js`);

    const { replaceKey } = placeholders;
    const config = getConfig();

    return await replaceKey(key, config);
  } catch (error) {
    window.lana?.log(`Error trying to replace placeholder:\n${JSON.stringify(error, null, 2)}`);
    return 'RSVP';
  }
}

export function toClassName(name) {
  return name && typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-')
    : '';
}

export function decorateSwitchFieldset(attr, textContent) {
  const fieldset = createTag('fieldset', { class: 'switch-wrapper' });
  const checkbox = createTag('input', { ...attr, type: 'checkbox' });
  const spLabel = createTag('sp-label', {}, textContent);
  const switchLabel = createTag('label', { class: 'custom-switch' });

  checkbox.classList.add('hidden');
  switchLabel.append(checkbox);
  fieldset.append(switchLabel, spLabel);

  return fieldset;
}

export function readBlockConfig(block) {
  return [...block.querySelectorAll(':scope>div')].reduce((config, row) => {
    if (row.children) {
      const cols = [...row.children];
      if (cols[1]) {
        const valueEl = cols[1];
        const name = toClassName(cols[0].textContent);
        if (valueEl.querySelector('a')) {
          const aArr = [...valueEl.querySelectorAll('a')];
          if (aArr.length === 1) {
            config[name] = aArr[0].href;
          } else {
            config[name] = aArr.map((a) => a.href);
          }
        } else if (valueEl.querySelector('p')) {
          const pArr = [...valueEl.querySelectorAll('p')];
          if (pArr.length === 1) {
            config[name] = pArr[0].innerHTML;
          } else {
            config[name] = pArr.map((p) => p.innerHTML);
          }
        } else config[name] = row.children[1].innerHTML;
      }
    }

    return config;
  }, {});
}

export const fetchThrottledMemoizedText = (() => {
  const cache = new Map();
  const pending = new Map();

  const memoize = async (url, options, fetcher, ttl) => {
    const key = `${url}-${JSON.stringify(options)}`;

    if (cache.has(key)) {
      return cache.get(key);
    }

    if (pending.has(key)) {
      return pending.get(key);
    }

    const fetchPromise = fetcher(url, options);
    pending.set(key, fetchPromise);

    try {
      const response = await fetchPromise;
      const text = response.ok ? await response.text() : null;
      cache.set(key, text);
      setTimeout(() => cache.delete(key), ttl);
      return text;
    } finally {
      pending.delete(key);
    }
  };

  return (url, options = {}, { ttl = 3000 } = {}) => memoize(url, options, fetch, ttl);
})();

export function replaceAnchorWithButton(anchor) {
  if (!anchor || anchor.tagName !== 'A') {
    return null;
  }

  const attributes = {};
  for (let i = 0; i < anchor.attributes.length; i += 1) {
    const attr = anchor.attributes[i];
    attributes[attr.name] = attr.value;
  }

  const button = createTag('button', attributes, anchor.innerHTML);

  anchor.parentNode.replaceChild(button, anchor);
  return button;
}

// =============================================================================
// CC EVERYWHERE UTILS - START
// =============================================================================

// Shared constants and configurations for frictionless quick actions
const JPG = 'jpg';
const JPEG = 'jpeg';
const PNG = 'png';
const WEBP = 'webp';

const VIDEO_FORMATS = [
  'mov',
  'mp4',
  'crm',
  'avi',
  'm2ts',
  '3gp',
  'f4v',
  'mpeg',
  'm2t',
  'm2p',
  'm1v',
  'mpg',
  'wmv',
  'tts',
  '264',
];

const VIDEO_MIME_TYPES = {
  mov: 'video/quicktime',
  mp4: 'video/mp4',
  crm: 'video/x-ms-crm',
  avi: 'video/x-msvideo',
  m2ts: 'video/mp2t',
  '3gp': 'video/3gpp',
  f4v: 'video/x-f4v',
  mpeg: 'video/mpeg',
  m2t: 'video/mp2t',
  m2p: 'video/mp2p',
  m1v: 'video/mpeg',
  mpg: 'video/mpeg',
  wmv: 'video/x-ms-wmv',
  tts: 'video/tts',
  264: 'video/h264',
};

// Configuration functions
const getBaseImgCfg = (...types) => ({
  group: 'image',
  max_size: 40 * 1024 * 1024,
  accept: types.map((type) => `.${type}`).join(', '),
  input_check: (input) => types.map((type) => `image/${type}`).includes(input),
});

const getBaseVideoCfg = (...types) => {
  const formats = Array.isArray(types[0]) ? types[0] : types;
  return {
    group: 'video',
    max_size: 1024 * 1024 * 1024,
    accept: formats.map((type) => `.${type}`).join(', '),
    input_check: (input) => {
      const supportedMimeTypes = formats
        .map((type) => VIDEO_MIME_TYPES[type])
        .filter(Boolean);
      return supportedMimeTypes.includes(input);
    },
  };
};

const getMergeVideosCfg = () => ({
  group: 'video',
  max_size: 1024 * 1024 * 1024, // Use video max size (1GB)
  accept: [...VIDEO_FORMATS, JPG, JPEG, PNG]
    .map((type) => `.${type}`)
    .join(', '),
  input_check: (input) => {
    const videoMimeTypes = VIDEO_FORMATS.map(
      (type) => VIDEO_MIME_TYPES[type],
    ).filter(Boolean);
    const imageTypes = [JPG, JPEG, PNG].map((type) => `image/${type}`);
    return [...videoMimeTypes, ...imageTypes].includes(input);
  },
});

// Shared QA configurations
export const QA_CONFIGS = {
  'convert-to-jpg': { ...getBaseImgCfg(PNG, WEBP) },
  'convert-to-png': { ...getBaseImgCfg(JPG, JPEG, WEBP) },
  'convert-to-svg': { ...getBaseImgCfg(JPG, JPEG, PNG) },
  'crop-image': { ...getBaseImgCfg(JPG, JPEG, PNG) },
  'resize-image': { ...getBaseImgCfg(JPG, JPEG, PNG, WEBP) },
  'remove-background': { ...getBaseImgCfg(JPG, JPEG, PNG) },
  'generate-qr-code': {
    ...getBaseImgCfg(JPG, JPEG, PNG),
    input_check: () => true,
  },
  'qa-in-product-variant1': { ...getBaseImgCfg(JPG, JPEG, PNG) },
  'qa-in-product-variant2': { ...getBaseImgCfg(JPG, JPEG, PNG) },
  'qa-in-product-control': { ...getBaseImgCfg(JPG, JPEG, PNG) },
  'qa-nba': { ...getBaseImgCfg(JPG, JPEG, PNG) },
  'convert-to-gif': { ...getBaseVideoCfg(VIDEO_FORMATS) },
  'crop-video': { ...getBaseVideoCfg(VIDEO_FORMATS) },
  'trim-video': { ...getBaseVideoCfg(VIDEO_FORMATS) },
  'resize-video': { ...getBaseVideoCfg(VIDEO_FORMATS) },
  'merge-videos': getMergeVideosCfg(),
  'convert-to-mp4': { ...getBaseVideoCfg(VIDEO_FORMATS) },
  'caption-video': { ...getBaseVideoCfg(VIDEO_FORMATS) },
};

// Experimental variants
export const EXPERIMENTAL_VARIANTS = [
  'qa-in-product-variant1',
  'qa-in-product-variant2',
  'qa-nba',
  'qa-in-product-control',
];

// Shared utility functions
export function selectElementByTagPrefix(p) {
  const allEls = document.body.querySelectorAll(':scope > *');
  return Array.from(allEls).find((e) => e.tagName.toLowerCase().startsWith(p.toLowerCase()));
}

export function fadeIn(element) {
  element.classList.remove('hidden');
  setTimeout(() => {
    element.classList.remove('transparent');
  }, 10);
}

export function fadeOut(element) {
  element.classList.add('transparent');
  setTimeout(() => {
    element.classList.add('hidden');
  }, 200);
}

// Common document configurations
export function createDocConfig(data, type = 'image') {
  const dataType = type === 'video' ? 'blob' : 'base64';
  return {
    asset: {
      data,
      dataType,
      type,
      name: data.name,
    },
  };
}

export function createMergeVideosDocConfig(data) {
  const assets = [];
  data.forEach((file) => {
    assets.push({
      data: file,
      dataType: 'blob',
      type: 'video',
      name: file.name,
    });
  });
  return { assets };
}

export function createDefaultExportConfig() {
  return [
    {
      action: {
        target: 'publish',
        outputype: 'Blob',
        closeTargetOnExport: true,
      },
      id: 'saveToHostApp',
      label: 'Save cropped image',
      style: { uiType: 'button' },
    },
  ];
}

export async function createMobileExportConfig(
  quickAction,
  downloadText,
  editText,
) {
  const exportConfig = createDefaultExportConfig();
  return [
    {
      ...exportConfig[0],
      ...(QA_CONFIGS[quickAction].group === 'video'
        ? {}
        : { label: downloadText }),
    },
    {
      ...exportConfig[1],
      ...(QA_CONFIGS[quickAction].group === 'video' ? {} : { label: editText }),
    },
  ];
}

// Helper function to execute quick actions with common parameters
export function executeQuickAction(
  ccEverywhere,
  quickActionId,
  docConfig,
  appConfig,
  exportConfig,
  contConfig,
  videoDocConfig,
) {
  const quickActionMap = {
    'convert-to-jpg': () => ccEverywhere.quickAction.convertToJPEG(
      docConfig,
      appConfig,
      exportConfig,
      contConfig,
    ),
    'convert-to-png': () => ccEverywhere.quickAction.convertToPNG(
      docConfig,
      appConfig,
      exportConfig,
      contConfig,
    ),
    'convert-to-svg': () => {
      exportConfig.pop();
      ccEverywhere.quickAction.convertToSVG(
        docConfig,
        appConfig,
        exportConfig,
        contConfig,
      );
    },
    'crop-image': () => ccEverywhere.quickAction.cropImage(
      docConfig,
      appConfig,
      exportConfig,
      contConfig,
    ),
    'resize-image': () => ccEverywhere.quickAction.resizeImage(
      docConfig,
      appConfig,
      exportConfig,
      contConfig,
    ),
    'remove-background': () => ccEverywhere.quickAction.removeBackground(
      docConfig,
      appConfig,
      exportConfig,
      contConfig,
    ),
    'generate-qr-code': () => ccEverywhere.quickAction.generateQRCode(
      {},
      appConfig,
      exportConfig,
      contConfig,
    ),
    'convert-to-gif': () => ccEverywhere.quickAction.convertToGIF(
      videoDocConfig,
      appConfig,
      exportConfig,
      contConfig,
    ),
    'crop-video': () => ccEverywhere.quickAction.cropVideo(
      videoDocConfig,
      appConfig,
      exportConfig,
      contConfig,
    ),
    'trim-video': () => ccEverywhere.quickAction.trimVideo(
      videoDocConfig,
      appConfig,
      exportConfig,
      contConfig,
    ),
    'resize-video': () => ccEverywhere.quickAction.resizeVideo(
      videoDocConfig,
      appConfig,
      exportConfig,
      contConfig,
    ),
    'merge-videos': () => ccEverywhere.quickAction.mergeVideos(
      videoDocConfig,
      appConfig,
      exportConfig,
      contConfig,
    ),
    'convert-to-mp4': () => ccEverywhere.quickAction.convertToMP4(
      videoDocConfig,
      appConfig,
      exportConfig,
      contConfig,
    ),
    'caption-video': () => ccEverywhere.quickAction.captionVideo(
      videoDocConfig,
      appConfig,
      exportConfig,
      contConfig,
    ),
  };

  const action = quickActionMap[quickActionId];
  if (action) {
    action();
  }
}

export async function getErrorMsg(files, quickAction, replaceKey) {
  let msg;
  const isNotValid = Array.from(files).some(
    (file) => !QA_CONFIGS[quickAction].input_check(file.type),
  );
  if (isNotValid) {
    msg = await replaceKey('file-type-not-supported', getConfig());
  } else {
    msg = await replaceKey('file-size-not-supported', getConfig());
  }
  return msg;
}

export async function processFileForQuickAction(
  file,
  quickAction,
) {
  const maxSize = QA_CONFIGS[quickAction].max_size ?? 40 * 1024 * 1024;

  if (QA_CONFIGS[quickAction].input_check(file.type) && file.size <= maxSize) {
    const isVideo = QA_CONFIGS[quickAction].group === 'video';
    if (isVideo) {
      window.history.pushState({ hideFrictionlessQa: true }, '', '');
      return file;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        window.history.pushState({ hideFrictionlessQa: true }, '', '');
        resolve(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }
  return undefined;
}

export async function processFilesForQuickAction(files, quickAction) {
  const data = await Promise.all(
    Array.from(files).map((file) => processFileForQuickAction(file, quickAction)),
  );
  return data;
}

export function createSDKConfig(urlParams) {
  let { ietf } = getConfig().locale;
  const country = urlParams.get('country');
  if (country) ietf = getConfig().locales[country]?.ietf;
  if (ietf === 'zh-Hant-TW') ietf = 'tw-TW';
  else if (ietf === 'zh-Hans-CN') ietf = 'cn-CN';
  // query parameter URL for overriding the cc everywhere
  // iframe source URL, used for testing new experiences
  const isStageEnv = urlParams.get('hzenv') === 'stage';

  return {
    hostInfo: {
      clientId: 'cbd70649f587495f9eb99c419d1b2a4e',
      appName: 'eventsMiloCropper',
    },
    configParams: {
      locale: ietf?.replace('-', '_'),
      env: isStageEnv ? 'stage' : 'prod',
    },
    authOption: () => ({ mode: 'delayed' }),
  };
}

export async function loadAndInitializeCCEverywhere() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlOverride = urlParams.get('sdk-override');
  let valid = false;
  if (urlOverride) {
    try {
      if (new URL(urlOverride).host === 'dev.cc-embed.adobe.com') valid = true;
    } catch (e) {
      window.lana.log('Invalid SDK URL');
    }
  }
  const CDN_URL = valid
    ? urlOverride
    : 'https://cc-embed.adobe.com/sdk/1p/v4/CCEverywhere.js';

  const { loadScript } = await import(`${LIBS}/utils/utils.js`);
  await loadScript(CDN_URL);

  if (!window.CCEverywhere) {
    return undefined;
  }

  const ccEverywhereConfig = createSDKConfig(urlParams);
  return window.CCEverywhere.initialize(...Object.values(ccEverywhereConfig));
}

// =============================================================================
// CC EVERYWHERE CROPPER - START
// =============================================================================

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

export async function initCropper(dropzone, triggerElement) {
  triggerElement.addEventListener('click', () => {
    console.log('dropzone', dropzone);
    console.log('file', dropzone.file);
    const { file } = dropzone;
    startSDKWithUnconvertedFiles([file], 'crop-image', dropzone);
  });
}

// =============================================================================
// CC EVERYWHERE UTILS - END
// =============================================================================
