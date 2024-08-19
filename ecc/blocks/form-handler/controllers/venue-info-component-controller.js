/* eslint-disable no-unused-vars */
import { createVenue, replaceVenue } from '../../../scripts/esp-controller.js';
import { ECC_ENV } from '../../../scripts/scripts.js';
import { changeInputValue, getSecret } from '../../../scripts/utils.js';
import { buildErrorMessage } from '../form-handler.js';

function togglePrefillableFieldsHiddenState(component, showPrefilledFields) {
  const addressInput = component.querySelector('#venue-info-venue-address');
  const cityInput = component.querySelector('#location-city');
  const stateInput = component.querySelector('#location-state');
  const postalCodeInput = component.querySelector('#location-zip-code');
  const countryInput = component.querySelector('#location-country');

  [addressInput, cityInput, stateInput, postalCodeInput, countryInput].forEach((input) => {
    input.classList.toggle('hidden', showPrefilledFields);
  });
}

async function loadGoogleMapsAPI(callback) {
  const script = document.createElement('script');
  const apiKey = await getSecret(`${ECC_ENV}-google-places-api`);
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

      togglePrefillableFieldsHiddenState(el, false);
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

export async function onUpdate(component, props) {
  // do nothing
}

export default async function init(component, props) {
  const eventData = props.eventDataResp;

  await loadGoogleMapsAPI(() => initAutocomplete(component));

  const { venue, showVenuePostEvent } = eventData;

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

  togglePrefillableFieldsHiddenState(component, true);

  venueNameInput.addEventListener('change', () => {
    if (!venueNameInput.value) {
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
  });

  if (venue) {
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

    changeInputValue(venueNameInput, 'value', venueName);
    changeInputValue(addressInput, 'value', address);
    changeInputValue(cityInput, 'value', city);
    changeInputValue(stateInput, 'value', state);
    changeInputValue(stateCodeInput, 'value', statecode);
    changeInputValue(postalCodeInput, 'value', postalCode);
    changeInputValue(countryInput, 'value', country);
    changeInputValue(placeLatInput, 'value', venue.coordinates?.lat);
    changeInputValue(placeLngInput, 'value', venue.coordinates?.lon);
    changeInputValue(placeIdInput, 'value', placeId);
    changeInputValue(mapUrlInput, 'value', mapUrl);
    changeInputValue(gmtoffsetInput, 'value', venue.gmtOffset);

    if (venueName) {
      component.classList.add('prefilled');
      togglePrefillableFieldsHiddenState(component, false);
    }
  }

  if (showVenuePostEvent) {
    changeInputValue(component.querySelector('#checkbox-venue-info-visible'), 'checked', showVenuePostEvent);
  }

  const getVenueDataInForm = () => {
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
  };

  const onEventUpdate = async () => {
    if (component.closest('.fragment')?.classList.contains('hidden')) return;

    const venueData = getVenueDataInForm();

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
  };

  props.el.addEventListener('eventUpdated', onEventUpdate);
}
