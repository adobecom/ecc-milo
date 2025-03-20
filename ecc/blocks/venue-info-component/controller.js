/* eslint-disable no-unused-vars */
import { createVenue, deleteImage, getEventImages, replaceVenue, uploadImage } from '../../scripts/esp-controller.js';
import { LIBS } from '../../scripts/scripts.js';
import BlockMediator from '../../scripts/deps/block-mediator.min.js';
import { changeInputValue, getEventServiceEnv, getSecret } from '../../scripts/utils.js';
import { buildErrorMessage } from '../form-handler/form-handler.js';

const imageType = 'venue-additional-image';
let imageFile = null;
let respImageId = null;
let respImageConfigs = null;
function togglePrefillableFieldsHiddenState(component) {
  const address = component.querySelector('#google-place-formatted-address');

  address.classList.toggle('hidden', !address.value);
}

async function loadGoogleMapsAPI(callback) {
  const ALLOWED_ENVS = new Set(['dev', 'stage', 'prod']);

  const currentEnv = getEventServiceEnv() === 'local' ? 'dev' : getEventServiceEnv();

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
    window.lana?.log('Failed to load the Google Maps script!');
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

function updateAllFields(venueData, component) {
  const venueNameInput = component.querySelector('#venue-info-venue-name');
  const placeLatInput = component.querySelector('#google-place-lat');
  const placeLngInput = component.querySelector('#google-place-lng');
  const placeIdInput = component.querySelector('#google-place-id');
  const gmtoffsetInput = component.querySelector('#google-place-gmt-offset');
  const addressComponentsInput = component.querySelector('#google-place-address-components');
  const formattedAddressInput = component.querySelector('#google-place-formatted-address');
  const additionalInformationInput = component.querySelector('#venue-additional-info-rte-output');
  const venueRTE = component.querySelector('#venue-additional-info-rte');

  changeInputValue(venueNameInput, 'value', venueData.venueName);
  changeInputValue(placeLatInput, 'value', venueData.coordinates?.lat);
  changeInputValue(placeLngInput, 'value', venueData.coordinates?.lon);
  changeInputValue(placeIdInput, 'value', venueData.placeId);
  changeInputValue(gmtoffsetInput, 'value', venueData.gmtOffset);
  changeInputValue(addressComponentsInput, 'value', JSON.stringify(venueData.addressComponents));
  changeInputValue(formattedAddressInput, 'value', venueData.formattedAddress);
  changeInputValue(additionalInformationInput, 'value', venueData.additionalInformation);
  if (venueRTE) {
    venueRTE.content = venueData.additionalInformation;
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
  const additionalInformation = additionalInformationInput?.value;

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

  props.payload = {
    ...props.payload,
    showVenuePostEvent,
    showVenueAdditionalInfoPostEvent,
  };
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

  const { venue, showVenuePostEvent, showVenueAdditionalInfoPostEvent } = eventData;

  const venueNameInput = component.querySelector('#venue-info-venue-name');
  const venueRTE = component.querySelector('#venue-additional-info-rte');
  const venuePostEventCheckbox = component.querySelector('#checkbox-venue-info-visible');
  const venueAdditionalInfoPostEventCheckbox = component.querySelector('#checkbox-venue-additional-info-visible');
  const dz = component.querySelector('image-dropzone');

  togglePrefillableFieldsHiddenState(component);

  venueNameInput.addEventListener('change', () => {
    if (!venueNameInput.value) {
      resetAllFields(component);
      togglePrefillableFieldsHiddenState(component);
    }
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
      changeInputValue(component.querySelector('#venue-additional-info-rte-output'), 'value', output);
    };
  }

  if (dz) {
    dz.handleImage = () => {
      imageFile = dz.getFile();
    };

    dz.handleDelete = async () => {
      let imageId = respImageId;
      let imageConfigs = respImageConfigs;
      console.log('imageId', imageId);
      console.log('imageConfigs', imageConfigs);

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

      if (!imageConfigs || !imageId) return;

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
        try {
          dialogDeleteBtn.disabled = true;
          dialogCancelBtn.disabled = true;
          const resp = await deleteImage(imageConfigs, imageId);
          if (resp.error) {
            dz.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Failed to delete the image. Please try again later.' } }, bubbles: true, composed: true }));
          } else {
            dz.file = null;
            imageFile = null;
            respImageId = null;
            respImageConfigs = null;
            dz.requestUpdate();
          }
        } catch (error) {
          window.lana?.log('Failed to perform image DELETE operation. Error:', error);
          dz.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Failed to delete the image. Please try again later.' } }, bubbles: true, composed: true }));
        }

        underlay.open = false;
        dialog.innerHTML = '';
      });

      dialogCancelBtn.addEventListener('click', () => {
        underlay.open = false;
        dialog.innerHTML = '';
      });
    };
  }

  if (venue) {
    updateAllFields(venue, component);
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

  const venueData = getVenueDataInForm(component);

  if (!venueData.placeId) {
    component.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Please select a valid venue.' } }, bubbles: true, composed: true }));
    return;
  }

  const oldVenueData = props.eventDataResp.venue;
  let resp;
  if (!oldVenueData) {
    resp = await createVenue(props.eventDataResp.eventId, venueData);
  } else if (oldVenueData.placeId !== venueData.placeId
    || oldVenueData.additionalInformation !== venueData.additionalInformation) {
    const { creationTime, modificationTime } = oldVenueData;
    resp = await replaceVenue(
      props.eventDataResp.eventId,
      oldVenueData.venueId,
      {
        ...venueData,
        creationTime,
        modificationTime,
      },
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
      showVenueAdditionalInfoPostEvent: venueData.showVenueAdditionalInfoPostEvent,
    };
  }
}
