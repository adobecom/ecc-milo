/* eslint-disable no-unused-vars */
import { createVenue, replaceVenue } from '../../scripts/esp-controller.js';
import BlockMediator from '../../scripts/deps/block-mediator.min.js';
import { changeInputValue, getEventServiceEnv, getSecret } from '../../scripts/utils.js';
import { buildErrorMessage } from '../form-handler/form-handler.js';

function togglePrefillableFieldsHiddenState(component) {
  const address = component.querySelector('#google-place-formatted-address');

  address.classList.toggle('hidden', !address.value);
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
  const placeLatInput = component.querySelector('#google-place-lat');
  const placeLngInput = component.querySelector('#google-place-lng');
  const placeIdInput = component.querySelector('#google-place-id');
  const gmtoffsetInput = component.querySelector('#google-place-gmt-offset');
  const addressComponentsInput = component.querySelector('#google-place-address-components');
  const formattedAddressInput = component.querySelector('#google-place-formatted-address');

  venueNameInput.value = '';
  changeInputValue(placeLatInput, 'value', '');
  changeInputValue(placeLngInput, 'value', '');
  changeInputValue(placeIdInput, 'value', '');
  changeInputValue(gmtoffsetInput, 'value', '');
  changeInputValue(addressComponentsInput, 'value', '');
  changeInputValue(formattedAddressInput, 'value', '');
}

function updateAllFields(venueData, component) {
  const venueNameInput = component.querySelector('#venue-info-venue-name');
  const placeLatInput = component.querySelector('#google-place-lat');
  const placeLngInput = component.querySelector('#google-place-lng');
  const placeIdInput = component.querySelector('#google-place-id');
  const gmtoffsetInput = component.querySelector('#google-place-gmt-offset');
  const addressComponentsInput = component.querySelector('#google-place-address-components');
  const formattedAddressInput = component.querySelector('#google-place-formatted-address');

  changeInputValue(venueNameInput, 'value', venueData.venueName);
  changeInputValue(placeLatInput, 'value', venueData.coordinates?.lat);
  changeInputValue(placeLngInput, 'value', venueData.coordinates?.lon);
  changeInputValue(placeIdInput, 'value', venueData.placeId);
  changeInputValue(gmtoffsetInput, 'value', venueData.gmtOffset);
  changeInputValue(addressComponentsInput, 'value', JSON.stringify(venueData.addressComponents));
  changeInputValue(formattedAddressInput, 'value', venueData.formattedAddress);
}

function getVenueDataInForm(component) {
  const venueNameInput = component.querySelector('#venue-info-venue-name');
  const placeLatInput = component.querySelector('#google-place-lat');
  const placeLngInput = component.querySelector('#google-place-lng');
  const placeIdInput = component.querySelector('#google-place-id');
  const gmtoffsetInput = component.querySelector('#google-place-gmt-offset');
  const addressComponentsInput = component.querySelector('#google-place-address-components');
  const formattedAddressInput = component.querySelector('#google-place-formatted-address');

  const venueName = venueNameInput.value;
  const placeId = placeIdInput.value;
  const lat = +placeLatInput.value;
  const lon = +placeLngInput.value;
  const gmtOffset = +gmtoffsetInput.value;
  const addressComponents = JSON.parse(addressComponentsInput.value);
  const formattedAddress = formattedAddressInput.value;

  const venueData = {
    venueName,
    placeId,
    coordinates: {
      lat,
      lon,
    },
    gmtOffset,
    addressComponents,
    formattedAddress,
  };

  return venueData;
}

function initAutocomplete(el, props) {
  const venueName = el.querySelector('#venue-info-venue-name');
  // eslint-disable-next-line no-undef
  if (!google) return;
  // eslint-disable-next-line no-undef
  const autocomplete = new google.maps.places.Autocomplete(venueName.shadowRoot.querySelector('input'));

  const placeId = el.querySelector('#google-place-id');
  const placeLAT = el.querySelector('#google-place-lat');
  const placeLNG = el.querySelector('#google-place-lng');
  const placeGmtOffset = el.querySelector('#google-place-gmt-offset');
  const addressComponentsInput = el.querySelector('#google-place-address-components');
  const formattedAddress = el.querySelector('#google-place-formatted-address');

  autocomplete.setFields(['formatted_address', 'name', 'address_components', 'geometry', 'place_id', 'utc_offset_minutes', 'url']);

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();

    if (place.address_components) {
      let components = place.address_components;

      const addressInfo = { city: '' };

      const cityCandidates = ['locality', 'postal_town', 'administrative_area_level_2', 'sublocality_level_1'];

      components.forEach((component) => {
        if (!addressInfo.city
          && cityCandidates.some((type) => component.types.includes(type))) {
          addressInfo.city = component.long_name;
        }
      });

      components = components.map((component) => {
        const obj = {};
        Object.keys(component).forEach((key) => {
          const newKey = key.replace(/_(.)/g, (_, match) => match.toUpperCase());
          obj[newKey] = component[key];
        });

        return obj;
      });

      changeInputValue(addressComponentsInput, 'value', JSON.stringify(components));

      if (Object.values(addressInfo).some((v) => !v)) {
        el.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'The selection is not a valid venue.' } }, bubbles: true, composed: true }));
        resetAllFields(el);
        togglePrefillableFieldsHiddenState(el);
        return;
      }

      if (place.name) changeInputValue(venueName, 'value', place.name);
      changeInputValue(placeId, 'value', place.place_id);

      BlockMediator.set('eventDupMetrics', { ...BlockMediator.get('eventDupMetrics'), city: addressInfo.city });
    }

    if (place.geometry) {
      placeGmtOffset.value = place.utc_offset_minutes / 60;
      placeLAT.value = place.geometry.location.lat();
      placeLNG.value = place.geometry.location.lng();
    }

    if (place.formatted_address) {
      changeInputValue(formattedAddress, 'value', place.formatted_address);
    }

    togglePrefillableFieldsHiddenState(el);
  });
}

export async function onSubmit(component, props) {
  // do nothing. Depend on onEventUpdate cb.
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

export async function onTargetUpdate(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const venueData = getVenueDataInForm(component);
  const oldVenueData = props.eventDataResp.venue;
  let resp;
  if (!oldVenueData) {
    resp = await createVenue(props.eventDataResp.eventId, venueData);
  } else if (
    oldVenueData.placeId !== venueData.placeId
  || (oldVenueData.placeId === venueData.placeId && !oldVenueData.formattedAddress)) {
    resp = await replaceVenue(
      props.eventDataResp.eventId,
      oldVenueData.venueId,
      { ...venueData },
    );

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
