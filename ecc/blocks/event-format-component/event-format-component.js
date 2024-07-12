import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

async function decorateCloudTagSelect(column) {
  const phText = column.textContent.trim();
  const buSelectWrapper = createTag('div', { class: 'bu-picker-wrapper' });
  const select = createTag('sp-picker', { id: 'bu-select-input', pending: true, class: 'select-input', size: 'm', label: phText });

  column.innerHTML = '';
  buSelectWrapper.append(select);
  column.append(buSelectWrapper);

  // const clouds = await getClouds();
  const clouds = [{ id: 'CreativeCloud', name: 'Creative Cloud' }, { id: 'DX', name: 'Experience Cloud' }];

  Object.entries(clouds).forEach(([, val]) => {
    const opt = createTag('sp-menu-item', { value: val.id }, val.name);
    select.append(opt);
  });

  select.pending = false;
}

async function decorateSeriesSelect(column) {
  const seriesSelectWrapper = createTag('div', { class: 'series-picker-wrapper' });
  const select = createTag('sp-picker', { id: 'series-select-input', class: 'select-input', pending: true, size: 'm', label: column.textContent.trim() });
  seriesSelectWrapper.append(select);

  column.innerHTML = '';
  column.append(seriesSelectWrapper);
}

function decorateTimeZoneSelect(column) {
  const tzWrapper = createTag('div', { class: 'time-zone-picker-wrapper' });
  const phText = column.querySelector('p')?.textContent.trim();
  const option = createTag('option', { value: '', disabled: true, selected: true }, phText);
  const select = createTag('select', { id: 'time-zone-select-input', class: 'select-input' });

  select.append(option);

  const timeZones = column.querySelectorAll('li');
  timeZones.forEach((t) => {
    const text = t.textContent.trim();
    const opt = createTag('option', { value: text.split(' - ')[1] }, text);
    select.append(opt);
  });
  column.innerHTML = '';

  tzWrapper.append(select);
  column.append(tzWrapper);
}

function decorateCheckbox(column) {
  const checkbox = createTag('sp-checkbox', { id: 'rsvp-required-check' }, column.textContent.trim());
  column.innerHTML = '';
  column.append(checkbox);
}

export default function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, ri) => {
    const cols = r.querySelectorAll(':scope > div');
    if (ri === 0) generateToolTip(el);

    if (ri === 1) {
      r.classList.add('series-fields-wrapper');

      cols.forEach(async (c, ci) => {
        if (ci === 0) decorateCloudTagSelect(c);
        if (ci === 1) decorateSeriesSelect(c);
        // if (ci === 2) decorateNewSeriesBtnAndModal(c);
        if (ci === 2) decorateCheckbox(c);
      });
    }

    if (ri === 2) {
      cols.forEach(async (c, ci) => {
        if (ci === 0) decorateTimeZoneSelect(c);
      });
    }
  });
}
