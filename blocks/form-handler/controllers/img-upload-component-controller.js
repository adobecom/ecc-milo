import makeFileInputDropZone from './share-controller.js';
import { querySelectorAllDeep } from '../form-handler.js';

export default function init(component) {
  const imgFileInputWrapper = querySelectorAllDeep('.img-file-input-wrapper', component);

  imgFileInputWrapper.forEach((wrapper) => {
    makeFileInputDropZone(wrapper);
  });
}

export function onResume() {
  // TODO: handle form prepopulation on component level
}

export function onSubmit(component, inputMap) {
  console.log(inputMap);
  return {};
}
