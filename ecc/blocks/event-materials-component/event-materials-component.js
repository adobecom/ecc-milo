import { getLibs } from '../../scripts/utils.js';
import { getIcon, generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

async function decorateSWCTextField(row, extraOptions) {
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

  const input = createTag('sp-textfield', { ...extraOptions, class: 'text-input', placeholder: text });

  if (isRequired) input.required = true;

  if (maxCharNum) input.setAttribute('maxlength', maxCharNum);

  const wrapper = createTag('div', { class: 'info-field-wrapper' });
  row.innerHTML = '';
  wrapper.append(input);
  if (attrTextEl) wrapper.append(attrTextEl);
  row.append(wrapper);
}

function decorateFileDropzone(row) {
  row.classList.add('file-dropzones');
  const cols = row.querySelectorAll(':scope > div');
  const dropzones = [];

  cols.forEach((c, i) => {
    c.classList.add('file-dropzone');
    const text = c.textContent.trim();
    const existingFileInputs = document.querySelectorAll('.material-file-input');
    const inputId = `material-file-input-${existingFileInputs.length + i + 1}`;
    const fileInput = createTag('input', { id: inputId, type: 'file', class: 'material-file-input' });
    const inputWrapper = createTag('div', { class: 'material-file-input-wrapper' });
    const inputLabel = createTag('label', { class: 'material-file-input-label' });

    const previewWrapper = createTag('div', { class: 'preview-wrapper hidden' });
    const previewImg = createTag('div', { class: 'preview-img-placeholder' });
    const previewDeleteButton = getIcon('delete');

    previewWrapper.append(previewImg, previewDeleteButton);

    inputWrapper.append(previewWrapper, inputLabel);
    inputLabel.append(fileInput, getIcon('upload-cloud'), text);
    dropzones.push(inputWrapper);
  });

  row.innerHTML = '';
  dropzones.forEach((dz) => {
    row.append(dz);
  });
}

export default function init(el) {
  const existingFileInputs = document.querySelectorAll('.event-materials-component');
  const blockIndex = Array.from(existingFileInputs).findIndex((b) => b === el);

  el.classList.add('form-component');
  generateToolTip(el);

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach(async (r, i) => {
    if (i === 0) decorateFileDropzone(r);
    if (i === 1) await decorateSWCTextField(r, { id: `event-material-url-${blockIndex}` });
    if (i === 2) await decorateSWCTextField(r, { id: `event-material-name-${blockIndex}`, quiet: true, size: 'xl' });
  });
}
