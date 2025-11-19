import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function buildPrimaryProductPicker(el) {
  const pickerWrapper = createTag('div', { class: 'primary-product-picker-wrapper' });
  const label = createTag('sp-field-label', { size: 'l', for: 'primary-product-picker' }, 'Primary product *');
  const picker = createTag('sp-picker', {
    id: 'primary-product-picker',
    class: 'select-input',
    required: true,
    size: 'l',
  });
  const placeholderLabel = createTag('span', { slot: 'label' }, 'Select primary product');

  picker.appendChild(placeholderLabel);
  pickerWrapper.append(label, picker);
  el.append(pickerWrapper);
}

export default function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');

  if (rows.length > 0) {
    generateToolTip(rows[0]);
  }

  buildPrimaryProductPicker(el);
}
