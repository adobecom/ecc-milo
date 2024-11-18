/* eslint-disable no-unused-vars */
import { createVenue, replaceVenue } from '../../../scripts/esp-controller.js';
import BlockMediator from '../../../scripts/deps/block-mediator.min.js';
import { changeInputValue, getEventServiceEnv, getSecret } from '../../../scripts/utils.js';
import { buildErrorMessage } from '../form-handler.js';

function togglePrefillableFieldsHiddenState(component) {
  const address = component.querySelector('#venue-info-venue-address');
  const city = component.querySelector('#location-city');
  const state = component.querySelector('#location-state');
  const postal = component.querySelector('#location-zip-code');
  const county = component.querySelector('#location-country');

  const hasUnfilledFields = [address, city, state, postal, county].some((input) => !input.value);

  [address, city, state, postal, county].forEach((input) => {
    input.classList.toggle('hidden', hasUnfilledFields);
  });
}

async function loadGoogleMapsAPI(callback) {
  const secretEnv = getEventServiceEnv() === 'local' ? 'dev' : getEventServiceEnv();
  const script = document.createElement('script');
  const apiKey = await getSecret(`${secretEnv}-google-places-api`);
  script.src = `https://maps.googleapis.com/maps/api/js?loading=async&key=${apiKey}&libraries=places&callback=onGoogleMapsApiLoaded`;
  script.async = true;
  script.defer = true;
  window.onGoogleMapsApiLoaded = callback;
  script.onerror = () => {
    window.lana?.error('Failed to load the Google Maps script!');
  };
  document.head.appendChild(script);
}

function resetAllFields(component) {
  const venueNameInput = component.querySelector('#venue-info-venue-name');
  const addressInput = component.querySelector('#venue-info-venue-address');
  const cityInput = component.querySelector('#location-city');
  const stateInput = component.querySelector('#location-state');
  const stateCodeInput = component.querySelector('#location-state-code');
  const postalCodeInput = component.querySelector('#location-zip-code');
  const countryInput = component.querySelector('#location-country');
  const placeLatInput = component.querySelector('#google-place-lat');
  const placeLngInput = component.querySelector('#google-place-lng');
  const placeIdInput = component.querySelector('#google-place-id');
  const mapUrlInput = component.querySelector('#google-map-url');
  const gmtoffsetInput = component.querySelector('#google-place-gmt-offset');

  venueNameInput.value = '';
  changeInputValue(addressInput, 'value', '');
  changeInputValue(cityInput, 'value', '');
  changeInputValue(stateInput, 'value', '');
  changeInputValue(stateCodeInput, 'value', '');
  changeInputValue(postalCodeInput, 'value', '');
  changeInputValue(countryInput, 'value', '');
  changeInputValue(placeLatInput, 'value', '');
  changeInputValue(placeLngInput, 'value', '');
  changeInputValue(placeIdInput, 'value', '');
  changeInputValue(mapUrlInput, 'value', '');
  changeInputValue(gmtoffsetInput, 'value', '');
}

function updateAllFields(venueData, component) {
  const venueNameInput = component.querySelector('#venue-info-venue-name');
  const addressInput = component.querySelector('#venue-info-venue-address');
  const cityInput = component.querySelector('#location-city');
  const stateInput = component.querySelector('#location-state');
  const stateCodeInput = component.querySelector('#location-state-code');
  const postalCodeInput = component.querySelector('#location-zip-code');
  const countryInput = component.querySelector('#location-country');
  const placeLatInput = component.querySelector('#google-place-lat');
  const placeLngInput = component.querySelector('#google-place-lng');
  const placeIdInput = component.querySelector('#google-place-id');
  const mapUrlInput = component.querySelector('#google-map-url');
  const gmtoffsetInput = component.querySelector('#google-place-gmt-offset');

  changeInputValue(venueNameInput, 'value', venueData.venueName);
  changeInputValue(addressInput, 'value', venueData.address);
  changeInputValue(cityInput, 'value', venueData.city);
  changeInputValue(stateInput, 'value', venueData.state);
  changeInputValue(stateCodeInput, 'value', venueData.statecode);
  changeInputValue(postalCodeInput, 'value', venueData.postalCode);
  changeInputValue(countryInput, 'value', venueData.country);
  changeInputValue(placeLatInput, 'value', venueData.coordinates?.lat);
  changeInputValue(placeLngInput, 'value', venueData.coordinates?.lon);
  changeInputValue(placeIdInput, 'value', venueData.placeId);
  changeInputValue(mapUrlInput, 'value', venueData.mapUrl);
  changeInputValue(gmtoffsetInput, 'value', venueData.gmtOffset);
}

