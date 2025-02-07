/* eslint-disable no-unused-vars */
import { changeInputValue } from '../../scripts/utils.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const checkbox = component.querySelector('#checkbox-community');

  if (checkbox.checked) {
    const communityTopicUrl = component.querySelector('#community-url-details')?.value?.trim();
    props.payload = { ...props.payload, communityTopicUrl };
  } else {
    const tempPayload = { ...props.payload };
    delete tempPayload.communityTopicUrl;
    props.payload = tempPayload;
  }
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

  component.dataset.cloudType = props.payload.cloudType || eventData.cloudType;
  const checkbox = component.querySelector('#checkbox-community');
  const input = component.querySelector('#community-url-details');

  if (eventData.communityTopicUrl) {
    changeInputValue(checkbox, 'checked', !!eventData.communityTopicUrl);
    changeInputValue(input, 'value', eventData.communityTopicUrl || '');
    component.classList.add('prefilled');
  }

  const updateInputState = () => {
    input.required = checkbox.checked;
    if (!checkbox.checked) input.value = '';
  };

  if (checkbox && input) {
    checkbox.addEventListener('change', updateInputState);
  }

  updateInputState();
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
