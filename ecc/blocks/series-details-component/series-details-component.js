import { LIBS } from '../../scripts/scripts.js';
import {
  getIcon,
  generateToolTip,
  decorateTextfield,
  decorateTextarea,
  miloReplaceKey,
} from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function buildDatePicker(column) {
  column.classList.add('date-picker');
  const datePicker = createTag('input', { id: 'event-info-date-picker', name: 'event-date', class: 'date-input', required: true, placeholder: column.textContent.trim() });
  const calendarIcon = getIcon('calendar-add');

  column.innerHTML = '';
  column.append(datePicker, calendarIcon);
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

async function decorateCloudTagSelect(column) {
  const phText = column.textContent.trim();
  const buSelectWrapper = createTag('div', { class: 'bu-picker-wrapper' });
  const select = createTag('sp-picker', { id: 'bu-select-input', pending: true, class: 'select-input', size: 'm', label: phText });

  column.innerHTML = '';
  buSelectWrapper.append(select);
  column.append(buSelectWrapper);

  // FIXME: cloulds shouldn't be hardcoded
  // const clouds = await getClouds();
  // const clouds = [{ id: 'CreativeCloud', name: 'Creative Cloud' }, { id: 'DX', name: 'Experience Cloud' }];
  const clouds = [{ id: 'CreativeCloud', name: 'Creative Cloud' }];

  Object.entries(clouds).forEach(([, val]) => {
    const opt = createTag('sp-menu-item', { value: val.id }, val.name);
    select.append(opt);
  });

  select.pending = false;
}

export default function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach(async (r, ri) => {
    const cols = r.querySelectorAll(':scope > div');
    if (ri === 0) generateToolTip(r);

    if (ri === 1) {
      r.classList.add('series-fields-wrapper');

      cols.forEach(async (c, ci) => {
        if (ci === 0) decorateCloudTagSelect(c);
        if (ci === 1) decorateSeriesFormatSelect(c);
        // if (ci === 2) decorateNewSeriesBtnAndModal(c);
        // if (ci === 2) decorateCheckbox(c);
      });
    }

    if (ri === 2) {
      await decorateTextfield(r, { id: 'info-field-series-name' }, await miloReplaceKey('duplicate-series--error'));
    }

    if (ri === 3) {
      await decorateTextarea(r, { id: 'info-field-series-description', grows: true, quiet: true });
    }
  });
}
