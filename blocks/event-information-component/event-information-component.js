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
  row.classList.add('text=field-row');
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

function buildDatePicker(column) {
  const dateLabel = createTag('label', { for: 'event-info-date-picker' }, column.textContent.trim());
  const datePicker = createTag('input', { id: 'event-info-date-picker', name: 'event-date', type: 'date', class: 'date-input' });
  let today = new Date();
  const offset = today.getTimezoneOffset();
  today = new Date(today.getTime() - (offset * 60 * 1000));
  datePicker.setAttribute('min', today.toISOString().split('T')[0]);

  column.innerHTML = '';
  column.append(dateLabel, datePicker);
}

function buildTimePicker(column) {
  
}

function decorateDateTimeFields(row) {
  row.classList.add('date-time-row');
  const cols = row.querySelectorAll(':scope > div');

  cols.forEach((c, i) => {
    if (i === 0) buildDatePicker(c);
    if (i === 1) buildTimePicker(c);
  });
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
