export default function init(component, props) {

}

const mapProfileToJson = (component) => {
  const name = component.querySelector('#profile-field-name').value;
  const title = component.querySelector('#profile-field-title').value;
  const bio = component.querySelector('#profile-field-bio').value;
  return {
    name,
    title,
    bio,
  };
};

export function onSubmit(component, props) {
  return mapProfileToJson(component);
}
