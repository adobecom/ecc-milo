/* eslint-disable no-unused-vars */
import {
  createVenue, deleteImage, getEvent, getEventImages, replaceVenue, uploadImage,
} from '../../scripts/esp-controller.js';
import { LIBS } from '../../scripts/scripts.js';
import BlockMediator from '../../scripts/deps/block-mediator.min.js';
import { changeInputValue, getSecret } from '../../scripts/utils.js';
import { getCurrentEnvironment } from '../../scripts/environment.js';
import { buildErrorMessage } from '../form-handler/form-handler-helper.js';
import { setPropsPayload } from '../form-handler/data-handler.js';
import { getAttribute, getVenuePayload } from '../../scripts/data-utils.js';
import { ENVIRONMENTS } from '../../scripts/constants.js';

const imageType = 'venue-additional-image';
let imageFile = null;
let respImageId = null;
let respImageConfigs = null;

function togglePrefillableFieldsHiddenState(component) {
  const address = component.querySelector('#google-place-formatted-address');
  address.classList.toggle('hidden', !address.value);
}

async function loadGoogleMapsAPI(callback) {
  const ALLOWED_ENVS = new Set(['dev', 'dev02', 'stage', 'stage02', 'prod']);

  const currentEnv = getCurrentEnvironment() === ENVIRONMENTS.LOCAL
    ? ENVIRONMENTS.DEV
    : getCurrentEnvironment();

  if (!ALLOWED_ENVS.has(currentEnv)) {
    throw new Error('Invalid environment detected.');
  }

  const script = document.createElement('script');
  const apiKey = await getSecret(`${currentEnv}-google-places-api`);

  script.src = `https://maps.googleapis.com/maps/api/js?loading=async&key=${apiKey}&libraries=places&callback=onGoogleMapsApiLoaded`;
  script.async = true;
  script.defer = true;
  window.onGoogleMapsApiLoaded = callback;
  script.onerror = () => {
    window.lana?.log('Failed to load the Google Maps script');
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
  const venueAdditionalInfoInput = component.querySelector('#venue-additional-info-rte-output');
  const venueRTE = component.querySelector('#venue-additional-info-rte');

  venueNameInput.value = '';
  changeInputValue(placeLatInput, 'value', '');
  changeInputValue(placeLngInput, 'value', '');
  changeInputValue(placeIdInput, 'value', '');
  changeInputValue(gmtoffsetInput, 'value', '');
  changeInputValue(addressComponentsInput, 'value', '');
  changeInputValue(formattedAddressInput, 'value', '');
  changeInputValue(venueAdditionalInfoInput, 'value', '');
  if (venueRTE) {
    venueRTE.content = '';
  }
}

function updateAllFields(venueData, component, props) {
  const venueNameInput = component.querySelector('#venue-info-venue-name');
  const placeLatInput = component.querySelector('#google-place-lat');
  const placeLngInput = component.querySelector('#google-place-lng');
  const placeIdInput = component.querySelector('#google-place-id');
  const gmtoffsetInput = component.querySelector('#google-place-gmt-offset');
  const addressComponentsInput = component.querySelector('#google-place-address-components');
  const formattedAddressInput = component.querySelector('#google-place-formatted-address');
  const additionalInformationInput = component.querySelector('#venue-additional-info-rte-output');
  const venueRTE = component.querySelector('#venue-additional-info-rte');

  changeInputValue(venueNameInput, 'value', getAttribute(venueData, 'venueName', props.locale));
  changeInputValue(placeLatInput, 'value', getAttribute(venueData, 'coordinates', props.locale)?.lat);
  changeInputValue(placeLngInput, 'value', getAttribute(venueData, 'coordinates', props.locale)?.lon);
  changeInputValue(placeIdInput, 'value', getAttribute(venueData, 'placeId', props.locale));
  changeInputValue(gmtoffsetInput, 'value', getAttribute(venueData, 'gmtOffset', props.locale));
  changeInputValue(addressComponentsInput, 'value', JSON.stringify(getAttribute(venueData, 'addressComponents', props.locale)));
  changeInputValue(formattedAddressInput, 'value', getAttribute(venueData, 'formattedAddress', props.locale));
  changeInputValue(additionalInformationInput, 'value', getAttribute(venueData, 'additionalInformation', props.locale));
  if (venueRTE) {
    venueRTE.content = getAttribute(venueData, 'additionalInformation', props.locale);
  }
}

function getVenueDataInForm(component) {
  const venueNameInput = component.querySelector('#venue-info-venue-name');
  const placeLatInput = component.querySelector('#google-place-lat');
  const placeLngInput = component.querySelector('#google-place-lng');
  const placeIdInput = component.querySelector('#google-place-id');
  const gmtoffsetInput = component.querySelector('#google-place-gmt-offset');
  const addressComponentsInput = component.querySelector('#google-place-address-components');
  const formattedAddressInput = component.querySelector('#google-place-formatted-address');
  const additionalInformationInput = component.querySelector('#venue-additional-info-rte-output');

  const venueName = venueNameInput.value;
  const placeId = placeIdInput.value;
  const lat = +placeLatInput.value;
  const lon = +placeLngInput.value;
  const gmtOffset = +gmtoffsetInput.value;
  const formattedAddress = formattedAddressInput.value;
  const additionalInformation = additionalInformationInput.value;

  let addressComponents;

  try {
    addressComponents = JSON.parse(addressComponentsInput.value);
  } catch (e) {
    addressComponents = [];
  }

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
    additionalInformation,
  };

  return venueData;
}

