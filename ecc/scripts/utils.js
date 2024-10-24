import { LIBS } from './scripts.js';

const { createTag, getConfig } = await import(`${LIBS}/utils/utils.js`);

let secretCache = [];

export function getEventServiceEnv() {
  const validEnvs = ['dev', 'stage', 'prod'];
  const { host, search } = window.location;
  const SLD = host.includes('.aem.') ? 'aem' : 'hlx';
  const usp = new URLSearchParams(search);
  const eccEnv = usp.get('eccEnv');

  if (validEnvs.includes(eccEnv)) return eccEnv;

  if ((host.includes(`${SLD}.page`) || host.includes(`${SLD}.live`))) {
    if (host.startsWith('dev--')) return 'dev';
    if (host.startsWith('dev02--') || host.startsWith('main02--')) return 'dev02';
    if (host.startsWith('stage--')) return 'stage';
    if (host.startsWith('stage02--')) return 'stage02';
    if (host.startsWith('main--')) return 'prod';
  }

  if (host.includes('localhost')) return 'dev';

  if (host.includes('stage.adobe')
    || host.includes('corp.adobe')
    || host.includes('graybox.adobe')) return 'stage';

  if (host.endsWith('adobe.com')) return 'prod';
  // fallback to dev
  return 'dev';
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

export function getEventPageHost() {
  if (window.location.href.includes('.hlx.')) {
    return window.location.origin.replace(window.location.hostname, `${getEventServiceEnv()}--events-milo--adobecom.hlx.page`);
  }

  return window.location.origin;
}

export function addTooltipToHeading(em, heading) {
  const tooltipText = em.textContent.trim();
  const toolTipTrigger = createTag('sp-action-button', { size: 's' }, getIcon('info'));
  createTag('sp-tooltip', { 'self-managed': true, variant: 'info' }, tooltipText, { parent: toolTipTrigger });

  heading.append(toolTipTrigger);
  em.parentElement?.remove();
}

export function generateToolTip(el) {
  const heading = el.querySelector('h2, h3');
  const em = el.querySelector('p > em');

  if (heading && em) {
    addTooltipToHeading(em, heading);
  }
}

export function buildNoAccessScreen(el) {
  el.removeAttribute('style');
  el.classList.add('no-access');
  el.innerHTML = '';

  const h1 = createTag('h1', {}, 'You do not have sufficient access to view.');
  const area = createTag('div', { class: 'no-access-area' });
  const noAccessDescription = createTag('p', {}, 'An Adobe corporate account is required to access this feature.');

  el.append(h1, area);
  area.append(getIcon('browser-access-forbidden-lg'), noAccessDescription);
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
      required: isRequired,
      quiet: true,
      size: 'xl',
    },
    extraOptions,
  ));

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
      // quiet: true,
      placeholder: text,
      required: isRequired,
      ...extraOptions,
    },
    extraOptions,
  ));

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
  const url = new URL(link);

  return url.hostname.replace('.com', '').replace('www.', '');
}

export async function miloReplaceKey(key) {
  try {
    const placeholders = await import(`${LIBS}/features/placeholders.js`);

    const { replaceKey } = placeholders;
    const config = getConfig();

    return await replaceKey(key, config);
  } catch (error) {
    window.lana?.log('Error trying to replace placeholder:', error);
    return 'RSVP';
  }
}

export function toClassName(name) {
  return name && typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-')
    : '';
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
