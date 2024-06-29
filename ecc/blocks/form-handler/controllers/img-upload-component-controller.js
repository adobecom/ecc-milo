/* eslint-disable no-unused-vars */
import { uploadBinaryFile } from '../../../utils/esp-controller.js';
import { getFilteredCachedResponse } from '../data-handler.js';

function getComponentImageType(component) {
  const typeMap = {
    hero: 'event-hero-image',
    card: 'event-card-image',
    venue: 'venue-image',
  };
  const type = typeMap[component.classList[1]];
  return type;
}

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  if (component.classList.contains('venue')) {
    const venueImgVisibleCheck = component.querySelector('#checkbox-venue-image-visible');

    if (venueImgVisibleCheck) {
      props.payload = { ...props.payload, ...{ showVenueImage: venueImgVisibleCheck.checked } };
    }
  }
}

function updateImgUploadComponentConfigs(component) {
  const type = getComponentImageType(component);

  const configs = {
    type,
    altText: `Event ${component.classList[1]} image`,
    targetUrl: `/v1/events/${getFilteredCachedResponse().eventId}/images`,
  };

  component.dataset.configs = JSON.stringify(configs);
}

export async function onUpdate(component, props) {
  updateImgUploadComponentConfigs(component);
}

export default function init(component, props) {
  const type = getComponentImageType(component);
  const dropzones = component.querySelectorAll('image-dropzone');

  dropzones.forEach((dz) => {
    dz.handleImage = async () => {
      const file = dz.getFile();

      if (!file || !(file instanceof File)) return;
      const resp = await uploadBinaryFile(file, JSON.parse(component.dataset.configs));

      if (resp) props.eventDataResp = resp;
    };
  });

  const eventData = props.eventDataResp;

  if (eventData.photos) {
    const photoObj = eventData.photos.find((p) => p.imageKind === type);

    if (photoObj) {
      dropzones.forEach((dz) => {
        dz.file = { ...photoObj, url: photoObj.imageUrl };
        dz.requestUpdate();
      });
    }
  }

  if (type === 'venue-image') {
    const venueImgVisibleCheck = component.querySelector('#checkbox-venue-image-visible');

    if (venueImgVisibleCheck) {
      venueImgVisibleCheck.checked = eventData.showVenueImage;
    }
  }
}
