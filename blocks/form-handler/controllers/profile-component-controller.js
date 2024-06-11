export function onSubmit(component, props) {
  const profileContainer = component.querySelector('profile-container');
  if (profileContainer) {
    props.payload = { ...props.payload, ...profileContainer.getProfiles() };
  }
}

export default function init(component, props) {
  const { profiles } = props.payload;
  const profileContainer = component.querySelector('profile-container');
  if (!profiles || !profileContainer) return;
  profileContainer.profiles = profiles;
  profileContainer.requestUpdate();
}
