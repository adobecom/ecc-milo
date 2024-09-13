import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function decorateAttendeeCountInput(col) {
  col.classList.add('attendee-count-wrapper');
  const input = createTag('input', { id: 'attendee-count-input', name: 'attendee-count-input', class: 'number-input', type: 'number', min: 0 });
  const label = createTag('label', { for: 'attendee-count-input', class: 'number-input-label' }, col.textContent.trim());
  col.innerHTML = '';
  col.append(label, input);
}

function decorateRegistrationConfigInputs(col) {
  col.classList.add('registration-config-wrapper');
  const ul = col.querySelector('ul');
  const fieldset = createTag('fieldset', { class: 'radios-wrapper' });
  ul.parentElement.replaceChild(fieldset, ul);
  const lis = ul.querySelectorAll(':scope > li');

  lis.forEach((li, i) => {
    if (i === 0) {
      const radioInput = createTag('input', { id: 'disable-rsvp-radio', type: 'radio', name: 'registration-config', class: 'radio-input' });
      const radioSpan = createTag('span', { class: 'radio-span' });
      const label = createTag('label', { for: 'disable-rsvp-radio', class: 'radio-label' }, li.textContent.trim());
      const radioWrapper = createTag('div', { class: 'radio-wrapper' });
      radioWrapper.append(radioInput, radioSpan, label);
      fieldset.append(radioWrapper);
    }

    if (i === 1) {
      const radioInput = createTag('input', { id: 'allow-waitlisting-radio', type: 'radio', name: 'registration-config', class: 'radio-input' });
      const radioSpan = createTag('span', { class: 'radio-span' });
      const label = createTag('label', { for: 'allow-waitlisting-radio', class: 'radio-label' }, li.textContent.trim());
      const radioWrapper = createTag('div', { class: 'radio-wrapper' });
      radioWrapper.append(radioInput, radioSpan, label);
      fieldset.append(radioWrapper);
    }
  });
}

function decorateAllCheckboxes(el) {
  const ul = el.querySelector('ul');
  const fieldset = createTag('fieldset', { class: 'checkboxes-wrapper' });
  ul.parentElement.replaceChild(fieldset, ul);
  const lis = ul.querySelectorAll(':scope > li');

  lis.forEach((li, i) => {
    if (i === 0) {
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

function decorateAttendeeFields(row) {
  row.classList.add('attendee-fields-wrapper');
  const cols = row.querySelectorAll(':scope > div');

  cols.forEach((c, i) => {
    switch (i) {
      case 0: {
        decorateAttendeeCountInput(c);
        break;
      }

      case 1: {
        decorateRegistrationConfigInputs(c);
        break;
      }

      case 2: {
        decorateAllCheckboxes(c);
        break;
      }

      default: {
        break;
      }
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

export default async function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    if (i === 0) generateToolTip(r);
    if (i === 1) decorateAttendeeFields(r);
    if (i === 2) decorateSWCTextField(r, { quiet: true, size: 'xl', id: 'rsvp-form-detail-description' });
  });
}
