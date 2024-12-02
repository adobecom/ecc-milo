/* eslint-disable no-unused-vars */
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

async function buildPreviewListOptionsFromSource(previewList, source, attr) {
  const valueHolder = previewList.closest('.series-info-wrapper').querySelector(`.${attr.handle}-input`);
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
    const previewListItem = createTag('div', { class: 'preview-list-item' });
    const previewListItemImage = createTag('img', { src: option['template-image'] });
    const previewListItemTitle = createTag('h5', {}, option['template-name']);
    const selectItemBtn = createTag('a', { class: 'con-button blue select-item-btn' }, 'Select', { parent: previewListItem });
    previewListItem.append(previewListItemImage, previewListItemTitle, selectItemBtn);
    previewListItems.append(previewListItem);

    selectItemBtn.addEventListener('click', () => {
      valueHolder.value = option['template-path'];
      previewListOverlay.classList.add('hidden');
    });
  });
}

function buildPreviewList(attrObj) {
  const { optionsSource } = attrObj;

  const previewList = createTag('div', { class: 'preview-list' });
  const previewListTitle = createTag('h4', {}, 'Select a template');
  const previewListItems = createTag('div', { class: 'preview-list-items' });
  const previewListBtn = createTag('a', { class: 'con-button preview-list-btn' }, 'Select');
  const previewListOverlay = createTag('div', { class: 'preview-list-overlay hidden' });
  const previewListModal = createTag('div', { class: 'preview-list-modal' }, '', { parent: previewListOverlay });
  const previewListCloseBtn = createTag('a', { class: 'preview-list-close-btn' }, '✕', { parent: previewListModal });

  previewListBtn.addEventListener('click', () => {
    previewListOverlay.classList.remove('hidden');
    buildPreviewListOptionsFromSource(previewList, optionsSource, attrObj);
  });

  previewListCloseBtn.addEventListener('click', () => {
    previewListOverlay.classList.add('hidden');
  });

  previewListModal.append(previewListTitle, previewListItems);
  previewList.append(previewListBtn, previewListOverlay);
  return previewList;
}


export default async function init(component, props) {

}

export function onEventUpdate(component, props) {
  // Do nothing
}
