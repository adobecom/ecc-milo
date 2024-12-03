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
  const previewList = component.querySelector('.preview-list');
  const previewListItems = previewList.querySelector('.preview-list-items');

  const jsonResp = await fetch(source).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch series templates');
    return res.json();
  });

  const options = jsonResp.data;
  if (!options) return;

  options.forEach((option) => {
    const radioLabel = createTag('label', { class: 'radio-label' }, option['template-name']);
    const radio = createTag('input', { type: 'radio', name: 'series-template', value: option['template-path'] }, '', { parent: radioLabel });

    const previewListItem = createTag('div', { class: 'preview-list-item' });
    const previewListItemImage = createTag('img', { src: option['template-image'] });
    previewListItem.append(radioLabel, previewListItemImage);
    previewListItems.append(previewListItem);

    previewListItem.addEventListener('click', async () => {
      if (radio && !radio.checked) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
      }
    });

    radio.addEventListener('change', () => {
      const saveBtn = component.querySelector('.preview-list-save-btn');
      saveBtn.classList.toggle('disabled', !radio.checked);
    });
  });

  await buildCarousel('.preview-list-item', previewListItems);
}

function initInteractions(component) {
  const previewList = component.querySelector('.preview-list');
  const previewListOverlay = previewList.querySelector('.preview-list-overlay');
  const previewListBtn = component.querySelector('.preview-list-btn');
  const closeBtn = component.querySelector('.preview-list-close-btn');
  const cancelBtn = component.querySelector('.preview-list-cancel-btn');
  const saveBtn = component.querySelector('.preview-list-save-btn');
  const valueInput = component.querySelector('input.series-template-input');
  const nameInput = component.querySelector('sp-textfield.series-template-name');

  if (
    !previewList
    || !previewListOverlay
    || !previewListBtn
    || !closeBtn
    || !cancelBtn
    || !saveBtn
    || !valueInput
  ) return;

  const resetPreviewList = () => {
    previewList.querySelector('input[name="series-template"]:checked')?.removeAttribute('checked');
    previewListOverlay.classList.add('hidden');
    saveBtn.classList.add('disabled');
  };

  previewListBtn.addEventListener('click', () => {
    previewListOverlay.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => {
    resetPreviewList();
  });

  cancelBtn.addEventListener('click', () => {
    resetPreviewList();
  });

  saveBtn.addEventListener('click', () => {
    if (saveBtn.classList.contains('disabled')) return;
    previewListOverlay.classList.add('hidden');
    valueInput.value = previewList.querySelector('input[name="series-template"]:checked').value;
    nameInput.value = previewList.querySelector('input[name="series-template"]:checked').parentElement.textContent.trim();
    valueInput.dispatchEvent(new Event('change'));
  });

  valueInput.addEventListener('change', () => {
    previewList.classList.toggle('selected', valueInput.value);
  });

  saveBtn.classList.toggle('disabled', !valueInput.value);

  previewListOverlay.addEventListener('click', (e) => {
    if (e.target === previewListOverlay) {
      previewListOverlay.classList.add('hidden');
    }
  });
}

export default async function init(component, props) {
  const previewList = component.querySelector('.preview-list');
  if (!previewList) return;

  buildPreviewListOptionsFromSource(component, previewList.getAttribute('data-source-link'));

  initInteractions(component);
}

export function onEventUpdate(component, props) {
  // Do nothing
}
