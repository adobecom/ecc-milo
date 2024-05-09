import { getLibs } from '../../scripts/utils.js';
import { generateToolTip, handlize } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function decorateAttendeeFields(row) {
  row.classList.add('attendee-fields-wrapper');
  const cols = row.querySelectorAll(':scope > div');

  cols.forEach((c, i) => {
    if (i === 0) {
      c.classList.add('attendee-count-wrapper');
      const input = createTag('input', { id: 'attendee-count-input', name: 'attendee-count-input', class: 'number-input', type: 'number' });
      const label = createTag('label', { for: 'attendee-count-input', class: 'number-input-label' }, c.textContent.trim());
      c.innerHTML = '';
      c.append(input, label)
    }
  })
}

function decorateSWCTextField(row, options) {
  row.classList.add('text-field-row');

  const cols = row.querySelectorAll(':scope > div');
  if (!cols.length) return;
  const [placeholderCol, maxLengthCol] = cols;
  const text = placeholderCol.textContent.trim();
  
  let maxCharNum, attrTextEl;
  if (maxLengthCol) {
    attrTextEl = createTag('div', { class: 'attr-text' }, maxLengthCol.textContent.trim());
    maxCharNum = maxLengthCol.querySelector('strong')?.textContent.trim();
  }

  const isRequired = attrTextEl?.textContent.trim().endsWith('*');

  const inputOptions = {
    ...options, class: 'text-input', placeholder: text, 
  }
  if (isRequired) inputOptions.required = true;
  if (maxCharNum) inputOptions.maxlength = maxCharNum;

  const input = createTag('sp-textfield', inputOptions);


  const wrapper = createTag('div', { class: 'rsvp-field-wrapper' });
  row.innerHTML = '';
  wrapper.append(input);
  if (attrTextEl) wrapper.append(attrTextEl);
  row.append(wrapper);
}

function decorateAllCheckboxes(el) {
  const uls = el.querySelectorAll('ul');

  uls.forEach((ul) => {
    const fieldset = createTag('fieldset', { class: 'checkboxes-wrapper' });
    ul.parentElement.replaceChild(fieldset, ul);
    const lis = ul.querySelectorAll('li');

    lis.forEach((li) => {
      const checkbox = createTag('sp-checkbox', { id: `registration-${handlize(li.textContent)}` }, li.textContent.trim());
      fieldset.append(checkbox);
    })
  })
}

function decorateRSVPFields(row) {
  row.classList.add('rsvp-checkboxes');
}

export default async function init(el) {
  const miloLibs = getLibs();
  await Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/textfield.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/checkbox.js`),
  ]);

  el.classList.add('form-component');
  generateToolTip(el);
  decorateAllCheckboxes(el);

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    if (i === 1) decorateAttendeeFields(r);
    if (i === 2 || i === 3 || i === 4) decorateSWCTextField(r, { quiet: true, size: 'xl' });
    if (i === 5) decorateRSVPFields(r);
  });
}
