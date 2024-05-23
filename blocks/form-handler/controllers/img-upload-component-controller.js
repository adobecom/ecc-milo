import makeFileInputDropZone from './share-controller.js';
import { querySelectorAllDeep } from '../../../utils/utils.js';

export default function init(component, props) {
  // TODO: init function and repopulate data from props if exists
  const imgFileInputWrapper = querySelectorAllDeep('.img-file-input-wrapper', component);

  imgFileInputWrapper.forEach((wrapper) => {
    makeFileInputDropZone(wrapper);
  });
}

export function onSubmit(component, props) {
  return {};
}
