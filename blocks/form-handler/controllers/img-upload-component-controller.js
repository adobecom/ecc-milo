import makeFileInputDropZone from './share-controller.js';

export default function init(component) {
  const imgFileInputWrapper = component.querySelectorAll('.img-file-input-wrapper');

  imgFileInputWrapper.forEach((wrapper) => {
    makeFileInputDropZone(wrapper);
  });
}

export function onResume(component, eventObj) {
  // TODO: handle form prepopulation on component level
}

export function onSubmit(component, props) {
  return {};
}
