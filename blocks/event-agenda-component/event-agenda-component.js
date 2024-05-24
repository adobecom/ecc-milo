import { getLibs } from '../../scripts/utils.js';
import { addRepeater, handlize, generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function buildTimePicker(column) {
  column.classList.add('time-picker');
  const header = column.querySelector(':scope > p');

  const timePickerWrapper = createTag('div', { class: 'time-picker-wrapper' });
  const timeSlots = column.querySelectorAll('li');
  const select = createTag('select', {
    id: 'time-picker',
    class: 'select-input',
  });

  timeSlots.forEach((t) => {
    const text = t.textContent.trim();
    const option = createTag('option', { value: handlize(text) }, text);
    select.append(option);
  });

  timePickerWrapper.append(select);

  column.innerHTML = '';
  if (header) column.append(header);
  column.append(timePickerWrapper);
}

async function decorateFields(row) {
  row.classList.add('agenda-input-fields-row');
  const cols = row.querySelectorAll(':scope > div');
  if (!cols.length) return null;
  const [placeholderCol, maxLengthCol] = cols;
  const text = placeholderCol.textContent.trim();
  const attrTextEl = createTag(
    'div',
    { class: 'attr-text' },
    maxLengthCol.textContent.trim(),
  );

  const maxCharNum = maxLengthCol.querySelector('strong')?.textContent.trim();
  const isRequired = attrTextEl.textContent.trim().endsWith('*');
  const input = createTag('sp-textfield', {
    id: 'agenda-field-details',
    class: 'text-input',
    placeholder: text,
    required: isRequired,
    quiet: true,
    size: 'xl',
  });

  if (maxCharNum) {
    input.setAttribute('maxlength', maxCharNum);
  }

  const wrapper = createTag('div', { class: 'field-container' });
  const textWrapper = createTag('div', { class: 'text-field-wrapper' });
  textWrapper.append(input, attrTextEl);
  row.innerHTML = '';
  wrapper.append(cols[2], textWrapper);
  row.append(wrapper);

  const timePickerContainer = createTag('div');
  timePickerContainer.classList.add('custom-time-picker');

  buildTimePicker(cols[2]);

  return row;
}

async function decorateCheckBox(row) {
  const fieldSet = createTag('fieldset', { class: 'checkboxes' });
  row.classList.add('agenda-info-addition');
  const cols = row.querySelectorAll(':scope > div');
  const [checkboxText] = cols;
  const cn = checkboxText.textContent.trim();
  row.innerHTML = '';

  const checkbox = document.createElement('sp-checkbox');
  checkbox.id = 'checkbox-agenda-info';
  checkbox.name = 'checkbox-agenda-info-name';
  checkbox.value = cn;
  checkbox.textContent = cn;

  const wrapper = createTag('div', { class: 'checkbox-wrapper' });
  wrapper.append(checkbox);

  fieldSet.append(wrapper);
  row.append(fieldSet);
}

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el);
  const rows = [...el.querySelectorAll(':scope > div')];
  decorateFields(rows[1]);
  decorateCheckBox(rows[2]);
}