/**
 * NEW: Place Autocomplete (New) integration.
 * Replaces legacy google.maps.places.Autocomplete with PlaceAutocompleteElement.
 * - Only one visible input (the new element).
 * - Writes chosen values back to your existing hidden fields.
 */
async function initAutocomplete(el, props) {
  if (!window.google || !window.google.maps) return;

  await window.google.maps.importLibrary('places');

  // Host element you previously used to read/write the "venue name" value.
  const venueNameHost = el.querySelector('#venue-info-venue-name');

  const autoCompleteInput = new window.google.maps.places.PlaceAutocompleteElement();

  autoCompleteInput.setAttribute('placeholder', 'Enter a venue');

  const venueNameHostContainer = venueNameHost.closest('.text-field-row');
  if (venueNameHostContainer) {
    venueNameHostContainer.insertAdjacentElement('beforebegin', autoCompleteInput);
  } else {
    // This would never happen, but just in case
    venueNameHost.insertAdjacentElement('beforebegin', autoCompleteInput);
  }

  const placeId = el.querySelector('#google-place-id');
  const placeLAT = el.querySelector('#google-place-lat');
  const placeLNG = el.querySelector('#google-place-lng');
  const placeGmtOffset = el.querySelector('#google-place-gmt-offset');
  const addressComponentsInput = el.querySelector('#google-place-address-components');
  const formattedAddress = el.querySelector('#google-place-formatted-address');

  // Helper: take new v1 addressComponents and convert to your camel-cased structure
  const normalizeComponents = (components) => {
    if (!Array.isArray(components)) return [];
    return components.map((c) => ({
      longName: c.longText,
      shortName: c.shortText,
      types: c.types,
    }));
  };

  // Helper: find "city" from new components using your candidate list
  const findCity = (components) => {
    const cityCandidates = ['locality', 'postal_town', 'administrative_area_level_2', 'sublocality_level_1'];
    const cityComponent = components.find((c) => c.types?.some((t) => cityCandidates.includes(t)));
    return cityComponent?.longName || '';
  };

  // Handle selection
  autoCompleteInput.addEventListener('gmp-select', async ({ placePrediction }) => {
    try {
      const place = placePrediction.toPlace();
      await place.fetchFields({ fields: ['id', 'displayName', 'formattedAddress', 'location', 'addressComponents', 'utcOffsetMinutes'] });

      // Normalize and validate components
      const comps = normalizeComponents(place.addressComponents);
      const city = findCity(comps);

      changeInputValue(addressComponentsInput, 'value', JSON.stringify(comps));

      if (!city) {
        el.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'The selection is not a valid venue.' } }, bubbles: true, composed: true }));
        resetAllFields(el);
        togglePrefillableFieldsHiddenState(el);
        return;
      }

      // Write values back to your existing hidden/known inputs
      if (place.displayName?.text) changeInputValue(venueNameHost, 'value', place.displayName.text);
      changeInputValue(placeId, 'value', place.id || placePrediction?.placeId);

      if (place.location) {
        const lat = typeof place.location.lat === 'function' ? place.location.lat() : place.location.lat;
        const lng = typeof place.location.lng === 'function' ? place.location.lng() : place.location.lng;
        placeLAT.value = lat;
        placeLNG.value = lng;
      } else {
        placeLAT.value = '';
        placeLNG.value = '';
      }

      placeGmtOffset.value = (place.utcOffsetMinutes ?? 0) / 60;

      if (place.formattedAddress) {
        changeInputValue(formattedAddress, 'value', place.formattedAddress);
      } else {
        changeInputValue(formattedAddress, 'value', '');
      }

      BlockMediator.set('eventDupMetrics', { ...BlockMediator.get('eventDupMetrics'), city });
      togglePrefillableFieldsHiddenState(el);
    } catch (err) {
      window.lana?.log(`Places selection failed: ${err?.message || err}`);
      el.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Failed to fetch place details.' } }, bubbles: true, composed: true }));
    }
  });

  // Keep your clear/reset behavior when user empties the field via the new input
  autoCompleteInput.addEventListener('change', () => {
    if (!autoCompleteInput.value) {
      resetAllFields(el);
      togglePrefillableFieldsHiddenState(el);
    }
  });
}

