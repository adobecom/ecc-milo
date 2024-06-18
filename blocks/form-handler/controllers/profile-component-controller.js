export function onSubmit(component, props) {
  if (component.closest('.fregment')?.classList.contains('hidden')) return;

  const profileContainer = component.querySelector('profile-container');
  if (profileContainer) {
    props.payload = { ...props.payload, speakers: profileContainer.getProfiles() };
  }
}

export default function init(component, props) {
  const { profiles } = props.payload;
  const profileContainer = component.querySelector('profile-container');
  if (!profiles || !profileContainer) return;
  profileContainer.profiles = profiles;
  profileContainer.requestUpdate();
}
