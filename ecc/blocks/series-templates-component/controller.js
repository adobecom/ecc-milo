/* eslint-disable no-unused-vars */
import buildCarousel from '../../scripts/features/carousel.js';
import { LIBS } from '../../scripts/scripts.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const eventTemplateInput = component.querySelector('input[name="series-template-input"]');
  const emailTemplateInput = component.querySelector('sp-textfield[name="series-email-template"]');

  props.payload = {
    ...props.payload,
    eventTemplate: eventTemplateInput.value,
    emailTemplate: emailTemplateInput.value,
  };
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

function resizeImage(image, newScale) {
  const scale = newScale;

  image.style.transform = `scale(${scale})`;
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
  const previewImage = component.querySelector('.picker-preview-image');
  const zoomInBtn = component.querySelector('.picker-zoom-in-btn');
  const zoomOutBtn = component.querySelector('.picker-zoom-out-btn');

  if (
    !picker
    || !pickerOverlay
    || !pickerBtn
    || !closeBtn
    || !cancelBtn
    || !saveBtn
    || !valueInput
  ) return;

  const resetPreviewList = () => {
    pickerItems.forEach((item) => {
      item.setAttribute('aria-selected', 'false');
    });

    allRadioInputs.forEach((radio) => {
      radio.checked = false;
    });

    pickerOverlay.classList.add('hidden');
    saveBtn.classList.add('disabled');
    previewImage.src = '';
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
    resetPreviewList();
  });

  cancelBtn.addEventListener('click', () => {
    resetPreviewList();
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

  pickerOverlay.addEventListener('click', (e) => {
    if (e.target === pickerOverlay) {
      resetPreviewList();
    }
  });

  zoomInBtn.addEventListener('click', () => {
    if (!previewImage.src) return;

    const scale = previewImage.style.transform?.match(/scale\((\d+(\.\d+)?)\)/)?.[1] || 1;

    const newScale = parseFloat(scale) + 0.25;

    resizeImage(previewImage, newScale);

    if (parseFloat(newScale) > 0.5) zoomOutBtn.disabled = false;
  });

  zoomOutBtn.addEventListener('click', () => {
    if (!previewImage.src) return;

    const scale = previewImage.style.transform?.match(/scale\((\d+(\.\d+)?)\)/)?.[1] || 1;

    const newScale = parseFloat(scale) - 0.25;

    resizeImage(previewImage, newScale);

    if (parseFloat(newScale) <= 0.5) zoomOutBtn.disabled = true;
  });

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

      if (previewImage) {
        previewImage.src = pickerItem.querySelector('img')?.src;
        previewImage.style.transform = 'scale(1)';
      }
    });
  });
}

export default async function init(component, props) {
  const picker = component.querySelector('.picker');
  if (!picker) return;

  await buildPreviewListOptionsFromSource(component, picker.getAttribute('data-source-link'));

  initPicker(component);
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
