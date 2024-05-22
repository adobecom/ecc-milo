import { getLibs } from '../scripts/utils.js';
import { handleImageFiles } from './esp-controller.js';

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
  element.lastChild.setAttribute('repeatIdx', 0);

  const tag = createTag('div');
  tag.classList.add('repeater-element');

  const heading = createTag('h3', { class: 'repeater-element-title' }, title);
  tag.append(heading);

  const plusIcon = getIcon('add-circle');
  tag.append(plusIcon);

  element.append(tag);
}

export async function decorateTextfield(row, extraOptions) {
  row.classList.add('text-field-row');
  const cols = row.querySelectorAll(':scope > div');
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

  const input = createTag('sp-textfield', {
    class: 'text-input',
    placeholder: text,
    required: isRequired,
    quiet: true,
    size: 'xl',
    ...extraOptions,
  });

  if (maxCharNum) input.setAttribute('maxlength', maxCharNum);

  const wrapper = createTag('div', { class: 'info-field-wrapper' });
  row.innerHTML = '';
  wrapper.append(input, attrTextEl);
  row.append(wrapper);
}

export async function decorateTextarea(row, extraOptions) {
  row.classList.add('text-field-row');
  const cols = row.querySelectorAll(':scope > div');
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

  const input = createTag('sp-textfield', {
    multiline: true,
    class: 'textarea-input',
    quiet: true,
    placeholder: text,
    required: isRequired,
    ...extraOptions,
  });

  if (maxCharNum) input.setAttribute('maxlength', maxCharNum);

  const wrapper = createTag('div', { class: 'info-field-wrapper' });
  row.innerHTML = '';
  wrapper.append(input, attrTextEl);
  row.append(wrapper);
}

export function makeFileInputDropZone(inputWrapper) {
  const dropZone = inputWrapper.querySelector('.img-file-input-label');
  const fileInput = inputWrapper.querySelector('input[type="file"].img-file-input');

  if (dropZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((event) => {
      dropZone.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    dropZone.addEventListener('dragover', (e) => {
      e.currentTarget.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.currentTarget.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      const { files } = e.dataTransfer;
      handleImageFiles(inputWrapper, files);
      e.currentTarget.classList.remove('dragover');
    });
  }

  fileInput?.addEventListener('change', (e) => {
    const { files } = e.currentTarget;
    handleImageFiles(inputWrapper, files);
  });
}
