export default function init(component, props) {

}


export function onSubmit(component, props) {
  const profilesUpdated = component.querySelectorAll('profile-ui');
  return Array.from(profilesUpdated).map((element) => element.profile);
}