function resetImageState(dz) {
  dz.file = null;
  imageFile = null;
  respImageId = null;
  respImageConfigs = null;
  dz.requestUpdate();
}

async function uploadVenueAdditionalImage(component, props) {
  const eventData = props.eventDataResp;
  const dz = component.querySelector('image-dropzone');
  const progressWrapper = component.querySelector('.progress-wrapper');
  const progress = component.querySelector('sp-progress-circle');
  let imageConfigs = null;
  let imageId = null;

  if (eventData.eventId) {
    imageConfigs = {
      type: imageType,
      targetUrl: `/v1/events/${eventData.eventId}/images`,
    };
  }

  if (!imageConfigs || !imageFile || !(imageFile instanceof File)) return;

  progressWrapper.classList.remove('hidden');

  if (eventData.eventId) {
    const eventImagesResp = await getEventImages(eventData.eventId);

    if (eventImagesResp?.images) {
      const photoObj = eventImagesResp.images.find((p) => p.imageKind === imageType);
      if (photoObj) imageId = photoObj.imageId;
    }
  }

  try {
    const resp = await uploadImage(
      imageFile,
      imageConfigs,
      progress,
      imageId,
    );
    if (resp?.imageId) {
      respImageId = resp.imageId;
      respImageConfigs = imageConfigs;
    }
  } catch (error) {
    dz.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Failed to upload the image. Please try again later.' } }, bubbles: true, composed: true }));
    dz.deleteImage();
    dz.file = null;
  } finally {
    progressWrapper.classList.add('hidden');
  }
  // Reset image file after upload
  imageFile = null;
}

export async function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const showVenuePostEvent = component.querySelector('#checkbox-venue-info-visible')?.checked;
  const showVenueAdditionalInfoPostEvent = component.querySelector('#checkbox-venue-additional-info-visible')?.checked;

  setPropsPayload(props, { showVenuePostEvent, showVenueAdditionalInfoPostEvent });
}

export async function onPayloadUpdate(component, props) {
  // do nothing
}

export async function onRespUpdate(component, props) {
  if (!props.eventDataResp) return;

  uploadVenueAdditionalImage(component, props);
}

