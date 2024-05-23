export function onSubmit(component, props) {
  // TODO: community URL
  const time = component.querySelector('#community-url-details').value;
  const discussionLinkCheckbox = component.querySelector('#checkbox-community').checked;

  const eventInfo = {
    discussionLinkCheckbox,
    Time: time,
  };

  return eventInfo;
}

export default function init(component, props) {
  // TODO: init function and repopulate data from props if exists
}
