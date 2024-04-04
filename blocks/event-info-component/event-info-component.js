import { getLibs } from '../../scripts/utils.js';
import { handlize, standardizeFormComponentHeading } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

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
  column.classList.add('date-picker');
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
  column.classList.add('time-pickers');
  const rows = column.querySelectorAll('table tr');
  const timePickerWrappers = [];

  rows.forEach((r) => {
    const timePickerWrapper = createTag('div', { class: 'time-picker-wrapper' });
    const cols = r.querySelectorAll('td');
    let pickerName;
    cols.forEach((c, j) => {
      if (j === 0) {
        pickerName = c.textContent.trim();
        const label = createTag('label', { for: `time-picker-${handlize(pickerName)}` }, pickerName);
        timePickerWrapper.append(label);
      }

      if (j === 1) {
        const timeSlots = c.querySelectorAll('li');
        const select = createTag('select', { id: `time-picker-${handlize(pickerName)}`, class: 'select-input' });
        timeSlots.forEach((t) => {
          const text = t.textContent.trim();
          const option = createTag('option', { value: handlize(text) }, text);
          select.append(option);
        });
        timePickerWrapper.append(select);
      }
    });

    timePickerWrappers.push(timePickerWrapper);
  });

  column.innerHTML = '';
  timePickerWrappers.forEach((w) => { column.append(w); });
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
  standardizeFormComponentHeading(el);

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    if (i === 1) decorateTextFields(r);
    if (i === 2) decorateDateTimeFields(r);
  });
}
