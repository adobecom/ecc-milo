import { getLibs } from '../../ecc/scripts/utils.js';
import { generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function decorateAttendeeFields(row) {
  row.classList.add('attendee-fields-wrapper');
  const cols = row.querySelectorAll(':scope > div');

  cols.forEach((c, i) => {
    if (i === 0) {
      c.classList.add('attendee-count-wrapper');
      const input = createTag('input', { id: 'attendee-count-input', name: 'attendee-count-input', class: 'number-input', type: 'number', min: 0 });
      const label = createTag('label', { for: 'attendee-count-input', class: 'number-input-label' }, c.textContent.trim());
      c.innerHTML = '';
      c.append(input, label);
    }
  });
}

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

function decorateAllCheckboxes(el) {
  const ul = el.querySelector(':scope > div > div > ul');
  const fieldset = createTag('fieldset', { class: 'checkboxes-wrapper' });
  ul.parentElement.replaceChild(fieldset, ul);
  const lis = ul.querySelectorAll(':scope > li');

  lis.forEach((li, i) => {
    if (i === 0) {
      const checkbox = createTag('sp-checkbox', { id: 'registration-allow-waitlist' }, li.textContent.trim());
      fieldset.append(checkbox);
    } else if (i === 1) {
      const [checkboxText, inputText] = li.textContent.trim().split('|');
      const checkbox = createTag('sp-checkbox', { id: 'registration-contact-host' }, checkboxText);
      const input = createTag('sp-textfield', {
        id: 'event-host-email-input',
        class: 'text-input',
        placeholder: inputText,
        size: 's',
      });

      const wrapperDiv = createTag('div', { class: 'host-contact-wrapper' });
      wrapperDiv.append(checkbox, input);
      fieldset.append(wrapperDiv);
    }
  });
}

export default async function init(el) {
  el.classList.add('form-component');
  decorateAllCheckboxes(el);

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    if (i === 0) generateToolTip(r);
    if (i === 1) decorateAttendeeFields(r);
    if (i === 2) decorateSWCTextField(r, { quiet: true, size: 'xl', id: 'rsvp-form-detail-description' });
  });
}
