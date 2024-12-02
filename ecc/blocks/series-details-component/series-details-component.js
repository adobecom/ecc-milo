import { LIBS } from '../../scripts/scripts.js';
import {
  generateToolTip,
  decorateTextfield,
  decorateTextarea,
  miloReplaceKey,
} from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

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

function decorateSeriesFormatSelect(cell) {
  const formatSelectWrapper = createTag('div', { class: 'format-picker-wrapper' });
  const label = createTag('sp-field-label', { for: 'format-select-input' }, cell.textContent.trim());
  const select = createTag('sp-picker', { id: 'format-select-input', class: 'select-input', size: 'm', label: 'Format' });
  const options = [
    { id: 'InPerson', name: 'In-Person' },
    { id: 'Webinar', name: 'Webinar' },
  ];

  options.forEach((o) => {
    const opt = createTag('sp-menu-item', { value: o.id }, o.name);
    select.append(opt);
  });

  cell.innerHTML = '';
  formatSelectWrapper.append(label, select);
  cell.append(formatSelectWrapper);
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
