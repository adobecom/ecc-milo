import { LIBS } from '../../scripts/scripts.js';
import {
  generateToolTip,
  getIcon,
} from '../../scripts/utils.js';

async function buildPickerRow(row) {
  const { createTag } = await import(`${LIBS}/utils/utils.js`);

  const [labelCol, sourseLinkCel] = row.querySelectorAll(':scope > div');

  const sourceLink = sourseLinkCel?.textContent.trim();
  const labelText = labelCol?.textContent.trim() || 'Event template';

  const templatePicker = createTag('div', { class: 'picker' });

  if (labelText && sourceLink) {
    const label = createTag('span', { class: 'picker-label' }, labelText);

    const pickerInput = createTag('input', { type: 'hidden', name: 'series-template-input', class: 'series-template-input' });
    const templateNameInput = createTag('sp-textfield', { class: 'series-template-name', size: 'xl', readonly: true });

    const pickerBtn = createTag('a', { class: 'con-button fill picker-btn' }, 'Select');

    templatePicker.append(
      label,
      templateNameInput,
      pickerInput,
      pickerBtn,
    );
  }

  return templatePicker;
}

async function buildPickerOverlay() {
  const { createTag } = await import(`${LIBS}/utils/utils.js`);

  const pickerOverlay = createTag('div', { class: 'picker-overlay hidden' });
  const pickerModal = createTag('div', { class: 'picker-modal' }, '', { parent: pickerOverlay });
  const pickerTitle = createTag('h2', {}, 'Select a template');
  const pickerFieldset = createTag('fieldset', { class: 'picker-fieldset' });
  const actionArea = createTag('div', { class: 'picker-action-area' }, '');

  createTag('div', { class: 'picker-items' }, '', { parent: pickerFieldset });
  createTag('a', { class: 'picker-close-btn' }, getIcon('close-circle'), { parent: pickerModal });
  createTag('a', { class: 'picker-cancel-btn con-button outline' }, 'Cancel', { parent: actionArea });
  createTag('a', { class: 'picker-save-btn con-button fill' }, 'Save', { parent: actionArea });

  pickerModal.append(pickerTitle, pickerFieldset, actionArea);

  return pickerOverlay;
}

async function buildTemplatesPicker(row) {
  const pickerOverlay = await buildPickerOverlay();
  const templatePicker = await buildPickerRow(row);
  const [, sourseLinkCel] = row.querySelectorAll(':scope > div');
  const sourceLink = sourseLinkCel?.textContent.trim();

  row.innerHTML = '';
  row.append(templatePicker, pickerOverlay);

  try {
    templatePicker.dataset.sourceLink = new URL(sourceLink).pathname;
  } catch (e) {
    window.lana?.log('Invalid template source link');
  }
}

export default async function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach(async (r, ri) => {
    if (ri === 0) generateToolTip(r);

    if (ri === 1) {
      await buildTemplatesPicker(r, el);
    }
  });
}
