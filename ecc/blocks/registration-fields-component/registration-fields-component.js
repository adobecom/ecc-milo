import { LIBS } from '../../scripts/scripts.js';
import { decorateSwitchFieldset, generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function convertString(input) {
  const parts = input.replace(/([a-z])([A-Z])/g, '$1 $2');
  const result = parts.toUpperCase();

  return result;
}

async function decorateRSVPFields(el) {
  const row = el.querySelector(':scope > div:last-of-type');

  if (!row) return;

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

  el.dataset.mandatedfields = config.data.filter((f) => f.Required === 'x').map((f) => f.Field);

  config.data.filter((f) => f.Required !== 'x' && f.Type !== 'submit').forEach((field) => {
    const fieldRow = createTag('tr', { class: 'field-row' }, '', { parent: tbody });
    const tds = [];
    for (let i = 0; i < 3; i += 1) {
      tds.push(createTag('td', {}, '', { parent: fieldRow }));
    }
    const catText = convertString(field.Field);
    createTag('div', { class: 'cat-text' }, catText, { parent: tds[0] });
    const appearFieldset = decorateSwitchFieldset({ class: 'check-appear', name: field.Field }, 'Appears on form');
    const requiredFieldset = decorateSwitchFieldset({ class: 'check-require', name: field.Field }, 'Required field');
    tds[1].append(appearFieldset);
    tds[2].append(requiredFieldset);
  });
}

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));
  await decorateRSVPFields(el);
}
