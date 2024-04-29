import makeFileInputDropZone, { getMappedInputsOutput } from './share-controller.js';

function initVenueImageInput(component) {
  const wrapper = component.querySelector('.img-file-input-wrapper');
  makeFileInputDropZone(wrapper);
}

export default function init(component) {
  initVenueImageInput(component);
}

export function onSubmit(component, inputMap) {
  const venueName = component.querySelector('#venue-field-venue-name').value;
  const venueAddress = component.querySelector('#venue-field-venue-name').value;
  const city = component.querySelector('#zipcode-city').value;
  const state = component.querySelector('#zipcode-state').value;
  const zipCode = component.querySelector('#zipcode-zip-code').value;
  const country = component.querySelector('#zipcode-country').value;

  const venueInfoVisible = component.querySelector('#checkbox-venue-info-visible').checked;

  const imageFile = component.querySelector('#venue-image').files[0];
  const imageData = imageFile ? `File name: ${imageFile.name}, Size: ${imageFile.size} bytes` : 'No file uploaded';

  const venueData = {
    ...getMappedInputsOutput(component, inputMap),
    'event-venue': venueName,
    'event-address': venueAddress,
    city,
    state,
    zipCode,
    country,
    venueInfoVisible,
    imageData,
  };

  return venueData;
}
