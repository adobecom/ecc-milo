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

    if (place.geometry) {
      placeLAT.value = place.geometry.location.lat();
      placeLNG.value = place.geometry.location.lng();
    }
  });
}

export default function init(component) {
  loadGoogleMapsAPI(() => initAutocomplete(component));
}

export function onResume(component, eventObj) {
  component.querySelector('#checkbox-venue-info-visible').checked = eventObj;
  component.querySelector('#venue-info-venue-name');
  component.querySelector('#venue-info-venue-address');
  component.querySelector('#location-city');
  component.querySelector('#location-state');
  component.querySelector('#location-zip-code');
  component.querySelector('#location-country');
  // const placeId = component.querySelector('#google-place-id');
  component.querySelector('#google-place-lat');
  component.querySelector('#google-place-lng');
}

export function onSubmit(component) {
  const visibleInPostState = component.querySelector('#checkbox-venue-info-visible').checked;
  const venueName = component.querySelector('#venue-info-venue-name').value;
  const address = component.querySelector('#venue-info-venue-address').value;
  const city = component.querySelector('#location-city').value;
  const state = component.querySelector('#location-state').value;
  const postalCode = component.querySelector('#location-zip-code').value;
  const country = component.querySelector('#location-country').value;
  // const placeId = component.querySelector('#google-place-id').value;
  const lat = component.querySelector('#google-place-lat').value;
  const lon = component.querySelector('#google-place-lng').value;

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
    mapUrl: 'string',
    photo: {
      imageId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      imageUrl: 'string',
      imageSharepointUrl: 'string',
      s3Key: 'string',
      mimeType: 'image/jpeg',
      imageType: 'event-hero-image',
      creationTime: '2024-05-16T20:25:14.929Z',
      modificationTime: '2024-05-16T20:25:14.929Z',
    },
  };

  return venueData;
}
