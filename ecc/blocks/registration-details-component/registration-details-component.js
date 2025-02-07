import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function decorateSWCTextField(row, options) {
  row.classList.add('text-field-row');

  const cols = row.querySelectorAll(':scope > div');
  if (!cols.length) return;
  const [placeholderCol, maxLengthCol] = cols;
  const text = placeholderCol.textContent.trim();

  let maxCharNum; let
    attrTextEl;
  if (maxLengthCol) {
    attrTextEl = createTag('div', { class: 'attr-text' }, maxLengthCol.textContent.trim());
    maxCharNum = maxLengthCol.querySelector('strong')?.textContent.trim();
  }

  const isRequired = attrTextEl?.textContent.trim().endsWith('*');

  const inputOptions = { ...options, class: 'text-input', placeholder: text };
  if (isRequired) inputOptions.required = true;
  if (maxCharNum) inputOptions.maxlength = maxCharNum;

  const input = createTag('sp-textfield', inputOptions);

  const wrapper = createTag('div', { class: 'rsvp-field-wrapper' });
  row.innerHTML = '';
  wrapper.append(input);
  if (attrTextEl) wrapper.append(attrTextEl);
  row.append(wrapper);
}

export default async function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    if (i === 0) generateToolTip(r);
    if (i === 1) {
      r.classList.add('registration-configs-wrapper');
      r.innerHTML = '';
    }
    if (i === 2) decorateSWCTextField(r, { quiet: true, size: 'xl', id: 'rsvp-form-detail-description' });
  });
}
