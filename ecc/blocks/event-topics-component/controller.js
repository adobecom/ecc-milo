/* eslint-disable no-unused-vars */

import { LIBS } from '../../scripts/scripts.js';
import { getCloud } from '../../scripts/esp-controller.js';
import { deepGetTagByTagID, getCaasTags } from '../../scripts/caas.js';

const SUPPORTED_TOPIC_TYPES = ['product', 'industry'];
const addSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18"><defs><style>.fill-shaded {fill: #464646;}</style></defs><title>S Add 18 N</title><rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" /><path class="fill-shaded" d="M14.5,8H10V3.5A.5.5,0,0,0,9.5,3h-1a.5.5,0,0,0-.5.5V8H3.5a.5.5,0,0,0-.5.5v1a.5.5,0,0,0,.5.5H8v4.5a.5.5,0,0,0,.5.5h1a.5.5,0,0,0,.5-.5V10h4.5a.5.5,0,0,0,.5-.5v-1A.5.5,0,0,0,14.5,8Z" /></svg>';
const checkSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18"><defs><style>.fill-white {fill: #ffffff;}</style></defs><title>S Checkmark 18 N</title><rect id="Canvas" fill="#ffffff" opacity="0" width="18" height="18" /><path class="fill-white" d="M15.656,3.8625l-.7275-.5665a.5.5,0,0,0-.7.0875L7.411,12.1415,4.0875,8.8355a.5.5,0,0,0-.707,0L2.718,9.5a.5.5,0,0,0,0,.707l4.463,4.45a.5.5,0,0,0,.75-.0465L15.7435,4.564A.5.5,0,0,0,15.656,3.8625Z" /></svg>';

function getFullParentName(tagId, caasTags) {
  const targetTag = deepGetTagByTagID(tagId, caasTags);

  if (!targetTag) return '';

  const parentIds = [];

  const tagIds = targetTag.tagID.split('/');
  while (tagIds.length > 1) {
    tagIds.pop();
    parentIds.push(tagIds.join('/'));
  }

  const parentNames = parentIds.map((id) => deepGetTagByTagID(id, caasTags).title).reverse().join(' ');
  return parentNames || 'Base Tags';
}

async function buildTopicsCheckboxes(el, cloudType) {
  const [{ createTag }, cassTags] = await Promise.all([
    import(`${LIBS}/utils/utils.js`),
    getCaasTags(),
  ]);

  if (!el || !cloudType) return;

  const cw = el.querySelector('.checkbox-wrapper') || createTag('div', { class: 'checkbox-wrapper' }, '', { parent: el });

  cw.innerHTML = '';
  const loadingCircle = createTag('sp-progress-circle', { size: 'l', indeterminate: true }, '', { parent: cw });
  const currentCloudData = await getCloud(cloudType);

  if (!currentCloudData || currentCloudData.error) return;

  const { cloudTags } = currentCloudData;

  if (cloudTags) {
    const pathNameMap = new Map();

    cloudTags.forEach((tag) => {
      const { name, caasId } = tag;

      if (!caasId || !name) return;

      const path = caasId.split('/');
      const pathNameKey = path.length > 1 ? path.slice(0, -1).join('-').replace('caas:', '') : 'base-tags';

      const button = createTag('sp-action-button', { name, toggles: true, 'data-value': JSON.stringify(tag) }, name);
      const checkboxIcon = createTag('sp-icon', { size: 's', slot: 'icon' }, addSvg);

      const parentName = getFullParentName(caasId, cassTags.namespaces.caas);
      button.prepend(checkboxIcon);

      button.addEventListener('change', () => {
        checkboxIcon.innerHTML = button.selected ? checkSvg : addSvg;
      });

      if (pathNameMap.has(pathNameKey)) {
        pathNameMap.set(pathNameKey, [...pathNameMap.get(pathNameKey), tag]);

        const groupWrapper = cw.querySelector(`.tags-group[data-name="${pathNameKey}"] .tags-group-wrapper`);
        if (!groupWrapper) return;

        groupWrapper.append(button);
      } else {
        pathNameMap.set(pathNameKey, [name]);

        const tagsGroup = createTag('div', { class: 'tags-group', 'data-name': pathNameKey }, '', { parent: cw });
        createTag('h3', { class: 'tags-group-heading' }, parentName, { parent: tagsGroup });
        const groupWrapper = createTag('div', { class: 'tags-group-wrapper' }, '', { parent: tagsGroup });
        groupWrapper.append(button);
      }
    });
  } else {
    createTag('sp-label', { size: 'm' }, 'No tags found for this Cloud', { parent: cw });
  }

  loadingCircle.remove();
}

function prefillTopics(component, eventData) {
  const actionButtons = component.querySelectorAll('sp-action-button');
  const selectedButtons = [];

  if (!eventData.topics || eventData.topics.length === 0) return selectedButtons;

  actionButtons.forEach((cb) => {
    const name = cb.getAttribute('name');
    if (eventData.topics.includes(name)) {
      cb.selected = true;
      cb.dispatchEvent(new Event('change'));
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
  const tags = Array.from(selectedButtons).map((cb) => JSON.parse(cb.getAttribute('data-value')));

  const { payload } = props;
  payload.pendingTopics = { ...payload.topics, [topicType]: pendingTopics };
  const existingTags = payload.tags ? payload.tags.split(',') : [];
  const tagsToSubmit = [...new Set([...existingTags, ...tags.map((tag) => tag.caasId)])].join(',');
  if (tagsToSubmit) payload.tags = tagsToSubmit;
  props.payload = payload;
}

export async function onPayloadUpdate(component, props) {
  const { cloudType } = props.payload;
  const eventData = props.eventDataResp;

  if (cloudType && cloudType !== component.dataset.cloudType) {
    await buildTopicsCheckboxes(component, cloudType);

    const prefilledTopics = prefillTopics(component, eventData);
    const topicType = SUPPORTED_TOPIC_TYPES.find((type) => component.classList.contains(type));

    const { payload } = props;
    payload[topicType] = payload.prefilledTopics;
    props.payload = payload;

    if (prefilledTopics.length) component.classList.add('prefilled');
    component.dataset.cloudType = cloudType;
  }
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default async function init(component, props) {
  component.dataset.cloudType = props.payload.cloudType;
  const eventData = props.eventDataResp;

  if (props.payload.cloudType) {
    await buildTopicsCheckboxes(component, props.payload.cloudType);
    const prefilledTopics = prefillTopics(component, eventData);
    const topicType = SUPPORTED_TOPIC_TYPES.find((type) => component.classList.contains(type));

    const { payload } = props;
    payload[topicType] = payload.prefilledTopics;
    props.payload = payload;

    if (prefilledTopics.length) component.classList.add('prefilled');
  }
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
