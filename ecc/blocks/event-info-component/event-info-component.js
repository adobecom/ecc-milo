import { LIBS } from '../../scripts/scripts.js';
import {
  getIcon,
  generateToolTip,
  decorateTextfield,
  decorateTextarea,
  miloReplaceKey,
  addTooltipToEl,
} from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

const privateEventString = 'Set as a private event';
const privateEventToolTip = 'By setting this to private, your event won\'t be publicly found online or published to the events hub.';

function buildDatePicker(column) {
  column.classList.add('date-picker');
  const datePicker = createTag('input', { id: 'event-info-date-picker', name: 'event-date', class: 'date-input', required: true, placeholder: column.textContent.trim() });
  const calendarIcon = getIcon('calendar-add');

  column.innerHTML = '';
  column.append(datePicker, calendarIcon);
}

async function addLanguagePicker(row) {
  const pickerWrapper = createTag('div', { class: 'language-picker-wrapper' });
  createTag('sp-label', { for: 'language-picker' }, 'Language', { parent: pickerWrapper });
  const picker = createTag('sp-picker', { id: 'language-picker', class: 'select-input', required: true, label: 'Pick a Language' }, '', { parent: pickerWrapper });
  addTooltipToEl('Select a language and region to publish the page based on your preference.', pickerWrapper);

  picker.disabled = true;
  row.append(pickerWrapper);
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
        const selectWrapper = createTag('div', { class: 'select-wrapper' });
        const submitValueHolder = createTag('input', { type: 'hidden', name: `time-picker-${pickerHandle}`, id: `time-picker-${pickerHandle}-value`, value: '' });
        const timeSelect = createTag('sp-picker', { id: `time-picker-${pickerHandle}`, class: 'select-input', required: true, label: '-' });
        const ampmSelect = createTag('sp-picker', { id: `ampm-picker-${pickerHandle}`, class: 'select-input', required: true, label: '-' });

        timeSlots.forEach((t) => {
          const text = t.textContent.trim();
          const opt = createTag('sp-menu-item', { value: text }, text);
          timeSelect.append(opt);
        });

        ['AM', 'PM'].forEach((t, ti) => {
          const opt = createTag('sp-menu-item', { value: t }, t);
          if (ti === 0) opt.selected = true;
          ampmSelect.append(opt);
        });

        selectWrapper.append(timeSelect, ampmSelect, submitValueHolder);
        timePickerWrapper.append(selectWrapper);
      }
    });

    timePickerWrappers.push(timePickerWrapper);
  });

  column.innerHTML = '';
  if (header) wrapper.before(header);
  timePickerWrappers.forEach((w) => { column.append(w); });

  wrapper.append(column);
}

function decorateTimeZoneSelect(cell, wrapper) {
  const phText = cell.querySelector('p')?.textContent.trim();
  const select = createTag('sp-picker', { id: 'time-zone-select-input', class: 'select-input', required: true, label: phText });
  const timeZones = cell.querySelectorAll('li');
  timeZones.forEach((t) => {
    const text = t.textContent.trim();
    const opt = createTag('sp-menu-item', { value: text.split(' - ')[1] }, text);
    select.append(opt);
  });
  cell.innerHTML = '';
  cell.className = 'time-zone-picker';
  cell.append(select);

  wrapper.append(cell);
}

function decorateDateTimeFields(row) {
  row.classList.add('date-time-row');
  const timePickerContainer = createTag('div', { class: 'time-picker-container' });
  const timeInputsWrapper = createTag('div', { class: 'time-inputs-wrapper' }, '', { parent: timePickerContainer });
  const cols = row.querySelectorAll(':scope > div');
  row.append(timePickerContainer);

  cols.forEach((c, i) => {
    if (i === 0) buildDatePicker(c);
    if (i === 1) buildTimePicker(c, timeInputsWrapper);
    if (i === 2) decorateTimeZoneSelect(c, timeInputsWrapper);
  });
}

function buildUrlInput(el) {
  const inputWrapper = createTag('div', { class: 'url-input-wrapper' }, '', { parent: el });
  const label = createTag('sp-label', { for: 'event-info-url-input' }, 'English title for page URL', { parent: inputWrapper });

  addTooltipToEl('SEO friendly title', label);
  createTag('sp-textfield', {
    id: 'event-info-url-input',
    label: 'URL',
    placeholder: 'Add event title for page URL',
    class: 'text-input',
    size: 'xl',
    quiet: true,
    required: true,
    pattern: '^[a-zA-Z0-9_-]+$',
  }, '', { parent: inputWrapper });
  el.append(inputWrapper);
}

function addPrivateEventToggle(row) {
  const div = createTag('div', { class: 'private-event-toggle-wrapper' }, '', { parent: row });
  createTag('sp-checkbox', { id: 'private-event', size: 'xl' }, privateEventString, { parent: div });
  addTooltipToEl(privateEventToolTip, div);
}

function buildTitleContainer(row) {
  row.classList.add('title-container');
  const leftWrapper = createTag('div', { class: 'left-wrapper' }, '');
  const rightWrapper = createTag('div', { class: 'right-wrapper' }, '');

  leftWrapper.innerHTML = row.innerHTML;
  row.innerHTML = '';
  row.append(leftWrapper, rightWrapper);

  addPrivateEventToggle(leftWrapper);
  addLanguagePicker(rightWrapper);
}

export default function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach(async (r, i) => {
    switch (i) {
      case 0:
        generateToolTip(r);
        buildTitleContainer(r);
        break;
      case 1:
        await decorateTextfield(r, { id: 'info-field-event-title' }, await miloReplaceKey('duplicate-event-title-error'));
        break;
      case 2:
        await decorateTextarea(r, { id: 'info-field-event-description', grows: true, quiet: true });
        break;
      case 3:
        decorateDateTimeFields(r);
        break;
      default:
        break;
    }
  });

  buildUrlInput(el);
}
