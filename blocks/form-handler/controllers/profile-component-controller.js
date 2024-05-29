export default function init(component, props) {
  const { profiles } = props.payload;
  const profileContainer = component.querySelector('profile-container');
  if (!profiles || !profileContainer) return;
  profileContainer.profiles = profiles;
  profileContainer.requestUpdate();
}

export function onSubmit(component, props) {
  const profilesUpdated = component.querySelectorAll('profile-ui');
  return Array.from(profilesUpdated).map((element) => element.profile);
}
