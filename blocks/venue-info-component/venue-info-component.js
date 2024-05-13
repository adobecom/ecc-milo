import { getLibs } from '../../scripts/utils.js';
import { getIcon, generateToolTip, handlize } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function decorateTextInput(row) {
  const cols = row.querySelectorAll(':scope > div');
  const inputWrapper = createTag('div', { class: 'input-wrapper' });
  const attribWrapper = createTag('div', { class: 'attrib-wrapper' });
  let pickerName;
  const params = { type: 'text' };
  const [placeholderCol, maxLengthCol] = cols;
  const text = placeholderCol.textContent.trim();
  const attrTextEl = createTag('div', { class: 'attr-text' }, maxLengthCol.textContent.trim());
  const maxCharNum = maxLengthCol.querySelector('strong')?.textContent.trim();
  const isRequired = attrTextEl.textContent.trim().endsWith('*');
  const handle = handlize(text);
  const input = createTag('input', { id: `venue-field-${handle}`, type: 'text', class: 'text-input', placeholder: text, required: isRequired });

  if (maxCharNum) input.setAttribute('maxlength', maxCharNum);

  params.placeholder = pickerName;

  inputWrapper.append(input, attrTextEl);

  row.innerHTML = '';
  row.classList.add('venue-info-textinput-wrapper');
  row.append(inputWrapper);
  row.append(attribWrapper);
}

function buildAdditionalInfo(row, i) {
  function decorateImageDropzones(col) {
    col.classList.add('image-dropzone');
    const uploadName = col
      .querySelector(':scope > p:first-of-type')
      ?.textContent.trim();
    const paragraphs = col.querySelectorAll(':scope > p');
    const existingFileInput = document.querySelectorAll('.img-file-input');
    const inputId = uploadName
      ? `${handlize(uploadName)}`
      : `img-file-input-${existingFileInput.length + i}`;
    const fileInput = createTag('input', {
      id: inputId,
      type: 'file',
      class: 'img-file-input',
    });
    const inputWrapper = createTag('div', { class: 'img-file-input-wrapper' });
    const inputLabel = createTag('label', { class: 'img-file-input-label' });

    const previewWrapper = createTag('div', { class: 'preview-wrapper hidden' });
    const previewImg = createTag('div', { class: 'preview-img-placeholder' });
    const previewDeleteButton = getIcon('delete');

    previewWrapper.append(previewImg, previewDeleteButton);

    inputWrapper.append(previewWrapper, inputLabel);
    inputLabel.append(fileInput, getIcon('image-add'));
    paragraphs.forEach((p) => {
      inputLabel.append(p);
    });

    col.innerHTML = '';
    col.append(inputWrapper);
  }

  function decorateVenueInfoVisible(col) {
    const fieldSet = createTag('fieldset', { class: 'checkboxes' });
    col.classList.add('venue-info-addition');
    const [inputLabel, comment] = [...col.querySelectorAll(':scope > p')];
    const cn = inputLabel.textContent.trim();

    const handle = 'venue-info-visible';
    const input = createTag('input', {
      id: `checkbox-${handle}`,
      name: `checkbox-${handle}`,
      type: 'checkbox',
      class: 'checkbox-input',
      value: handle,
    });
    const label = createTag(
      'label',
      { class: 'checkbox-label', for: `checkbox-${handle}` },
      cn,
    );
    const wrapper = createTag('div', { class: 'checkbox-wrapper' });

    wrapper.append(input, label);
    fieldSet.append(wrapper);

    const additionComment = createTag('div', { class: 'addition-comment' });
    additionComment.append(comment.textContent.trim());
    col.innerHTML = '';
    fieldSet.append(additionComment);
    col.append(fieldSet);
  }

  row.classList.add('img-upload-component');
  const [imageUploader, venueVisible] = row.querySelectorAll(':scope > div');
  decorateImageDropzones(imageUploader);
  decorateVenueInfoVisible(venueVisible);
  row.classList.add('venue-info-addition-wrapper');
}

function buildLocationInputGrid(row) {
  function buildInput(label) {
    return createTag('input', {
      type: 'text',
      id: `location-${handlize(label)}`,
      class: 'location-input',
      placeholder: label,
      required: true,
    });
  }

  const subs = row.querySelectorAll('li');
  const zipCodeWrapper = createTag('div', { class: 'location-wrapper' });

  subs.forEach((sub) => {
    zipCodeWrapper.append(buildInput(sub.textContent.trim()));
  });
  row.innerHTML = '';
  row.append(zipCodeWrapper);
  row.classList.add('venue-info-field-location');
}

export default function init(el) {
  el.classList.add('form-component');
  generateToolTip(el);

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    if (i === 1 || i === 2) decorateTextInput(r);
    if (i === 3) buildLocationInputGrid(r);
    if (i === 4) buildAdditionalInfo(r, i);
  });
}
