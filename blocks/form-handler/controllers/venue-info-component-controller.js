import { createVenue } from '../../../utils/esp-controller.js';

function loadGoogleMapsAPI(callback) {
  const script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBStUMRpmG-vchdbtciHmqdQhzvLXmgQyI&libraries=places&callback=onGoogleMapsApiLoaded';
  script.async = true;
  script.defer = true;
  window.onGoogleMapsApiLoaded = callback;
  script.onerror = () => {
    window.lana?.error('Failed to load the Google Maps script!');
  };
  document.head.appendChild(script);
}

function changeInputValue(input, value) {
  input.value = value;
  input.dispatchEvent(new Event('change'));
}

function initAutocomplete(el) {
  const venueName = el.querySelector('#venue-info-venue-name');
  // eslint-disable-next-line no-undef
  if (!google) return;
  // eslint-disable-next-line no-undef
  const autocomplete = new google.maps.places.Autocomplete(venueName.shadowRoot.querySelector('input'));

  const address = el.querySelector('#venue-info-venue-address');
  const city = el.querySelector('#location-city');
  const state = el.querySelector('#location-state');
  const zip = el.querySelector('#location-zip-code');
  const country = el.querySelector('#location-country');
  const placeId = el.querySelector('#google-place-id');
  const placeLAT = el.querySelector('#google-place-lat');
  const placeLNG = el.querySelector('#google-place-lng');
  const placeGmtOffset = el.querySelector('#google-place-gmt-offset');

  autocomplete.setFields(['name', 'address_components', 'geometry', 'place_id', 'utc_offset_minutes']);

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
          addressInfo.country = component.short_name;
        }
      });

      if (place.name) changeInputValue(venueName, place.name);
      changeInputValue(address, addressInfo.address);
      changeInputValue(city, addressInfo.city);
      changeInputValue(state, addressInfo.state);
      changeInputValue(zip, addressInfo.zip);
      changeInputValue(country, addressInfo.country);
      changeInputValue(placeId, place.place_id);
    }

    if (place.geometry) {
      placeGmtOffset.value = place.utc_offset_minutes / 60;
      placeLAT.value = place.geometry.location.lat();
      placeLNG.value = place.geometry.location.lng();
    }
  });
}

export default function init(component, props) {
  // TODO: init function and repopulate data from props if exists
  loadGoogleMapsAPI(() => initAutocomplete(component));
}

export async function onSubmit(component, props) {
  const visibleInPostState = component.querySelector('#checkbox-venue-info-visible').checked;
  const venueName = component.querySelector('#venue-info-venue-name').value;
  const address = component.querySelector('#venue-info-venue-address').value;
  const city = component.querySelector('#location-city').value;
  const state = component.querySelector('#location-state').value;
  const postalCode = component.querySelector('#location-zip-code').value;
  const country = component.querySelector('#location-country').value;
  // const placeId = component.querySelector('#google-place-id').value;
  const lat = +component.querySelector('#google-place-lat').value;
  const lon = +component.querySelector('#google-place-lng').value;
  const gmtOffset = +component.querySelector('#google-place-gmt-offset').value;

  const venueData = {
    visibleInPostState,
    venueName,
    address,
    city,
    state,
    postalCode,
    country,
    coordinates: {
      lat,
      lon,
    },
    gmtOffset,
  };

  if (!props.payload.venueId) {
    const venueCreatedResp = await createVenue(venueData);

    props.payload = { ...props.payload, ...venueCreatedResp };
    return venueCreatedResp;
  }

  props.payload = { ...props.payload, ...venueData };
  return venueData;
}
