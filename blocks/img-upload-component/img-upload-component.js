import { getLibs } from '../../scripts/utils.js';
import { handlize, generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function decorateImageDropzones(row) {
  row.classList.add('image-dropzones');
  const cols = row.querySelectorAll(':scope > div');
  const dropzones = [];

  cols.forEach((c, i) => {
    c.classList.add('image-dropzone');
    const uploadName = c.querySelector(':scope > p:first-of-type')?.textContent.trim();
    const existingFileInput = document.querySelectorAll('.img-file-input');
    const inputId = uploadName ? `${handlize(uploadName)}` : `img-file-input-${existingFileInput.length + i}`;
    const paragraphs = c.querySelectorAll(':scope > p');

    const dropzoneUI = createTag('image-dropzone', {'inputid' : inputId });
    const inputLabel = createTag('div', { slot: 'img-label', class: 'img-upload-text'});
    paragraphs.forEach((p) => {
      inputLabel.append(p);
    });
    
    dropzoneUI.append(inputLabel);
    dropzones.push(dropzoneUI);
  });

  row.innerHTML = '';
  dropzones.forEach((dz) => {
    row.append(dz);
  });
}

export default function init(el) {
  el.classList.add('form-component');
  generateToolTip(el);

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    if (i === 1) decorateImageDropzones(r);
  });
}
