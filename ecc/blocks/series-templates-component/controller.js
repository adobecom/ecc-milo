/* eslint-disable no-unused-vars */
import buildCarousel from '../../scripts/features/carousel.js';
import { LIBS } from '../../scripts/scripts.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;
}

export async function onPayloadUpdate(component, props) {
  // do nothing
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

async function buildPreviewListOptionsFromSource(component, source) {
  const previewList = component.querySelector('.preview-list');
  const valueHolder = createTag('input', { type: 'hidden', name: 'series-template-input', value: '' }, '', { parent: previewList });
  const previewListItems = previewList.querySelector('.preview-list-items');
  const previewListOverlay = previewList.querySelector('.preview-list-overlay');

  const jsonResp = await fetch(source).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch series templates');
    return res.json();
  });

  const options = jsonResp.data;
  if (!options) return;

  if (options.length > 3) {
    previewListItems.classList.add('show-3');
  } else {
    previewListItems.classList.remove('show-3');
  }

  options.forEach((option) => {
    const radioLabel = createTag('label', { class: 'radio-label' }, option['template-name']);
    createTag('input', { type: 'radio', name: 'series-template', value: option['template-path'] }, '', { parent: radioLabel });

    const previewListItem = createTag('div', { class: 'preview-list-item' });
    const previewListItemImage = createTag('img', { src: option['template-image'] });
    previewListItem.append(radioLabel, previewListItemImage);
    previewListItems.append(previewListItem);
  });

  await buildCarousel('.preview-list-item', previewListItems);
}

export default async function init(component, props) {
  const previewList = component.querySelector('.preview-list');
  if (!previewList) return;

  const templateSelectBtn = component.querySelector('.preview-list-btn');
  const closeBtn = component.querySelector('.preview-list-close-btn');

  buildPreviewListOptionsFromSource(component, previewList.getAttribute('data-source-link'));

  if (templateSelectBtn) {
    templateSelectBtn.addEventListener('click', async () => {
      const previewListOverlay = previewList.querySelector('.preview-list-overlay');

      if (previewListOverlay.classList.contains('hidden')) {
        previewListOverlay.classList.remove('hidden');
      } else {
        previewListOverlay.classList.add('hidden');
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const previewListOverlay = previewList.querySelector('.preview-list-overlay');
      previewListOverlay.classList.add('hidden');
    });
  }
}

export function onEventUpdate(component, props) {
  // Do nothing
}
