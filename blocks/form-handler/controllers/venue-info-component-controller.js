import makeFileInputDropZone, { getMappedInputsOutput } from './share-controller.js';

function initVenueImageInput(component) {
  const wrapper = component.querySelector('.img-file-input-wrapper');
  makeFileInputDropZone(wrapper);
}

function loadGoogleMapsAPI(callback) {
  const script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBStUMRpmG-vchdbtciHmqdQhzvLXmgQyI&libraries=places&callback=onGoogleMapsApiLoaded';
  script.async = true;
  script.defer = true;
  window.onGoogleMapsApiLoaded = callback;
  script.onerror = () => {
    console.error('Failed to load the Google Maps script!');
  };
  document.head.appendChild(script);
}

function initAutocomplete(el) {
  const venueName = el.querySelector('#venue-info-venue-name input');
  // eslint-disable-next-line no-undef
  if (!google) return;
  // eslint-disable-next-line no-undef
  const autocomplete = new google.maps.places.Autocomplete(venueName);

  console.log(el.cloneNode(true));
  const address = el.querySelector('#venue-info-venue-address input');
  const city = el.querySelector('#location-city input');
  const state = el.querySelector('#location-state input');
  const zip = el.querySelector('#location-zip-code input');
  const country = el.querySelector('#location-country input');
  const placeId = el.querySelector('#google-place-id input');

  autocomplete.setFields(['name', 'address_components', 'geometry', 'place_id']);

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();

    if (place.address_components) {
      const components = place.address_components;

      const addressInfo = {
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
      };

      components.forEach((component) => {
        if (component.types.includes('street_number')) {
          addressInfo.address += `${component.long_name} `;
        }
        if (component.types.includes('route')) {
          addressInfo.address += component.long_name;
        }
        if (component.types.includes('locality')) {
          addressInfo.city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          addressInfo.state = component.long_name;
        }
        if (component.types.includes('postal_code')) {
          addressInfo.zip = component.long_name;
        }
        if (component.types.includes('country')) {
          addressInfo.country = component.long_name;
        }
      });

      if (place.name) venueName.value = place.name;
      address.value = addressInfo.address;
      city.value = addressInfo.city;
      state.value = addressInfo.state;
      zip.value = addressInfo.zip;
      country.value = addressInfo.country;
      placeId.value = place.place_id;
    }
  });
}

export default function init(component) {
  initVenueImageInput(component);
  loadGoogleMapsAPI(() => initAutocomplete(component));
}

export function onResume() {
  // TODO: handle form prepopulation on component level
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
