export default function init(component, props) {
  const { profiles } = props.payload;
  const profileContainer = component.querySelector('profile-container');
  if (!profiles || !profileContainer) return;
  profileContainer.profiles = profiles;
  profileContainer.requestUpdate();
}

export function onSubmit(component, props) {
  const profileContainer = component.querySelector('profile-container');
  return profileContainer.getProfiles();
}
