import { changeInputValue } from '../../../utils/utils.js';
import getJoinedOutput from '../data-handler.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return null;

  const checkbox = component.querySelector('#checkbox-community');

  if (checkbox.checked) {
    const communityTopicUrl = component.querySelector('#community-url-details').value;
    props.payload = { ...props.payload, communityTopicUrl };
    return communityTopicUrl;
  }

  return {};
}

export default function init(component, props) {
  const eventData = getJoinedOutput(props.payload, props.response);
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
