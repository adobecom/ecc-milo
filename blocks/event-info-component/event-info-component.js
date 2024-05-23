import { getLibs } from '../../scripts/utils.js';
import { getIcon, generateToolTip, decorateTextfield, decorateTextarea, convertTo24HourFormat } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function buildDatePicker(column) {
  column.classList.add('date-picker');
  const dateLabel = createTag('label', { for: 'event-info-date-picker' }, column.textContent.trim());
  const datePicker = createTag('input', { id: 'event-info-date-picker', name: 'event-date', class: 'date-input', required: true });
  const calendarIcon = getIcon('calendar-add');

  column.innerHTML = '';
  column.append(dateLabel, datePicker, calendarIcon);
}

function buildTimePicker(column, wrapper) {
  column.classList.add('time-pickers');
  const header = column.querySelector(':scope > p');
  const rows = column.querySelectorAll('table tr');
  const timePickerWrappers = [];

  rows.forEach((r, i) => {
    const timePickerWrapper = createTag('div', { class: 'time-picker-wrapper' });
    const cols = r.querySelectorAll('td');
    let pickerName;
    let pickerHandle;
    if (i === 0) pickerHandle = 'start-time';
    if (i === 1) pickerHandle = 'end-time';
    cols.forEach((c, j) => {
      if (j === 0) {
        pickerName = c.textContent.trim();

        const label = createTag('label', { for: `time-picker-${pickerHandle}` }, pickerName);
        timePickerWrapper.append(label);
      }

      if (j === 1) {
        const timeSlots = c.querySelectorAll('li');
        const select = createTag('select', { id: `time-picker-${pickerHandle}`, class: 'select-input', required: true });
        const option = createTag('option', { value: '', selected: true, disabled: true }, '-');
        select.append(option);
        timeSlots.forEach((t) => {
          const text = t.textContent.trim();
          const opt = createTag('option', { value: convertTo24HourFormat(text) }, text);
          select.append(opt);
        });
        timePickerWrapper.append(select);
      }
    });

    timePickerWrappers.push(timePickerWrapper);
  });

  column.innerHTML = '';
  if (header) wrapper.before(header);
  timePickerWrappers.forEach((w) => { column.append(w); });

  wrapper.append(column);
}

function getGMTOffset(timeZone) {
  const match = timeZone.match(/UTC([+-])(\d{2}):(\d{2})/);
  if (match) {
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);

    return sign * hours;
  }

  return 0;
}

function decorateTimeZoneSelect(cell, wrapper) {
  const phText = cell.querySelector('p')?.textContent.trim();
  const option = createTag('option', { value: '', disabled: true, selected: true }, phText);
  const select = createTag('select', { id: 'time-zone-select-input', class: 'select-input', required: true });
  select.append(option);
  const timeZones = cell.querySelectorAll('li');
  timeZones.forEach((t) => {
    const text = t.textContent.trim();
    const opt = createTag('option', { value: getGMTOffset(text.split(' - ')[0]) }, text);
    select.append(opt);
  });
  cell.innerHTML = '';
  cell.className = 'time-zone-picker';
  cell.append(select);

  wrapper.append(cell);
}

function decorateDateTimeFields(row) {
  row.classList.add('date-time-row');
  const timeInputsWrapper = createTag('div', { class: 'time-inputs-wrapper' });
  const cols = row.querySelectorAll(':scope > div');
  row.append(timeInputsWrapper);

  cols.forEach((c, i) => {
    if (i === 0) buildDatePicker(c);
    if (i === 1) buildTimePicker(c, timeInputsWrapper);
    if (i === 2) decorateTimeZoneSelect(c, timeInputsWrapper);
  });
}

export default function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach(async (r, i) => {
    switch (i) {
      case 0:
        generateToolTip(r);
        break;
      case 1:
        await decorateTextfield(r, { id: 'info-field-event-title' });
        break;
      case 2:
        await decorateTextarea(r, { id: 'info-field-event-description' });
        break;
      case 3:
        decorateDateTimeFields(r);
        break;
      default:
        break;
    }
  });
}
