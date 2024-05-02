import makeFileInputDropZone from './share-controller.js';

export default function init(component) {
  const imgFileInputWrapper = component.querySelectorAll('.img-file-input-wrapper');

  imgFileInputWrapper.forEach((wrapper) => {
    makeFileInputDropZone(wrapper);
  });
}

export function onSubmit(component, inputMap) {
  console.log(inputMap);
  return {};
}
