import getJoinedOutput from '../data-handler.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const profileContainer = component.querySelector('profile-container');
  if (profileContainer) {
    props.payload = { ...props.payload, speakers: profileContainer.getProfiles() };
  }
}

export default function init(component, props) {
  const eventData = getJoinedOutput(props.payload, props.response);
  const { speakers } = eventData;
  const profileContainer = component.querySelector('profile-container');
  if (!speakers || !profileContainer) return;
  profileContainer.profiles = speakers;
  profileContainer.requestUpdate();
}
