/* eslint-disable no-unused-vars */
import buildCarousel from '../../scripts/features/carousel.js';
import initPreviewFrame, { resetPreviewFrame } from './utils.js';
import { LIBS } from '../../scripts/scripts.js';
import { setPropsPayload } from '../form-handler/data-handler.js';
import { getAttribute } from '../../scripts/data-utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const eventTemplateInput = component.querySelector('input[name="series-template-input"]');

  setPropsPayload(props, { templateId: eventTemplateInput.value });
}

export async function onPayloadUpdate(component, props) {
  // do nothing
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

async function buildPreviewListOptionsFromSource(component, source) {
  const pickerItems = component.querySelector('.picker-items');

  const jsonResp = await fetch(source).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch series templates');
    return res.json();
  });

  const options = jsonResp.data;
  if (!options) return;

  options.forEach((option) => {
    const radioLabel = createTag('label', { class: 'radio-label' }, option['template-name']);
    createTag('input', { type: 'radio', name: 'series-template', value: option['template-path'] }, '', { parent: radioLabel });

    const pickerItem = createTag('div', { class: 'picker-item' });
    const pickerItemImage = createTag('img', { src: option['template-image'] });
    pickerItem.append(pickerItemImage, radioLabel);
    pickerItems.append(pickerItem);
  });

  await buildCarousel('.picker-item', pickerItems);
}

function initPicker(component) {
  const picker = component.querySelector('.picker');
  const pickerOverlay = component.querySelector('.picker-overlay');
  const pickerBtn = component.querySelector('.picker-btn');
  const closeBtn = component.querySelector('.picker-close-btn');
  const cancelBtn = component.querySelector('.picker-cancel-btn');
  const saveBtn = component.querySelector('.picker-save-btn');
  const valueInput = component.querySelector('input.series-template-input');
  const nameInput = component.querySelector('sp-textfield.series-template-name');
  const pickerItems = component.querySelectorAll('.picker-item');
  const allRadioInputs = component.querySelectorAll('input[name="series-template"]');
  const previewFrame = component.querySelector('.picker-preview-frame');
  const previewImage = component.querySelector('.picker-preview-image');
  const pickerPreviewHeading = component.querySelector('.picker-preview-heading');

  if (
    !picker
    || !pickerOverlay
    || !pickerBtn
    || !closeBtn
    || !cancelBtn
    || !saveBtn
    || !valueInput
  ) return;

  const resetPreview = () => {
    pickerItems.forEach((item) => {
      item.setAttribute('aria-selected', 'false');
    });

    allRadioInputs.forEach((radio) => {
      radio.checked = false;
    });

    pickerOverlay.classList.add('hidden');
    saveBtn.classList.add('disabled');
    previewImage.src = '';
    previewFrame.classList.remove('has-image');
    pickerPreviewHeading.textContent = 'Preview';

    resetPreviewFrame();
  };

  pickerBtn.addEventListener('click', () => {
    pickerOverlay.classList.remove('hidden');
    if (valueInput.value) {
      const selectedRadio = component.querySelector(`input[type='radio'][value="${valueInput.value}"]`);
      if (selectedRadio) {
        selectedRadio.checked = true;
        selectedRadio.dispatchEvent(new Event('change'));
      }
    }
  });

  closeBtn.addEventListener('click', () => {
    resetPreview();
  });

  cancelBtn.addEventListener('click', () => {
    resetPreview();
  });

  saveBtn.addEventListener('click', () => {
    if (saveBtn.classList.contains('disabled')) return;
    pickerOverlay.classList.add('hidden');
    valueInput.value = component.querySelector('input[name="series-template"]:checked').value;
    nameInput.value = component.querySelector('input[name="series-template"]:checked').parentElement.textContent.trim();
    valueInput.dispatchEvent(new Event('change'));
  });

  valueInput.addEventListener('change', () => {
    picker.classList.toggle('selected', valueInput.value);
  });

  saveBtn.classList.toggle('disabled', !valueInput.value);

  initPreviewFrame(component);

  pickerItems.forEach((pickerItem) => {
    const radio = pickerItem.querySelector('input[type="radio"]');

    pickerItem.addEventListener('click', () => {
      if (radio && !radio.checked) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
      }
    });

    radio.addEventListener('change', () => {
      saveBtn.classList.toggle('disabled', !radio.checked);
      pickerItems.forEach((item) => {
        if (pickerItem !== item) item.setAttribute('aria-selected', 'false');
      });

      pickerItem.setAttribute('aria-selected', radio.checked);
      pickerPreviewHeading.textContent = `Preview ${radio.parentElement.textContent.trim()}`;
      if (previewImage) {
        previewImage.src = '';
        previewFrame.classList.remove('has-image');

        previewImage.src = pickerItem.querySelector('img')?.src;
        resetPreviewFrame();

        previewImage.addEventListener('load', () => {
          previewFrame.classList.add('has-image');
        });
      }
    });
  });
}

export default async function init(component, props) {
  const picker = component.querySelector('.picker');
  const data = props.response;

  if (!picker) return;

  await buildPreviewListOptionsFromSource(component, picker.getAttribute('data-source-link'));

  initPicker(component);

  if (data) {
    const templateId = getAttribute(data, 'templateId', props.locale);

    if (templateId) {
      const selectedRadio = component.querySelector(`input[type='radio'][value="${templateId}"]`);
      const valueInput = picker.querySelector('input.series-template-input');
      const nameInput = picker.querySelector('sp-textfield.series-template-name');

      if (selectedRadio) {
        picker.classList.add('selected');
        selectedRadio.checked = true;
        selectedRadio.dispatchEvent(new Event('change'));
        valueInput.value = templateId;
        nameInput.value = selectedRadio.parentElement?.textContent;
      }
    }
  }
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
