import makeFileInputDropZone from './share-controller.js';
import { querySelectorAllDeep } from '../../../utils/utils.js';

export default function init(component) {
  const imgFileInputWrapper = querySelectorAllDeep('.img-file-input-wrapper', component);

  imgFileInputWrapper.forEach((wrapper) => {
    makeFileInputDropZone(wrapper);
  });
}

export function onResume() {
  // TODO: handle form prepopulation on component level
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

export function onSubmit(component, inputMap) {
  return mapProfileToJson(component);
}
