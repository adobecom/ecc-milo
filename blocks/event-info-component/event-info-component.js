import { getLibs } from '../../scripts/utils.js';
import { getIcon, handlize, generateToolTip, decorateTextfield } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function buildDatePicker(column) {
  column.classList.add('date-picker');
  const dateLabel = createTag('label', { for: 'event-info-date-picker' }, column.textContent.trim());
  const datePicker = createTag('input', { id: 'event-info-date-picker', name: 'event-date', class: 'date-input', required: true });
  const calendarIcon = getIcon('calendar-add');

  column.innerHTML = '';
  column.append(dateLabel, datePicker, calendarIcon);
}

function convertTo24HourFormat(timeStr) {
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

function buildTimePicker(column) {
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
  rows.forEach(async (r, i) => {
    if (i === 1) await decorateTextfield(r, 'text');
    if (i === 2) await decorateTextfield(r, 'textarea');
    if (i === 3) decorateDateTimeFields(r);
  });
}
