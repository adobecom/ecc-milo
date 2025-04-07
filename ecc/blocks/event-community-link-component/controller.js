/* eslint-disable no-unused-vars */
import { changeInputValue } from '../../scripts/utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const checkbox = component.querySelector('#checkbox-community');

  const data = {};
  const removeData = [];

  if (checkbox.checked) {
    const communityTopicUrl = component.querySelector('#community-url-details')?.value?.trim();
    data.communityTopicUrl = communityTopicUrl;
  } else {
    removeData.push({
      key: 'communityTopicUrl',
      path: '',
    });
  }

  setPropsPayload(props, data, removeData);
}

export async function onPayloadUpdate(component, props) {
  const { cloudType } = props.payload;

  if (cloudType && cloudType !== component.dataset.cloudType) {
    component.classList.toggle('hidden', cloudType !== 'CreativeCloud');
    component.dataset.cloudType = cloudType;
  }
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  const eventData = props.eventDataResp;
  const localeEventData = eventData.localizations?.[props.locale] || eventData;

  component.dataset.cloudType = props.payload.cloudType || localeEventData.cloudType;
  const checkbox = component.querySelector('#checkbox-community');
  const input = component.querySelector('#community-url-details');

  if (localeEventData.communityTopicUrl) {
    changeInputValue(checkbox, 'checked', !!localeEventData.communityTopicUrl);
    changeInputValue(input, 'value', localeEventData.communityTopicUrl || '');
    component.classList.add('prefilled');
  }

  const updateInputState = () => {
    input.required = checkbox.checked;
    if (!checkbox.checked) input.value = '';
    input.disabled = !checkbox.checked;
  };

  if (checkbox && input) {
    checkbox.addEventListener('change', updateInputState);
  }

  updateInputState();
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
