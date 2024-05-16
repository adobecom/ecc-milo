import { querySelectorAllDeep } from '../form-handler.js';
import makeFileInputDropZone, { getMappedInputsOutput } from './share-controller.js';

function initVenueImageInput(component) {
  const wrappers = querySelectorAllDeep('.img-file-input-wrapper', component);
  wrappers.forEach((wrapper) => {
    makeFileInputDropZone(wrapper);
  });
}

export default function init(component) {
  initVenueImageInput(component);
}

export function onResume() {
  // TODO: handle form prepopulation on component level
}

export function onSubmit(component, inputMap) {
  const venueInfoVisible = component.querySelector('#checkbox-venue-info-visible').checked;

  const imageFile = component.querySelector('#venue-image').shadowRoot?.querySelector('input').files[0];
  const imageData = imageFile ? `File name: ${imageFile.name}, Size: ${imageFile.size} bytes` : 'No file uploaded';

  const venueData = {
    ...getMappedInputsOutput(component, inputMap),
    venueInfoVisible,
    imageData,
  };

  return venueData;
}
