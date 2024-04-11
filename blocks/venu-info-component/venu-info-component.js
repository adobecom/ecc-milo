import { getLibs } from '../../scripts/utils.js';
import {
  handlize,
  standardizeFormComponentHeading,
} from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function decorateTextFields(row) {
  row.classList.add('text=field-row');
  const lis = row.querySelectorAll('ul > li');

  if (!lis.length) return;

  lis.forEach((li, i) => {
    const text = li.textContent.trim();
    const isRequired = text.endsWith('*');
    const handle = handlize(text);
    let input;
    if (i === 0) {
      input = createTag('input', {
        id: `info-field-${handle}`,
        type: 'text',
        class: 'text-input',
        placeholder: text,
        required: isRequired,
      });
    } else {
      input = createTag('textarea', {
        id: `info-field-${handle}`,
        class: 'textarea-input',
        placeholder: text,
        required: isRequired,
      });
    }

    const wrapper = createTag('div', { class: 'info-field-wrapper' });

    wrapper.append(input);
    row.append(wrapper);
  });

  const oldDiv = row.querySelector(':scope > div:first-of-type');

  if (oldDiv.querySelector('ul')) oldDiv.remove();
}

function decorateDateTimeFields(row) {
  row.classList.add('date-time-row');
  const cols = row.querySelectorAll(':scope > div');

  cols.forEach((c, i) => {
    if (i === 0) buildDatePicker(c);
    if (i === 1) buildTimePicker(c);
  });
}

function decorateTimezone(row) {
  const cols = row.querySelectorAll(':scope > div');
  const timezonePickerWrapper = createTag('div', {
    class: 'timezone-picker-wrapper',
  });
  let pickerName;
  let isRequired;
  let labelWrapper = createTag('div', { class: 'timezone-label-wrapper' });
  cols.forEach((col, i) => {
    if (i === 0) {
      pickerName = col.textContent.trim();
      isRequired = pickerName.endsWith('*');
      const label = createTag(
        'label',
        {
          for: `timezone-picker-${handlize(pickerName)}`,
        },
        pickerName
      );
      labelWrapper.append(label);
      if (isRequired) {
        labelWrapper.append(
          createTag('span', { class: 'attrib' }, 'Required *')
        );
      }

      timezonePickerWrapper.append(labelWrapper);
    } else if (i === 1) {
      const timeSlots = col.querySelectorAll('li');
      console.log(pickerName, handlize(pickerName));
      const select = createTag('select', {
        id: `timezone-picker-${handlize(pickerName)}`,
        class: `select-input`
      });
      timeSlots.forEach((t) => {
        const text = t.textContent.trim();
        const option = createTag('option', { value: handlize(text) }, text);
        select.append(option);
      });

      timezonePickerWrapper.append(select);
    }
  });

  row.innerHTML = '';
  row.append(timezonePickerWrapper);
}

function decorateTextInput_1(row) {
  const cols = row.querySelectorAll(':scope > div');
  const inputWrapper = createTag('div', { id: 'input-wrapper' });
  const attribWrapper = createTag('div', { id: 'attrib-wrapper' });
  let pickerName;
  let params = { type: 'text' };
  cols.forEach((c, j) => {
    if (j === 0) {
      pickerName = c.textContent.trim();
      const isRequired = pickerName.endsWith('*');
      params.required = isRequired;
      params.id = `venu-info-field-${handlize(pickerName)}`;
    } else if (j === 1) {
      const attribs = c.textContent.split(',').map((s) => s.trim());
      attribs.forEach((attrib) => {
        const [key, value] = attrib.split('=');
        params[key.toLowerCase()] = value;
      });
    }
  });

  params.placeholder = pickerName;

  const inputElem = createTag('input', params);
  inputWrapper.append(inputElem);

  const content = [];
  const attribs = ['maxlength', 'required'];
  attribs.forEach((key) => {
    const lowerCase = key.toLowerCase();
    const value = params[key];
    if (lowerCase === 'maxlength') {
      content.push(`${value} charaters max`);
    } else if (lowerCase === 'required') {
      if (value !== 'false') {
        content.push('*');
      }
    }
  });
  attribWrapper.append(createTag('div', {}, content.join(' ')));

  row.innerHTML = '';
  row.classList.add(`venu-info-${handlize(pickerName)}-wrapper`);
  row.append(inputWrapper);
  row.append(attribWrapper);
}

function decorateTextInput_2(row) {
  const cols = row.querySelectorAll(':scope > div');
  const inputWrapper = createTag('div', { id: 'input-wrapper' });
  let pickerName;
  let params = {};
  pickerName = row.textContent.trim();
  const isRequired = pickerName.endsWith('*');
  params.required = isRequired;
  params.id = `venu-info-field-${handlize(pickerName)}`;

  params.placeholder = pickerName;

  const el = createTag('input', params);

  inputWrapper.append(el);

  row.innerHTML = '';
  row.append(inputWrapper);
}
function decorateCheckboxes(el) {
  const minReg = el.className.match(/min-(.*?)( |$)/);
  const isRequired = !!minReg;
  const lis = el.querySelectorAll('ul > li');
  const checkboxes = [];
  const fieldSet = createTag('fieldset', { class: 'checkboxes' });
  console.log(lis);
  lis.forEach((cb) => {
    const cn = cb.textContent.trim();
    const handle = handlize(cn);
    const input = createTag('input', {
      id: `checkbox-${handle}`,
      name: `checkbox-${handle}`,
      type: 'checkbox',
      class: 'checkbox-input',
      value: handle,
      required: isRequired,
    });
    const label = createTag(
      'label',
      { class: 'checkbox-label', for: `checkbox-${handle}` },
      cn
    );
    const wrapper = createTag('div', { class: 'checkbox-wrapper' });

    wrapper.append(input, label);
    fieldSet.append(wrapper);
    checkboxes.push(input);
  });

  el.append(fieldSet);

  const oldCheckboxDiv = el.querySelector('ul');

  if (oldCheckboxDiv) {
    oldCheckboxDiv.remove();
  }
}

function buildZipcodeSelector(row) {
  const subs = row.querySelectorAll(':scope > div');
  subs.forEach((sub, i) => {
    if (i === 0) decorateTextInput_2(sub);
    else if (i === 1) decorateCheckboxes(sub);
  });
  row.classList.add('venu-info-field-zipcode');
}

export default function init(el) {
  el.classList.add('form-component');
  standardizeFormComponentHeading(el);

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    if (i === 1) decorateTimezone(r);
    else if (i === 2 || i === 3) decorateTextInput_1(r);
    else if (i === 4) buildZipcodeSelector(r);
  });
}
