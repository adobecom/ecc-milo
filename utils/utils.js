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

export function yieldToMain() {
  return new Promise((r) => {
    setTimeout(r, 0);
  });
}

export function handlize(str) {
  return str?.toLowerCase().trim().replaceAll(' ', '-');
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

export function addTooltipToHeading(em, heading) {
  const tooltipText = em.textContent.trim();
  const toolTipIcon = createTag('span', { class: 'event-heading-tooltip-icon' }, 'i');
  const toolTipBox = createTag('div', { class: 'event-heading-tooltip-box' }, tooltipText);
  const toolTipWrapper = createTag('div', { class: 'event-heading-tooltip-wrapper' });

  toolTipWrapper.append(toolTipIcon, toolTipBox);
  heading.append(toolTipWrapper);
  em.parentElement?.remove();
}

export function generateToolTip(el) {
  const heading = el.querySelector('h2, h3');
  const em = el.querySelector('p > em');

  if (heading && em) {
    addTooltipToHeading(em, heading);
  }
}

export function getIcon(tag) {
  const img = document.createElement('img');
  img.className = `icon icon-${tag}`;
  img.src = `/icons/${tag}.svg`;
  img.alt = tag;

  return img;
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

export function addRepeater(element, title) {
  if (!element) return;
  element.setAttribute('repeatIdx', 0);

  const tag = createTag('div');
  tag.classList.add('repeater-element');

  const heading = createTag('h3', { class: 'repeater-element-title' }, title);
  tag.append(heading);

  const plusIcon = getIcon('add-circle');
  tag.append(plusIcon);

  element.after(tag);
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

export async function decorateTextfield(cell, extraOptions) {
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

  if (maxCharNum) input.setAttribute('maxlength', maxCharNum);

  const wrapper = createTag('div', { class: 'info-field-wrapper' });
  cell.innerHTML = '';
  wrapper.append(input, attrTextEl);
  cell.append(wrapper);
}

export function changeInputValue(input, attr, value) {
  input[attr] = value;
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
