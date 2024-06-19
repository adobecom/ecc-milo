import { getLibs } from '../../scripts/utils.js';
import { generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function convertString(input) {
  const parts = input.replace(/([a-z])([A-Z])/g, '$1 $2');
  const result = parts.toUpperCase();

  return result;
}

async function decorateRSVPFields(row) {
  row.classList.add('rsvp-checkboxes');
  const configSheetLocation = row.querySelector('a')?.href;
  const config = await fetch(configSheetLocation)
    .then((resp) => (resp.ok ? resp.json() : null))
    .catch((err) => window.lana?.log(`Failed to load RSVP fields config: ${err}`));

  const fieldConfigTable = createTag('table', { class: 'field-config-table' });
  const thead = createTag('thead', {}, '', { parent: fieldConfigTable });
  const tbody = createTag('tbody', {}, '', { parent: fieldConfigTable });
  const thr = createTag('tr', { class: 'table-header-row' }, '', { parent: thead });
  thr.append(
    createTag('td', { class: 'table-heading' }, 'FIELD CATEGORIES'),
    createTag('td', { class: 'table-heading' }, 'INCLUDE ON FORM'),
    createTag('td', { class: 'table-heading' }, 'MAKE IT REQUIRED'),
  );

  row.innerHTML = '';
  row.append(fieldConfigTable);

  config.data.filter((f) => f.Required !== 'x' && f.Type !== 'submit').forEach((field) => {
    const fieldRow = createTag('tr', { class: 'field-row' }, '', { parent: tbody });
    const tds = [];
    for (let i = 0; i < 3; i += 1) {
      tds.push(createTag('td', {}, '', { parent: fieldRow }));
    }
    const catText = convertString(field.Field);
    createTag('div', { class: 'cat-text' }, catText, { parent: tds[0] });
    createTag('sp-checkbox', { class: 'check-appear', name: field.Field }, 'Appears on form', { parent: tds[1] });
    createTag('sp-checkbox', { class: 'check-require', name: field.Field }, 'Required field', { parent: tds[2] });
  });
}

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));
  await decorateRSVPFields(el.querySelector(':scope > div:last-of-type'));
}