function getVenueDataInForm(component) {
  const venueNameInput = component.querySelector('#venue-info-venue-name');
  const addressInput = component.querySelector('#venue-info-venue-address');
  const cityInput = component.querySelector('#location-city');
  const stateInput = component.querySelector('#location-state');
  const stateCodeInput = component.querySelector('#location-state-code');
  const postalCodeInput = component.querySelector('#location-zip-code');
  const countryInput = component.querySelector('#location-country');
  const placeLatInput = component.querySelector('#google-place-lat');
  const placeLngInput = component.querySelector('#google-place-lng');
  const placeIdInput = component.querySelector('#google-place-id');
  const mapUrlInput = component.querySelector('#google-map-url');
  const gmtoffsetInput = component.querySelector('#google-place-gmt-offset');

  const venueName = venueNameInput.value;
  const address = addressInput.value;
  const city = cityInput.value;
  const state = stateInput.value;
  const stateCode = stateCodeInput.value;
  const postalCode = postalCodeInput.value;
  const country = countryInput.value;
  const placeId = placeIdInput.value;
  const mapUrl = mapUrlInput.value;
  const lat = +placeLatInput.value;
  const lon = +placeLngInput.value;
  const gmtOffset = +gmtoffsetInput.value;

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

  return venueData;
}

function initAutocomplete(el, props) {
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

      if (Object.values(addressInfo).some((v) => !v)) {
        el.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'The selection is not a valid venue.' } }, bubbles: true, composed: true }));
        resetAllFields(el);
        togglePrefillableFieldsHiddenState(el);
        return;
      }

      if (place.name) changeInputValue(venueName, 'value', place.name);
      changeInputValue(address, 'value', addressInfo.address);
      changeInputValue(city, 'value', addressInfo.city);
      changeInputValue(state, 'value', addressInfo.state);
      changeInputValue(stateCode, 'value', addressInfo.stateCode);
      changeInputValue(zip, 'value', addressInfo.zip);
      changeInputValue(country, 'value', addressInfo.country);
      changeInputValue(placeId, 'value', place.place_id);
      changeInputValue(mapUrl, 'value', place.url);

      togglePrefillableFieldsHiddenState(el);
      BlockMediator.set('eventDupMetrics', { ...BlockMediator.get('eventDupMetrics'), city: addressInfo.city });
    }

    if (place.geometry) {
      placeGmtOffset.value = place.utc_offset_minutes / 60;
      placeLAT.value = place.geometry.location.lat();
      placeLNG.value = place.geometry.location.lng();
    }
  });
}

export async function onSubmit(component, props) {
  // do nothing. Depend on eventUpdated event.
}

export async function onPayloadUpdate(component, props) {
  // do nothing
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default async function init(component, props) {
  const eventData = props.eventDataResp;

  await loadGoogleMapsAPI(() => initAutocomplete(component, props));

  const { venue, showVenuePostEvent } = eventData;

  const venueNameInput = component.querySelector('#venue-info-venue-name');

  togglePrefillableFieldsHiddenState(component);

  venueNameInput.addEventListener('change', () => {
    if (!venueNameInput.value) {
      resetAllFields(component);
      togglePrefillableFieldsHiddenState(component, true);
    }
  });

  if (venue) {
    updateAllFields(venue, component);
    BlockMediator.set('eventDupMetrics', { ...BlockMediator.get('eventDupMetrics'), city: venue.city });

    if (venue.venueName) {
      component.classList.add('prefilled');
      togglePrefillableFieldsHiddenState(component);
    }
  }

  if (showVenuePostEvent) {
    changeInputValue(component.querySelector('#checkbox-venue-info-visible'), 'checked', showVenuePostEvent);
  }
}

export async function onEventUpdate(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const venueData = getVenueDataInForm(component);

  let resp;
  if (!props.eventDataResp.venue) {
    resp = await createVenue(props.eventDataResp.eventId, venueData);
  } else if (props.eventDataResp.venue.placeId !== venueData.placeId) {
    resp = await replaceVenue(props.eventDataResp.eventId, props.eventDataResp.venue.venueId, {
      ...props.eventDataResp.venue,
      ...venueData,
    });

    if (resp.error) {
      buildErrorMessage(props, resp);
    }
  }

  if (resp) {
    props.eventDataResp = { ...props.eventDataResp, ...resp };
    props.payload = {
      ...props.payload,
      showVenuePostEvent: venueData.showVenuePostEvent,
    };
  }
}
