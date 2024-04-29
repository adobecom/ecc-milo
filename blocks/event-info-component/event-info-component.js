import { getLibs } from '../../scripts/utils.js';
import { getIcon, handlize, generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function decorateField(row, type = 'text') {
  row.classList.add('text=field-row');
  const cols = row.querySelectorAll(':scope > div');
  if (!cols.length) return;
  const [placeholderCol, maxLengthCol] = cols;
  const text = placeholderCol.textContent.trim();
  const attrTextEl = createTag('div', { class: 'attr-text' }, maxLengthCol.textContent.trim());
  const maxCharNum = maxLengthCol.querySelector('strong')?.textContent.trim();
  const isRequired = attrTextEl.textContent.trim().endsWith('*');
  const handle = handlize(text);
  let input;
  if (type === 'text') {
    input = createTag('input', { id: `info-field-${handle}`, type: 'text', class: 'text-input', placeholder: text, required: isRequired });
  }

  if (type === 'textarea') {
    input = createTag('textarea', { id: `info-field-${handle}`, class: 'textarea-input', placeholder: text, required: isRequired });
  }

  if (maxCharNum) input.setAttribute('maxlength', maxCharNum);

  const wrapper = createTag('div', { class: 'info-field-wrapper' });
  row.innerHTML = '';
  wrapper.append(input, attrTextEl);
  row.append(wrapper);
}

function buildDatePicker(column) {
  column.classList.add('date-picker');
  const dateLabel = createTag('label', { for: 'event-info-date-picker' }, column.textContent.trim());
  const datePicker = createTag('input', { id: 'event-info-date-picker', name: 'event-date', class: 'date-input' });
  const calendarIcon = getIcon('calendar-add');

  column.innerHTML = '';
  column.append(dateLabel, datePicker, calendarIcon);
}

function buildTimePicker(column) {
  column.classList.add('time-pickers');
  const header = column.querySelector(':scope > p');
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
  if (header) column.append(header);
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
  generateToolTip(el);

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    if (i === 1) decorateField(r, 'text');
    if (i === 2) decorateField(r, 'textarea');
    if (i === 3) decorateDateTimeFields(r);
  });
}