export default async function init(component, props) {
  // TODO: Import createTag at top level once Safari supports top-level await
  const { createTag } = await import(`${LIBS}/utils/utils.js`);
  const eventData = props.eventDataResp;

  await loadGoogleMapsAPI(() => initAutocomplete(component, props));

  const [
    venue,
    showVenuePostEvent,
    showVenueAdditionalInfoPostEvent,
  ] = [
    getAttribute(eventData, 'venue', props.locale),
    getAttribute(eventData, 'showVenuePostEvent', props.locale),
    getAttribute(eventData, 'showVenueAdditionalInfoPostEvent', props.locale),
  ];

  const venueNameInput = component.querySelector('#venue-info-venue-name');
  const venueRTE = component.querySelector('#venue-additional-info-rte');
  const venueRTEOutput = component.querySelector('#venue-additional-info-rte-output');
  const venuePostEventCheckbox = component.querySelector('#checkbox-venue-info-visible');
  const venueAdditionalInfoPostEventCheckbox = component.querySelector('#checkbox-venue-additional-info-visible');
  const venueFormattedAddress = component.querySelector('#google-place-formatted-address');
  const dz = component.querySelector('image-dropzone');

  togglePrefillableFieldsHiddenState(component);

  // Add error helper error text to encourage user to use the autocomplete to select a venue
  venueNameInput.invalid = venueNameInput.value && !venueFormattedAddress.value;
  venueNameInput.addEventListener('input', () => {
    venueNameInput.invalid = venueNameInput.value && !venueFormattedAddress.value;
  });

  if (venuePostEventCheckbox && venueAdditionalInfoPostEventCheckbox) {
    // When venue info checkbox is unchecked, uncheck additional info
    venuePostEventCheckbox.addEventListener('change', (e) => {
      if (!e.target.checked && venueAdditionalInfoPostEventCheckbox.checked) {
        changeInputValue(venueAdditionalInfoPostEventCheckbox, 'checked', false);
      }
    });

    // When additional info checkbox is checked, ensure venue info is also checked
    venueAdditionalInfoPostEventCheckbox.addEventListener('change', (e) => {
      if (e.target.checked && !venuePostEventCheckbox.checked) {
        changeInputValue(venuePostEventCheckbox, 'checked', true);
      }
    });
  }

  if (venueRTE) {
    venueRTE.handleInput = (output) => {
      changeInputValue(venueRTEOutput, 'value', output);
    };
  }

  if (dz) {
    dz.handleImage = () => {
      imageFile = dz.getFile();
    };

    dz.handleDelete = async () => {
      // default to respImageId and respImageConfigs from the previous upload
      let imageId = respImageId;
      let imageConfigs = respImageConfigs;

      if (eventData.eventId) {
        const eventImagesResp = await getEventImages(eventData.eventId);

        if (eventImagesResp?.images) {
          const photoObj = eventImagesResp.images.find((p) => p.imageKind === imageType);
          if (photoObj) imageId = photoObj.imageId;
        }

        imageConfigs = {
          type: imageType,
          targetUrl: `/v1/events/${eventData.eventId}/images`,
        };
      }

      const underlay = props.el.querySelector('sp-underlay');
      const dialog = props.el.querySelector('sp-dialog');

      dialog.innerHTML = '';

      createTag('h1', { slot: 'heading' }, 'You are deleting this image.', { parent: dialog });
      createTag('p', {}, 'Are you sure you want to do this? This cannot be undone.', { parent: dialog });
      const buttonContainer = createTag('div', { class: 'button-container' }, '', { parent: dialog });
      const dialogDeleteBtn = createTag('sp-button', { variant: 'secondary', slot: 'button' }, 'Yes, I want to delete this image', { parent: buttonContainer });
      const dialogCancelBtn = createTag('sp-button', { variant: 'cta', slot: 'button' }, 'Do not delete', { parent: buttonContainer });

      underlay.open = true;

      dialogDeleteBtn.addEventListener('click', async () => {
        dialogDeleteBtn.disabled = true;
        dialogCancelBtn.disabled = true;

        if (!imageConfigs || !imageId) {
          resetImageState(dz);
          underlay.open = false;
          dialog.innerHTML = '';
          return;
        }

        try {
          const resp = await deleteImage(imageConfigs, imageId);
          if (resp.error) {
            dz.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Failed to delete the image. Please try again later.' } }, bubbles: true, composed: true }));
          } else {
            resetImageState(dz);
          }
        } catch (error) {
          window.lana?.log(`Failed to perform image DELETE operation:\n${JSON.stringify(error, null, 2)}`);
          dz.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Failed to delete the image. Please try again later.' } }, bubbles: true, composed: true }));
        } finally {
          underlay.open = false;
          dialog.innerHTML = '';
        }
      });

      dialogCancelBtn.addEventListener('click', () => {
        underlay.open = false;
        dialog.innerHTML = '';
      });
    };
  }

  if (venue) {
    updateAllFields(venue, component, props);
    BlockMediator.set('eventDupMetrics', { ...BlockMediator.get('eventDupMetrics'), city: venue.city });

    if (venue.venueName) {
      component.classList.add('prefilled');
      togglePrefillableFieldsHiddenState(component);
    }

    if (eventData.eventId) {
      const { images } = await getEventImages(eventData.eventId);
      if (images) {
        const photoObj = images.find((p) => p.imageKind === imageType);

        if (photoObj) {
          dz.file = { ...photoObj, url: photoObj.imageUrl };
          dz.requestUpdate();
        }
      }
    }
  }

  if (venuePostEventCheckbox && showVenuePostEvent) {
    changeInputValue(component.querySelector('#checkbox-venue-info-visible'), 'checked', showVenuePostEvent);
  }

  if (venueAdditionalInfoPostEventCheckbox && showVenueAdditionalInfoPostEvent) {
    changeInputValue(component.querySelector('#checkbox-venue-additional-info-visible'), 'checked', showVenueAdditionalInfoPostEvent);
  }
}

