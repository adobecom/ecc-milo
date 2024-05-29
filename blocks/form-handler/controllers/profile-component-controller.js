export default function init(component, props) {
  const { profiles } = props.payload;
  const profileContainer = component.querySelector('profile-ui.profile-component');
  if (profiles?.length) {
    // eslint-disable-next-line prefer-destructuring
    profileContainer.profile = profiles[0];
  }
}

export function onSubmit(component, props) {
  const profilesUpdated = component.querySelectorAll('profile-ui');
  return Array.from(profilesUpdated).map((element) => element.profile);
}
