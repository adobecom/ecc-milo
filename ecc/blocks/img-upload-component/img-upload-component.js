import { LIBS } from '../../scripts/scripts.js';
import { handlize, generateToolTip } from '../../scripts/utils.js';

function decorateImageDropzones(row, createTag) {
  row.classList.add('image-dropzones');
  const cols = row.querySelectorAll(':scope > div');
  const gridItems = [];

  cols.forEach((c, i) => {
    if (i === 0) {
      c.classList.add('image-dropzone');
      const dzWrapper = createTag('div', { class: 'img-dropzone-wrapper' });
      const uploadName = c.querySelector(':scope > p:first-of-type')?.textContent.trim();
      const existingFileInput = document.querySelectorAll('.img-file-input');
      const inputId = uploadName ? `${handlize(uploadName)}` : `img-file-input-${existingFileInput.length + i}`;
      const paragraphs = c.querySelectorAll(':scope > p');

      const dropzoneUI = createTag('image-dropzone', { id: inputId }, '', { parent: dzWrapper });
      const inputLabel = createTag('div', { slot: 'img-label', class: 'img-upload-text' });

      const progressWrapper = createTag('div', { class: 'progress-wrapper hidden' }, '', { parent: dzWrapper });
      createTag('sp-progress-circle', { label: 'Uploading image' }, '', { parent: progressWrapper });

      paragraphs.forEach((p) => {
        inputLabel.append(p);
      });

      dropzoneUI.append(inputLabel);
      gridItems.push(dzWrapper);
    }

    if (i === 1) {
      // TODO: Remove this once the authoring changes are published
      c.remove();
    }
  });

  row.innerHTML = '';
  gridItems.forEach((dz) => {
    row.append(dz);
  });
}

export default async function init(el) {
  // TODO: Import createTag at top level once Safari supports top-level await
  const { createTag } = await import(`${LIBS}/utils/utils.js`);
  el.classList.add('form-component');
  generateToolTip(el);

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    if (i === 1) decorateImageDropzones(r, createTag);
  });
}
