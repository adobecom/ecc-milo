let secretCache = [];

export const [setLibs, getLibs] = (() => {
  let libs;
  return [
    (prodLibs, location) => {
      libs = (() => {
        const { hostname, search } = location || window.location;
        if (!(hostname.includes('.hlx.') || hostname.includes('local'))) return prodLibs;
        const branch = new URLSearchParams(search).get('milolibs') || 'ecc';
        if (branch === 'local') return 'http://localhost:6456/libs';
        return branch.includes('--') ? `https://${branch}.hlx.live/libs` : `https://${branch}--milo--adobecom.hlx.live/libs`;
      })();
      return libs;
    }, () => libs,
  ];
})();

export async function importMiloUtils() {
  return import(`${getLibs()}/utils/utils.js`);
}

function createTag(tag, attributes, html, options = {}) {
  const el = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement
      || html instanceof SVGElement
      || html instanceof DocumentFragment) {
      el.append(html);
    } else if (Array.isArray(html)) {
      el.append(...html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  options.parent?.append(el);
  return el;
}

function convertEccIcon(n) {
  const createSVGIcon = (iconName) => {
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('width', '20');
    svgElement.setAttribute('height', '20');
    svgElement.setAttribute('class', 'ecc-icon');

    const useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    useElement.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `/ecc/icons/ecc-icons.svg#${iconName}`);

    svgElement.appendChild(useElement);

    return svgElement;
  };

  const text = n.innerHTML;
  const eccIcons = [
    'ecc-content',
    'ecc-star-wire',
    'ecc-webpage',
  ];

  const iconRegex = /@@(.*?)@@/g;
  return text.replace(iconRegex, (match, iconName) => {
    if (eccIcons.includes(iconName)) {
      return createSVGIcon(iconName).outerHTML;
    }

    return '';
  });
}

export function decorateArea(area = document) {
  const eagerLoad = (parent, selector) => {
    const img = parent.querySelector(selector);
    img?.removeAttribute('loading');
  };

  (async function loadLCPImage() {
    const marquee = area.querySelector('.marquee');
    if (!marquee) {
      eagerLoad(area, 'img');
      return;
    }

    // First image of first row
    eagerLoad(marquee, 'div:first-child img');
    // Last image of last column of last row
    eagerLoad(marquee, 'div:last-child > div:last-child img');
  }());

  const allElements = area.querySelectorAll('*');
  allElements.forEach((element) => {
    if (element.childNodes.length) {
      element.childNodes.forEach((n) => {
        if (n.tagName === 'P' || n.tagName === 'A' || n.tagName === 'LI') {
          n.innerHTML = convertEccIcon(n);
        }
      });
    }
  });
}

export function getIcon(tag) {
  const img = document.createElement('img');
  img.className = `icon icon-${tag}`;
  img.src = `${window.miloConfig.codeRoot}/icons/${tag}.svg`;
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
    return window.location.origin.replace(window.location.hostname, `${window.eccEnv}--events-milo--adobecom.hlx.page`);
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
    const [utils, placeholders] = await Promise.all([
      import(`${getLibs()}/utils/utils.js`),
      import(`${getLibs()}/features/placeholders.js`),
    ]);

    const { getConfig } = utils;
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
