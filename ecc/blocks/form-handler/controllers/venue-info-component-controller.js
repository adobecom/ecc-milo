/* eslint-disable no-unused-vars */
import { createVenue } from '../../../utils/esp-controller.js';
import { changeInputValue, getSecret } from '../../../utils/utils.js';
import { getFilteredCachedResponse } from '../data-handler.js';

async function loadGoogleMapsAPI(callback) {
  const script = document.createElement('script');
  const apiKey = await getSecret('google-places-api');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=onGoogleMapsApiLoaded`;
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
  const stateCode = el.querySelector('#location-state-code');
  const zip = el.querySelector('#location-zip-code');
  const country = el.querySelector('#location-country');
  const placeId = el.querySelector('#google-place-id');
  const mapUrl = el.querySelector('#google-map-url');
  const placeLAT = el.querySelector('#google-place-lat');
  const placeLNG = el.querySelector('#google-place-lng');
  const placeGmtOffset = el.querySelector('#google-place-gmt-offset');

  autocomplete.setFields(['name', 'address_components', 'geometry', 'place_id', 'utc_offset_minutes', 'url']);

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
          addressInfo.stateCode = component.short_name;
        }
        if (component.types.includes('postal_code')) {
          addressInfo.zip = component.long_name;
        }
        if (component.types.includes('country')) {
          addressInfo.country = component.short_name;
        }
      });

      if (place.name) changeInputValue(venueName, 'value', place.name);
      changeInputValue(address, 'value', addressInfo.address);
      changeInputValue(city, 'value', addressInfo.city);
      changeInputValue(state, 'value', addressInfo.state);
      changeInputValue(stateCode, 'value', addressInfo.stateCode);
      changeInputValue(zip, 'value', addressInfo.zip);
      changeInputValue(country, 'value', addressInfo.country);
      changeInputValue(placeId, 'value', place.place_id);
      changeInputValue(mapUrl, 'value', place.url);
    }

    if (place.geometry) {
      placeGmtOffset.value = place.utc_offset_minutes / 60;
      placeLAT.value = place.geometry.location.lat();
      placeLNG.value = place.geometry.location.lng();
    }
  });
}

export async function onSubmit(component, props) {
  if (!component.closest('.fragment')?.classList.contains('activated')) return;

  const { eventId, venue } = props.eventDataResp;

  const showVenuePostEvent = component.querySelector('#checkbox-venue-info-visible').checked;
  const venueName = component.querySelector('#venue-info-venue-name').value;
  const address = component.querySelector('#venue-info-venue-address').value;
  const city = component.querySelector('#location-city').value;
  const state = component.querySelector('#location-state').value;
  const stateCode = component.querySelector('#location-state-code').value;
  const postalCode = component.querySelector('#location-zip-code').value;
  const country = component.querySelector('#location-country').value;
  const placeId = component.querySelector('#google-place-id').value;
  const mapUrl = component.querySelector('#google-map-url').value;
  const lat = +component.querySelector('#google-place-lat').value;
  const lon = +component.querySelector('#google-place-lng').value;
  const gmtOffset = +component.querySelector('#google-place-gmt-offset').value;

  const venueData = {
    venueName,
    address,
    city,
    state,
    stateCode,
    postalCode,
    country,
    placeId,
    mapUrl,
    coordinates: {
      lat,
      lon,
    },
    gmtOffset,
  };

  const onEventCreate = async () => {
    const resp = await createVenue(getFilteredCachedResponse().eventId, venueData);
    props.eventDataResp = { ...props.eventDataResp, ...resp };
    props.payload = { ...props.payload, showVenuePostEvent };
    document.removeEventListener('eventcreated', onEventCreate);
  };

  if (eventId && !venue) {
    const resp = await createVenue(eventId, venueData);
    props.eventDataResp = { ...props.eventDataResp, ...resp };
    props.payload = { ...props.payload, showVenuePostEvent };
  } else if (!eventId) {
    document.addEventListener('eventcreated', onEventCreate);
  }
}

export async function onUpdate(_component, _props) {
  // Do nothing
}

export default async function init(component, props) {
  const eventData = props.eventDataResp;

  await loadGoogleMapsAPI(() => initAutocomplete(component));

  const { venue } = eventData;

  if (!venue) return;

  const {
    venueName,
    address,
    city,
    state,
    statecode,
    postalCode,
    country,
    placeId,
    mapUrl,
  } = venue;

  changeInputValue(component.querySelector('#venue-info-venue-name'), 'value', venueName);
  changeInputValue(component.querySelector('#venue-info-venue-address'), 'value', address);
  changeInputValue(component.querySelector('#location-city'), 'value', city);
  changeInputValue(component.querySelector('#location-state'), 'value', state);
  changeInputValue(component.querySelector('#location-state-code'), 'value', statecode);
  changeInputValue(component.querySelector('#location-zip-code'), 'value', postalCode);
  changeInputValue(component.querySelector('#location-country'), 'value', country);
  changeInputValue(component.querySelector('#google-place-lat'), 'value', venue.coordinates?.lat);
  changeInputValue(component.querySelector('#google-place-lng'), 'value', venue.coordinates?.lon);
  changeInputValue(component.querySelector('#google-place-id'), 'value', placeId);
  changeInputValue(component.querySelector('#google-map-url'), 'value', mapUrl);
}
