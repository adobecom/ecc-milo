import { getLibs } from '../../scripts/utils.js';
import { handlize } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function decorateHeading(el) {
  const h2 = el.querySelector(':scope > div:first-of-type h2');

  if (h2) {
    const em = el.querySelector('p > em');

    if (em) {
      const tooltipText = em.textContent.trim();
      const toolTipIcon = createTag('span', { class: 'event-heading-tooltip-icon' }, 'i');
      const toolTipBox = createTag('div', { class: 'event-heading-tooltip-box' }, tooltipText);
      const toolTipWrapper = createTag('div', { class: 'event-heading-tooltip-wrapper' });

      toolTipWrapper.append(toolTipIcon, toolTipBox);
      h2.parentElement?.append(toolTipWrapper);
      em.parentElement?.remove();
    }
  }
}

function decorateTextFields(row) {
  const lis = row.querySelectorAll('ul > li');

  if (!lis.length) return;

  lis.forEach((li, i) => {
    const text = li.textContent.trim();
    const isRequired = text.endsWith('*');
    const handle = handlize(text);
    let input;
    if (i === 0) {
      input = createTag('input', { id: `info-field-${handle}`, type: 'text', class: 'text-input', placeholder: text, required: isRequired });
    } else {
      input = createTag('textarea', { id: `info-field-${handle}`, class: 'textarea-input', placeholder: text, required: isRequired });
    }

    const wrapper = createTag('div', { class: 'info-field-wrapper' });

    wrapper.append(input);
    row.append(wrapper);
  });

  const oldDiv = row.querySelector(':scope > div:first-of-type');

  if (oldDiv.querySelector('ul')) oldDiv.remove();
}

function decorateDateTimeFields() {
  console.log('to be built');
}

export default function init(el) {
  el.classList.add('form-component');
  decorateHeading(el);

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    if (i === 1) decorateTextFields(r);
    if (i === 2) decorateDateTimeFields(r);
  });
}