export async function onTargetUpdate(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const venueDataInForm = getVenueDataInForm(component);
  const venueData = getVenuePayload(venueDataInForm, props.locale);
  if (!venueData.placeId) {
    component.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Please select a valid venue.' } }, bubbles: true, composed: true }));
    return;
  }

  const oldVenueData = props.eventDataResp.venue;
  let resp;

  if (!oldVenueData) {
    resp = await createVenue(props.eventDataResp.eventId, venueData);

    if (resp?.error) {
      if (resp.status === 500) {
        const { message } = resp.error;
        const parsedMsg = message.match(/"message":"(.*?)"/);
        const errorMessage = parsedMsg ? parsedMsg[1] : message;
        component.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: `Invalid address. ${errorMessage}` } }, bubbles: true, composed: true }));
      } else {
        buildErrorMessage(props, resp);
      }
      return;
    }
  } else {
    const { placeId } = venueData;
    const additionalInformation = getAttribute(venueData, 'additionalInformation', props.locale);
    const { placeId: oldPlaceId, venueId, creationTime, modificationTime } = oldVenueData;
    const oldAdditionalInformation = getAttribute(oldVenueData, 'additionalInformation', props.locale);

    if (placeId !== oldPlaceId || additionalInformation !== oldAdditionalInformation) {
      resp = await replaceVenue(
        props.eventDataResp.eventId,
        venueId,
        {
          ...venueData,
          venueId,
          creationTime,
          modificationTime,
        },
      );
    }

    if (resp?.error) {
      buildErrorMessage(props, resp);
    }
  }

  if (resp) {
    const updatedEventData = await getEvent(props.eventDataResp.eventId);

    if (!updatedEventData.error && updatedEventData) {
      props.eventDataResp = updatedEventData;
    } else {
      component.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: updatedEventData.error } }));
    }

    props.payload = {
      ...props.payload,
      showVenuePostEvent: venueData.showVenuePostEvent,
      showVenueAdditionalInfoPostEvent: venueData.showVenueAdditionalInfoPostEvent,
    };
  }
}
