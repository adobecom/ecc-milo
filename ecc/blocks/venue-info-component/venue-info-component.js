import { LIBS } from '../../scripts/scripts.js';
import { handlize, generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function decorateSWCTextField(row, extraOptions) {
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

  const isRequired = extraOptions.required || attrTextEl?.textContent.trim().endsWith('*');

  const input = createTag('sp-textfield', { ...extraOptions, class: 'venue-info-text text-input', placeholder: text });

  if (isRequired) input.required = true;

  if (maxCharNum) input.setAttribute('maxlength', maxCharNum);

  const wrapper = createTag('div', { class: 'info-field-wrapper' });
  row.innerHTML = '';
  wrapper.append(input);
  if (attrTextEl) wrapper.append(attrTextEl);
  row.append(wrapper);
}

function decorateImageDropzones(row) {
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
      gridItems.push(buildCheckbox(c));
    }
  });

  row.innerHTML = '';
  gridItems.forEach((dz) => {
    row.append(dz);
  });
}

function decorateRTETiptap(row) {
  row.classList.add('rte-tiptap-row');
  const rte = createTag('rte-tiptap', { id: 'venue-additional-info-rte' });
  row.append(rte);
}

function decorateToolTip(row) {
  row.classList.add('venue-additional-info');
  generateToolTip(row);
}

function buildAdditionalInfo(row, index) {
  row.classList.add('venue-info-addition');
  const fieldSet = createTag('fieldset', { class: 'checkboxes' });
  const [inputLabel, comment] = [...row.querySelectorAll(':scope  p')];
  const labelText = inputLabel.textContent.trim();
  let checkbox;
  console.log(row);
  if (index === 4) {
    checkbox = createTag('sp-checkbox', { id: 'checkbox-venue-info-visible' }, labelText);
  } else if (index === 8) {
    checkbox = createTag('sp-checkbox', { id: 'checkbox-venue-additional-info-visible' }, labelText);
  }
  
  const wrapper = createTag('div', { class: 'checkbox-wrapper' });

  wrapper.append(checkbox);
  fieldSet.append(wrapper);

  const additionComment = createTag('div', { class: 'additional-comment' });
  additionComment.append(comment.textContent.trim());
  row.innerHTML = '';
  fieldSet.append(additionComment);
  row.append(fieldSet);
  row.classList.add('venue-info-addition-wrapper');
}

function buildLocationInputGrid(row) {
  const locationDetailsWrapper = createTag('div', { class: 'location-wrapper' });
  const placeIdInput = createTag('input', { id: 'google-place-id', type: 'hidden', required: true });
  const placeLATInput = createTag('input', { id: 'google-place-lat', type: 'hidden' });
  const placeLNGInput = createTag('input', { id: 'google-place-lng', type: 'hidden' });
  const gmtOffsetInput = createTag('input', { id: 'google-place-gmt-offset', type: 'hidden' });
  const addressComponentsInput = createTag('input', { id: 'google-place-address-components', type: 'hidden' });

  locationDetailsWrapper.append(
    placeIdInput,
    placeLATInput,
    placeLNGInput,
    gmtOffsetInput,
    addressComponentsInput,
  );

  row.innerHTML = '';
  row.append(locationDetailsWrapper);
  row.classList.add('venue-info-field-location');
}

export default function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    switch (i) {
      case 0:
        generateToolTip(r);
        break;
      case 1:
        decorateSWCTextField(r, {
          id: 'venue-info-venue-name',
          quiet: true,
          size: 'xl',
        });
        break;
      case 2:
        decorateSWCTextField(r, {
          id: 'google-place-formatted-address',
          quiet: true,
          size: 'xl',
          readonly: true,
          required: true,
        });
        break;
      case 3:
        buildLocationInputGrid(r);
        break;
      case 4:
        buildAdditionalInfo(r, i);
        break;
      case 5:
        decorateToolTip(r);
        break;
      case 6:
        decorateImageDropzones(r);
        break;
      case 7:
        decorateRTETiptap(r);
        break;
      case 8:
        buildAdditionalInfo(r, i);
        break;
      default:
        break;
    }
  });
}
