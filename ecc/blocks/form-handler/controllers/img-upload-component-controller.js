/* eslint-disable no-unused-vars */
import { getEventImages, uploadImage } from '../../../scripts/esp-controller.js';
import { LIBS } from '../../../scripts/scripts.js';
import { getFilteredCachedResponse } from '../data-handler.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

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

export default async function init(component, props) {
  const type = getComponentImageType(component);
  const dropzones = component.querySelectorAll('image-dropzone');

  const progressWrapper = component.querySelector('.progress-wrapper');
  const progress = component.querySelector('sp-progress-circle');

  dropzones.forEach((dz) => {
    let imageId = null;

    dz.handleImage = async () => {
      const file = dz.getFile();

      if (!file || !(file instanceof File)) return;

      progressWrapper.classList.remove('hidden');

      if (props.eventDataResp.eventId) {
        const eventImagesResp = await getEventImages(props.eventDataResp.eventId);

        if (eventImagesResp?.images) {
          const photoObj = eventImagesResp.images.find((p) => p.imageKind === type);
          if (photoObj) imageId = photoObj.imageId;
        } else {
          console.log(eventImagesResp);
        }
      }

      try {
        const resp = await uploadImage(
          file,
          JSON.parse(component.dataset.configs),
          progress,
          imageId,
        );

        if (resp?.imageId) imageId = resp.imageId;
      } catch (error) {
        this.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message: 'Failed to upload the image. Please try again later.' }, bubbles: true, composed: true }));
        dz.deleteImage();
      } finally {
        progressWrapper.classList.add('hidden');
      }
    };
  });

  const eventData = props.eventDataResp;
  if (eventData.eventId) {
    const { images } = await getEventImages(eventData.eventId);

    if (images) {
      const photoObj = images.find((p) => p.imageKind === type);

      if (photoObj) {
        dropzones.forEach((dz) => {
          dz.file = { ...photoObj, url: photoObj.imageUrl };
          dz.requestUpdate();
        });
      }
    }
  }

  if (type === 'venue-image') {
    const venueImgVisibleCheck = component.querySelector('#checkbox-venue-image-visible');

    if (venueImgVisibleCheck) {
      venueImgVisibleCheck.checked = eventData.showVenueImage;
    }
  }
}
