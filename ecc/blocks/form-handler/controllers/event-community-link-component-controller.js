/* eslint-disable no-unused-vars */
import { changeInputValue } from '../../../utils/utils.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return null;

  const checkbox = component.querySelector('#checkbox-community');

  if (checkbox.checked) {
    const communityTopicUrl = component.querySelector('#community-url-details').value;
    props.payload = { ...props.payload, communityTopicUrl };
  }

  delete props.payload.communityTopicUrl;
  return {};
}

export async function onUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  const eventData = props.eventDataResp;
  const checkbox = component.querySelector('#checkbox-community');
  const input = component.querySelector('#community-url-details');

  changeInputValue(checkbox, 'checked', !!eventData.communityTopicUrl);
  changeInputValue(input, 'value', eventData.communityTopicUrl || '');

  const updateInputState = () => {
    input.disabled = !checkbox.checked;
    input.required = checkbox.checked;
  };

  if (checkbox && input) {
    checkbox.addEventListener('change', updateInputState);
  }

  updateInputState();
}
