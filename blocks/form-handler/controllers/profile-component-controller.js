import makeFileInputDropZone from './share-controller.js';
import { querySelectorAllDeep } from '../../../utils/utils.js';

export default function init(component, props) {
  // TODO: init function and repopulate data from props if exists
  const imgFileInputWrapper = querySelectorAllDeep('.img-file-input-wrapper', component);

  imgFileInputWrapper.forEach((wrapper) => {
    makeFileInputDropZone(wrapper);
  });
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
