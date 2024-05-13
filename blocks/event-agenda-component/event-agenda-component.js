import { getLibs } from '../../scripts/utils.js';
import { getIcon, handlize, generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

async function decorateField(row, type = 'text') {
  const miloLibs = getLibs();
  await Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/textfield.js`),
  ]);

  row.classList.add('text-field-row');
  const cols = row.querySelectorAll(':scope > div');
  if (!cols.length) return;
  const [placeholderCol, maxLengthCol] = cols;
  const text = placeholderCol.textContent.trim();
  const attrTextEl = createTag('div', { class: 'attr-text' }, maxLengthCol.textContent.trim());

  const maxCharNum = maxLengthCol.querySelector('strong')?.textContent.trim();
  const isRequired = attrTextEl.textContent.trim().endsWith('*');
  let input;
  if (type === 'text') {
    input = createTag('sp-textfield', {
      id: `agenda-field-${handlize(text)}`, 
      class: 'text-input', 
      placeholder: text, 
      required: isRequired, 
      quiet: true, 
      size: 'xl',
    });
  } 
  if (maxCharNum) {
    input.setAttribute('maxlength', maxCharNum);
  }
  const wrapper = createTag('div', { class: 'field-container'});
  const textWrapper = createTag('div', { class: 'text-field-wrapper' });
  textWrapper.append(input, attrTextEl)
  row.innerHTML = '';
  wrapper.append(cols[2], textWrapper)
  row.append(wrapper);

  const timePickerContainer = createTag('div');
  timePickerContainer.classList.add('custom-time-picker');
  
  buildTimePicker(cols[2]);  

  return row;
}

function buildTimePicker(column) {
  column.classList.add('time-pickers');
  const header = column.querySelector(':scope > p');
  const rows = column.querySelectorAll('table tr');
  const timePickerWrappers = [];

  rows.forEach((r) => {
    const timePickerWrapper = createTag('div', { class: 'time-picker-wrapper' });
    const cols = r.querySelectorAll('td');
    let pickerName;
    cols.forEach((c, j) => {
      if (j === 0) {
        pickerName = "Time";
        console.log(pickerName)
      }

      if (j === 0) {
        const timeSlots = c.querySelectorAll('li');
        const select = createTag('select', { id: `time-picker-${handlize(pickerName)}`, class: 'select-input' });
        timeSlots.forEach((t) => {
          const text = t.textContent.trim();
          const option = createTag('option', { value: handlize(text) }, text);
          select.append(option);
        });
        timePickerWrapper.append(select);
      }
    });

    timePickerWrappers.push(timePickerWrapper);
  });

  column.innerHTML = '';
  if (header) column.append(header);
  column.prepend(getIcon('clock'))
  timePickerWrappers.forEach((w) => { column.append(w); });
}

async function decorateCheckBox(row) {
  const fieldSet = createTag('fieldset', { class: 'checkboxes' });
  row.classList.add('agenda-info-addition');
  const checkBoxRow = [...row.querySelectorAll(':scope > div')];
  const cn = checkBoxRow[2].textContent.trim();
  row.innerHTML = '';


  // Create checkbox input
  const checkbox = createTag('input', {
    type: 'checkbox',
    id: `checkbox-${handlize(cn)}`,
    name: `checkbox-${handlize(cn)}`,
    class: 'checkbox-input',
    value: cn
  });

  // Create label for the checkbox
  const label = createTag('label', {
    for: checkbox.id,
    class: 'checkbox-label'
  }, cn);

  const wrapper = createTag('div', { class: 'checkbox-wrapper' });
  wrapper.append(checkbox, label);

  fieldSet.append(wrapper);
  row.append(fieldSet);
}




export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el);
  const rows = [...el.querySelectorAll(':scope > div')];
   decorateField(rows[1], 'text');
   decorateCheckBox(rows[3]);
  
}
