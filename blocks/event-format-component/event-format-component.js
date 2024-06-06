import { getLibs } from '../../scripts/utils.js';
import { generateToolTip } from '../../utils/utils.js';
import { getClouds, getSeries } from '../../utils/esp-controller.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);
const { decorateButtons } = await import(`${getLibs()}/utils/decorate.js`);

async function buildPickerFromTags(id, wrapper, phText, options) {
  const select = createTag('sp-picker', { id, class: 'select-input', size: 'm', label: phText });

  options.forEach(([, val]) => {
    const opt = createTag('sp-menu-item', { value: val.id }, val.name);
    select.append(opt);
  });

  wrapper.append(select);
}

async function decorateCloudTagSelect(column) {
  const buSelectWrapper = createTag('div', { class: 'bu-picker-wrapper' });
  const phText = column.textContent.trim();

  // FIXME: use correct data source rather than hardcoded values.
  const clouds = [{ id: 'CreativeCloud', name: 'Creative Cloud' }, { id: 'DX', name: 'Experience Cloud' }];

  buildPickerFromTags('bu-select-input', buSelectWrapper, phText, Object.entries(clouds));

  column.innerHTML = '';
  column.append(buSelectWrapper);
}

async function decorateSeriesSelect(column) {
  const seriesSelectWrapper = createTag('div', { class: 'series-picker-wrapper' });

  let series = await getSeries();
  // if (!series) return;
  if (!series) {
    series = [
      {
        seriesId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        seriesName: 'test series',
      },
    ];
  }
  const select = createTag('sp-picker', { id: 'series-select-input', class: 'select-input', size: 'm', label: column.textContent.trim() });

  Object.values(series).forEach((val) => {
    const opt = createTag('sp-menu-item', { value: val.seriesId }, val.seriesName);
    select.append(opt);
  });

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

async function decorateNewSeriesModal(column) {
  const columnTag = createTag('div', { class: 'new-series-modal hidden' });
  const lightbox = createTag('div', { class: 'new-series-light-box' });
  const lightboxTable = column.querySelector('table');
  const lightboxTableRows = lightboxTable.querySelectorAll('table tr');

  lightboxTableRows.forEach(async (r, ri) => {
    if (ri === 0) {
      const heading = column.querySelector('h3, h4');
      lightbox.append(heading);
    }

    if (ri === 1) {
      const buSelectWrapper = createTag('div', { class: 'bu-picker-wrapper' });
      const phText = r.textContent.trim();
      const label = createTag('label', { for: 'new-series-name-field' }, phText);
      r.innerHTML = '';
      buSelectWrapper.append(label);
      lightbox.append(buSelectWrapper);

      const resp = await fetch('https://www.adobe.com/chimera-api/tags').then((res) => res.json()).catch((error) => error);

      if (!resp.error) {
        const clouds = resp.namespaces.caas.tags['business-unit'].tags;
        buildPickerFromTags(buSelectWrapper, phText, Object.entries(clouds));
      }
    }

    if (ri === 2) {
      const phText = r.textContent.trim();
      const inputWrapper = createTag('div', { class: 'input-wrapper' });
      const label = createTag('label', { for: 'new-series-name-field' }, phText);
      const input = createTag('input', { id: 'new-series-name-field', class: 'text-input', type: 'text' });
      r.innerHTML = '';
      inputWrapper.append(label, input);
      lightbox.append(inputWrapper);
    }

    if (ri === 3) {
      decorateButtons(r);
      const btns = r.querySelectorAll('a');
      const btnsWrapper = createTag('div', { class: 'new-series-ctas-wrapper' });
      btns.forEach((btn) => {
        btnsWrapper.append(btn);
      });
      lightbox.append(btnsWrapper);
    }
  });

  columnTag.append(lightbox);
  column.append(columnTag);
  lightboxTable.remove();
}

function decorateCheckbox(column) {
  const checkbox = createTag('sp-checkbox', { id: 'rsvp-required-check' }, column.textContent.trim());
  column.innerHTML = '';
  column.append(checkbox);
}

// async function decorateNewSeriesBtnAndModal(column) {
//   const pTag = column.querySelector(':scope > p');
//   const plusIcon = getIcon('add-circle');
//   const a = column.querySelector('a[href$="#new-series"]');

//   if (a) {
//     pTag.classList.add('add-series-btn-wrapper');
//     a.append(plusIcon);
//     a.classList.add('add-series-modal-btn');
//   }

//   await decorateNewSeriesModal(column);
// }

export default function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, ri) => {
    const cols = r.querySelectorAll(':scope > div');
    if (ri === 0) generateToolTip(el);

    if (ri === 1) {
      r.classList.add('series-fields-wrapper');

      cols.forEach(async (c, ci) => {
        if (ci === 0) await decorateCloudTagSelect(c);
        if (ci === 1) await decorateSeriesSelect(c);
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
