/* eslint-disable no-unused-vars */

import { LIBS } from '../../scripts/scripts.js';
import { getCaasTags, getMiloTagsData } from '../../scripts/esp-controller.js';
import { isEmptyObject } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

const SUPPORTED_TOPIC_TYPES = ['product', 'industry'];
const addSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18"><defs><style>.fill-shaded {fill: #464646;}</style></defs><title>S Add 18 N</title><rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" /><path class="fill-shaded" d="M14.5,8H10V3.5A.5.5,0,0,0,9.5,3h-1a.5.5,0,0,0-.5.5V8H3.5a.5.5,0,0,0-.5.5v1a.5.5,0,0,0,.5.5H8v4.5a.5.5,0,0,0,.5.5h1a.5.5,0,0,0,.5-.5V10h4.5a.5.5,0,0,0,.5-.5v-1A.5.5,0,0,0,14.5,8Z" /></svg>';
const checkSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18"><defs><style>.fill-white {fill: #ffffff;}</style></defs><title>S Checkmark 18 N</title><rect id="Canvas" fill="#ffffff" opacity="0" width="18" height="18" /><path class="fill-white" d="M15.656,3.8625l-.7275-.5665a.5.5,0,0,0-.7.0875L7.411,12.1415,4.0875,8.8355a.5.5,0,0,0-.707,0L2.718,9.5a.5.5,0,0,0,0,.707l4.463,4.45a.5.5,0,0,0,.75-.0465L15.7435,4.564A.5.5,0,0,0,15.656,3.8625Z" /></svg>';

async function buildTopicsCheckboxes(el, cloudType) {
  if (!el || !cloudType) return;

  const cw = el.querySelector('.checkbox-wrapper') || createTag('div', { class: 'checkbox-wrapper' });

  cw.innerHTML = '';
  const loadingCircle = createTag('sp-progress-circle', { size: 'l', indeterminate: true }, '', { parent: cw });
  if (cloudType === 'CreativeCloud') {
    const caasTags = await getCaasTags();

    if (!caasTags) return;
    const productTags = caasTags.namespaces.caas.tags['product-categories'].tags;
    Object.values(productTags).forEach((p) => {
      if (isEmptyObject(p.tags)) return;
      const button = createTag('sp-action-button', { name: p.title, toggles: true, 'data-value': JSON.stringify(p) }, p.title, { parent: cw });
      const checkboxIcon = createTag('sp-icon', { size: 's', slot: 'icon' }, addSvg);
      button.prepend(checkboxIcon);

      button.addEventListener('change', () => {
        checkboxIcon.innerHTML = button.selected ? checkSvg : addSvg;
      });
    });
    loadingCircle.remove();
    el.append(cw);
  }

  if (cloudType === 'DX') {
    const caasTags = await getMiloTagsData(cloudType);
    const tagType = SUPPORTED_TOPIC_TYPES.find((type) => el.classList.contains(type));

    if (!tagType) return;
    const productTags = caasTags.filter((t) => t.type === tagType);
    Object.values(productTags).forEach((topic) => {
      const { name, tags } = topic;
      if (!tags) return;
      const button = createTag('sp-action-button', { name: tags, toggles: true }, name, { parent: cw });
      const checkboxIcon = createTag('sp-icon', { size: 's', slot: 'icon' }, addSvg);
      button.prepend(checkboxIcon);

      button.addEventListener('change', () => {
        checkboxIcon.innerHTML = button.selected ? checkSvg : addSvg;
      });
    });
    loadingCircle.remove();
    el.append(cw);
  }
}

function prefillTopics(component, eventData) {
  const actionButtons = component.querySelectorAll('sp-action-button');
  const selectedButtons = [];

  if (!eventData.topics || eventData.topics.length === 0) return selectedButtons;

  actionButtons.forEach((cb) => {
    const { name } = cb;
    if (eventData.topics.includes(name)) {
      cb.selected = true;
      selectedButtons.push(name);
    }
  });

  return selectedButtons;
}

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const selectedButtons = component.querySelectorAll('sp-action-button[selected]');
  const pendingTopics = Array.from(selectedButtons).map((cb) => cb.getAttribute('name'));
  const topicType = SUPPORTED_TOPIC_TYPES.find((type) => component.classList.contains(type));

  if (pendingTopics.length === 0) return;

  const { payload } = props;
  payload.pendingTopics = { ...payload.topics, [topicType]: pendingTopics };
  props.payload = payload;
}

export async function onPayloadUpdate(component, props) {
  const { cloudType } = props.payload;

  if (cloudType && cloudType !== component.dataset.cloudType) {
    await buildTopicsCheckboxes(component, cloudType);
    component.dataset.cloudType = cloudType;
  }
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default async function init(component, props) {
  component.dataset.cloudType = props.payload.cloudType;
  const eventData = props.eventDataResp;

  await buildTopicsCheckboxes(component, component.dataset.cloudType);
  const prefilledTopics = prefillTopics(component, eventData);
  const topicType = SUPPORTED_TOPIC_TYPES.find((type) => component.classList.contains(type));

  const { payload } = props;
  payload[topicType] = payload.prefilledTopics;
  props.payload = payload;

  if (prefilledTopics.length) component.classList.add('prefilled');
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
