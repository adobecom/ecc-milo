import makeFileInputDropZone, { getMappedInputsOutput } from './share-controller.js';

function initVenueImageInput(component) {
  const wrapper = component.querySelector('.img-file-input-wrapper');
  makeFileInputDropZone(wrapper);
}

export default function init(component) {
  initVenueImageInput(component);
}

export function onSubmit(component, inputMap) {
  const venueInfoVisible = component.querySelector('#checkbox-venue-info-visible').checked;

  const imageFile = component.querySelector('#venue-image').files[0];
  const imageData = imageFile ? `File name: ${imageFile.name}, Size: ${imageFile.size} bytes` : 'No file uploaded';

  const venueData = {
    ...getMappedInputsOutput(component, inputMap),
    venueInfoVisible,
    imageData,
  };

  return venueData;
}
