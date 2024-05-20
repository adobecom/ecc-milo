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
  const name = component.querySelector('#info-field-name').value;
  const title = component.querySelector('#info-field-add-title').value;
  const bio = component.querySelector('#info-field-add-bio').value;
  return {
    name,
    title,
    bio,
  };
};

export function onSubmit(component, inputMap) {
  return mapProfileToJson(component);
}
