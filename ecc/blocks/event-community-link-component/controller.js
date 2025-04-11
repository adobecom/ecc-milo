/* eslint-disable no-unused-vars */
import { getAttribute } from '../../scripts/data-utils.js';
import { changeInputValue } from '../../scripts/utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const checkbox = component.querySelector('#checkbox-secondary-url');

  const data = {};
  const removeData = [];

  if (checkbox.checked) {
    const secondaryUrlTitle = component.querySelector('#secondary-url-title')?.value?.trim();
    data.secondaryUrlTitle = secondaryUrlTitle;

    const secondaryUrlUrl = component.querySelector('#secondary-url-url')?.value?.trim();
    data.secondaryUrlUrl = secondaryUrlUrl;
  } else {
    removeData.push({
      key: 'secondaryUrlTitle',
      path: '',
    });

    removeData.push({
      key: 'secondaryUrlUrl',
      path: '',
    });
  }

  setPropsPayload(props, data, removeData);
}

export async function onPayloadUpdate(component, props) {
  // Do nothing
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  const eventData = props.eventDataResp;
  const [
    communityTopicUrl,
    secondaryUrlTitle,
    secondaryUrlUrl,
    cloudType,
  ] = [
    getAttribute(eventData, 'communityTopicUrl', props.locale),
    getAttribute(eventData, 'secondaryUrlTitle', props.locale),
    getAttribute(eventData, 'secondaryUrlUrl', props.locale),
    getAttribute(eventData, 'cloudType', props.locale),
  ];
  component.dataset.cloudType = cloudType;
  const checkbox = component.querySelector('#checkbox-secondary-url');
  const titleInput = component.querySelector('#secondary-url-title');
  const urlInput = component.querySelector('#secondary-url-url');

  if (secondaryUrlTitle && secondaryUrlUrl) {
    changeInputValue(checkbox, 'checked', true);
    changeInputValue(titleInput, 'value', secondaryUrlTitle);
    changeInputValue(urlInput, 'value', secondaryUrlUrl);
    component.classList.add('prefilled');
  } else if (communityTopicUrl) {
    changeInputValue(checkbox, 'checked', !!communityTopicUrl);
    titleInput.required = false;
    changeInputValue(urlInput, 'value', communityTopicUrl);
    component.classList.add('prefilled');
  }

  const updateInputState = () => {
    titleInput.required = checkbox.checked;
    titleInput.disabled = !checkbox.checked;

    urlInput.required = checkbox.checked;
    urlInput.disabled = !checkbox.checked;

    if (!checkbox.checked) {
      titleInput.value = '';
      urlInput.value = '';
    }
  };

  if (checkbox && titleInput && urlInput) {
    checkbox.addEventListener('change', updateInputState);
    titleInput.addEventListener('input', updateInputState);
    urlInput.addEventListener('input', updateInputState);
  }

  updateInputState();
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
