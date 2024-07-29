/* eslint-disable no-unused-vars */
import { changeInputValue } from '../../../scripts/utils.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const checkbox = component.querySelector('#checkbox-community');

  if (checkbox.checked) {
    const communityTopicUrl = component.querySelector('#community-url-details').value;
    props.payload = { ...props.payload, communityTopicUrl };
  }
}

export async function onUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  const eventData = props.eventDataResp;
  const checkbox = component.querySelector('#checkbox-community');
  const input = component.querySelector('#community-url-details');

  if (eventData.communityTopicUrl) {
    changeInputValue(checkbox, 'checked', !!eventData.communityTopicUrl);
    changeInputValue(input, 'value', eventData.communityTopicUrl || '');
    component.classList.add('prefilled');
  }

  const updateInputState = () => {
    input.disabled = !checkbox.checked;
    input.required = checkbox.checked;
  };

  if (checkbox && input) {
    checkbox.addEventListener('change', updateInputState);
  }

  updateInputState();
}
