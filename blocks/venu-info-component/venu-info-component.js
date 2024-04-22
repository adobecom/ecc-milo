import { getLibs } from '../../scripts/utils.js';
import { getIcon, standardizeFormComponentHeading } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function handlize(str) {
  return str.toLowerCase().trim().replaceAll(' ', '-');
}

function decorateTimezone(row) {
  const cols = row.querySelectorAll(':scope > div');
  const timezonePickerWrapper = createTag('div', {
    class: 'timezone-picker-wrapper',
  });
  let pickerName;
  let isRequired;
  let labelWrapper = createTag('div', { class: 'timezone-label-wrapper' });
  cols.forEach((col, i) => {
    if (i === 0) {
      pickerName = col.textContent.trim();
      isRequired = pickerName.endsWith('*');
      const label = createTag(
        'label',
        {
          for: `timezone-picker-${handlize(pickerName)}`,
        },
        pickerName
      );
      labelWrapper.append(label);
      if (isRequired) {
        labelWrapper.append(
          createTag('span', { class: 'attrib' }, 'Required *')
        );
      }

      timezonePickerWrapper.append(labelWrapper);
    } else if (i === 1) {
      const timeSlots = col.querySelectorAll('li');
      console.log(pickerName, handlize(pickerName));
      const select = createTag('select', {
        id: `timezone-picker-${handlize(pickerName)}`,
        class: `select-input`,
      });
      timeSlots.forEach((t) => {
        const text = t.textContent.trim();
        const option = createTag('option', { value: handlize(text) }, text);
        select.append(option);
      });

      timezonePickerWrapper.append(select);
    }
  });

  row.innerHTML = '';
  row.append(timezonePickerWrapper);
}

function decorateTextInput(row) {
  const cols = row.querySelectorAll(':scope > div');
  const inputWrapper = createTag('div', { class: 'input-wrapper' });
  const attribWrapper = createTag('div', { class: 'attrib-wrapper' });
  let pickerName;
  let params = { type: 'text' };
  cols.forEach((c, j) => {
    if (j === 0) {
      pickerName = c.textContent.trim();
      const isRequired = pickerName.endsWith('*');
      params.required = isRequired;
      params.id = `venu-info-field-${handlize(pickerName)}`;
    } else if (j === 1) {
      const attribs = c.textContent.split(',').map((s) => s.trim());
      attribs.forEach((attrib) => {
        const [key, value] = attrib.split('=');
        params[key.toLowerCase()] = value;
      });
    }
  });

  params.placeholder = pickerName;

  const inputElem = createTag('input', params);
  inputWrapper.append(inputElem);

  const content = [];
  const attribs = ['maxlength', 'required'];
  attribs.forEach((key) => {
    const lowerCase = key.toLowerCase();
    const value = params[key];
    if (lowerCase === 'maxlength') {
      content.push(`${value} charaters max`);
    } else if (lowerCase === 'required') {
      if (value !== 'false') {
        content.push('*');
      }
    }
  });
  attribWrapper.append(createTag('div', {}, content.join(' ')));

  row.innerHTML = '';
  row.classList.add(`venu-info-textinput-wrapper`);
  row.append(inputWrapper);
  row.append(attribWrapper);
}

function buildAdditionalInfo(row) {
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
    const inputWrapper = createTag('div', {
      class: 'img-file-input-wrapper',
    });
    const inputLabel = createTag('label', { class: 'img-file-input-label' });

    const previewWrapper = createTag('div', {
      class: 'preview-wrapper hidden',
    });
    const previewImg = createTag('div', { class: 'preview-img-placeholder' });
    const previewDeleteButton = getIcon('delete--smoke');

    previewWrapper.append(previewImg, previewDeleteButton);

    inputWrapper.append(previewWrapper, inputLabel);
    inputLabel.append(fileInput, getIcon('image-add--smoke'));
    paragraphs.forEach((p) => {
      inputLabel.append(p);
    });

    col.innerHTML = '';
    col.append(inputWrapper);
  }

  function decorateVenuInfoVisible(col) {
    const fieldSet = createTag('fieldset', { class: 'checkboxes' });
    col.classList.add('venu-info-addition');
    const [inputLabel, comment] = [...col.querySelectorAll(':scope > p')];
    const cn = inputLabel.textContent.trim();

    const handle = 'venu-info-visible';
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
      cn
    );
    const wrapper = createTag('div', { class: 'checkbox-wrapper' });

    wrapper.append(input, label);
    fieldSet.append(wrapper);

    const additionComment = createTag('div', { class: 'addition-comment' });
    additionComment.append(comment.textContent.trim());
    col.innerHTML = '';
    col.append(fieldSet);
    col.append(additionComment);
  }

  row.classList.add('img-upload-component');
  const [image_uploader, venu_visible] = row.querySelectorAll(':scope > div');
  decorateImageDropzones(image_uploader);
  decorateVenuInfoVisible(venu_visible);
  row.classList.add('venu-info-addition-wrapper');
}

function buildLocationSelector(row) {
  function buildInput(label) {
    return createTag('input', {
      type: 'text',
      id: `zipcode-${handlize(label)}`,
      class: 'zipcode-input',
      placeholder: label,
    });
  }
  const list = row.querySelector(':scope ul');
  const subs = list.querySelectorAll(':scope > li');
  const zipCodeWrapper = createTag('div', { class: 'zipcode-wrapper' });

  subs.forEach((sub) => {
    zipCodeWrapper.append(buildInput(sub.textContent.trim()));
  });
  row.innerHTML = '';
  row.append(zipCodeWrapper);
  row.classList.add('venu-info-field-zipcode');
}

export default function init(el) {
  el.classList.add('form-component');
  standardizeFormComponentHeading(el);

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    if (i === 1) decorateTimezone(r);
    else if (i === 2 || i === 3) decorateTextInput(r);
    else if (i === 4) buildLocationSelector(r);
    else if (i === 5) buildAdditionalInfo(r);
  });
}
