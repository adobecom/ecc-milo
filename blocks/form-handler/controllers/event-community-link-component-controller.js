import { changeInputValue } from '../../../utils/utils.js';

export function onSubmit(component, props) {
  // TODO: community URL
  const checkbox = component.querySelector('#checkbox-community');

  if (checkbox.checked) {
    const communityTopicUrl = component.querySelector('#community-url-details').value;
    props.payload = { ...props.payload, communityTopicUrl };
    return communityTopicUrl;
  }

  return {};
}

export default function init(component, props) {
  if (component.closest('.fregment')?.classList.contains('hidden')) return;

  const checkbox = component.querySelector('#checkbox-community');
  const input = component.querySelector('#community-url-details');

  changeInputValue(checkbox, 'checked', !!props.payload.communityTopicUrl);
  changeInputValue(input, 'value', props.payload.communityTopicUrl || '');

  const updateInputState = () => {
    input.disabled = !checkbox.checked;
    input.required = checkbox.checked;
  };

  if (checkbox && input) {
    checkbox.addEventListener('change', updateInputState);
  }

  updateInputState();
}
