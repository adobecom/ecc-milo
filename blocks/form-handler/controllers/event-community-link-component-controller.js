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
  // TODO: init function and repopulate data from props if exists
  const checkbox = component.querySelector('#checkbox-community');
  const input = component.querySelector('#community-url-details');

  const updateInputState = () => {
    input.disabled = !checkbox.checked;
    input.required = checkbox.checked;
  };

  if (checkbox && input) {
    checkbox.addEventListener('change', updateInputState);
  }

  updateInputState();
}
