import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function getTimeSlots(column) {
  const timeSlots = Array.from(column.querySelectorAll('li')).map((li) => li.textContent.trim());
  return timeSlots;
}

function decorateFields(row) {
  row.classList.add('agenda-input-fields-row');
  const cols = row.querySelectorAll(':scope > div');
  if (!cols.length) return;

  const [placeholderCol, maxLengthCol] = cols;
  const maxLengthText = maxLengthCol.textContent.trim();
  const placeholder = placeholderCol.textContent.trim();
  const maxCharNum = maxLengthCol.querySelector('strong')?.textContent.trim();
  const isRequired = maxLengthText.endsWith('*');

  const options = {
    maxLengthText,
    maxCharNum,
    placeholder,
    isRequired,
  };

  row.innerHTML = '';

  const timeslots = getTimeSlots(cols[2]);
  const fieldSetWrapper = createTag('agenda-fieldset-group');
  fieldSetWrapper.dataset.timeslots = timeslots.join(',');
  fieldSetWrapper.dataset.options = JSON.stringify(options);

  row.append(fieldSetWrapper);
}

function decorateCheckBox(row) {
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
