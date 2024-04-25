import { getLibs } from '../../scripts/utils.js';
import { getIcon, handlize, standardizeFormComponentHeading } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function decorateImageDropzones(row) {
  row.classList.add('image-dropzones');
  const cols = row.querySelectorAll(':scope > div');
  const dropzones = [];

  cols.forEach((c, i) => {
    c.classList.add('image-dropzone');
    const uploadName = c.querySelector(':scope > p:first-of-type')?.textContent.trim();
    const paragraphs = c.querySelectorAll(':scope > p');
    const existingFileInput = document.querySelectorAll('.img-file-input');
    const inputId = uploadName ? `${handlize(uploadName)}` : `img-file-input-${existingFileInput.length + i}`;
    const fileInput = createTag('input', { id: inputId, type: 'file', class: 'img-file-input' });
    const inputWrapper = createTag('div', { class: 'img-file-input-wrapper' });
    const inputLabel = createTag('label', { class: 'img-file-input-label dropzone' });

    const previewWrapper = createTag('div', { class: 'preview-wrapper hidden' });
    const previewImg = createTag('div', { class: 'preview-img-placeholder' });
    const previewDeleteButton = getIcon('delete--smoke');

    previewWrapper.append(previewImg, previewDeleteButton);

    inputWrapper.append(previewWrapper, inputLabel);
    inputLabel.append(fileInput, getIcon('image-add--smoke'));
    paragraphs.forEach((p) => {
      inputLabel.append(p);
    });
    dropzones.push(inputWrapper);
  });

  row.innerHTML = '';
  dropzones.forEach((dz) => {
    row.append(dz);
  });
}

export default function init(el) {
  el.classList.add('form-component');
  standardizeFormComponentHeading(el);

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    if (i === 1) decorateImageDropzones(r);
  });
}
