/* eslint-disable no-unused-vars */
import { deleteImage, getEventImages, uploadImage } from '../../scripts/esp-controller.js';
import { LIBS } from '../../scripts/scripts.js';

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
  // Do nothing
}

function updateImgUploadComponentConfigs(component, props) {
  const { eventId } = props.eventDataResp;

  if (!eventId) return;

  const type = getComponentImageType(component);

  const configs = {
    type,
    targetUrl: `/v1/events/${eventId}/images`,
  };

  component.dataset.configs = JSON.stringify(configs);
}

export async function onPayloadUpdate(component, props) {
  updateImgUploadComponentConfigs(component, props);
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default async function init(component, props) {
  const type = getComponentImageType(component);
  const dropzones = component.querySelectorAll('image-dropzone');

  const progressWrapper = component.querySelector('.progress-wrapper');
  const progress = component.querySelector('sp-progress-circle');

  dropzones.forEach((dz) => {
    let imageId = null;
    let file = null;

    dz.handleImage = async () => {
      const configs = JSON.parse(component.dataset.configs);
      file = dz.getFile();

      if (!file || !(file instanceof File) || !configs) return;

      progressWrapper.classList.remove('hidden');

      if (props.eventDataResp.eventId) {
        const eventImagesResp = await getEventImages(props.eventDataResp.eventId);

        if (eventImagesResp?.images) {
          const photoObj = eventImagesResp.images.find((p) => p.imageKind === type);
          if (photoObj) imageId = photoObj.imageId;
        }
      }

      try {
        const resp = await uploadImage(
          file,
          configs,
          progress,
          imageId,
        );

        if (resp?.imageId) imageId = resp.imageId;
      } catch (error) {
        dz.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Failed to upload the image. Please try again later.' } }, bubbles: true, composed: true }));
        dz.deleteImage();
      } finally {
        progressWrapper.classList.add('hidden');
      }
    };

    dz.handleDelete = async () => {
      const configs = JSON.parse(component.dataset.configs);

      if (props.eventDataResp.eventId) {
        const eventImagesResp = await getEventImages(props.eventDataResp.eventId);

        if (eventImagesResp?.images) {
          const photoObj = eventImagesResp.images.find((p) => p.imageKind === type);
          if (photoObj) imageId = photoObj.imageId;
        }
      }

      if (!imageId || !configs) return;

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
          const resp = await deleteImage(configs, imageId);
          if (resp.error) {
            dz.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Failed to delete the image. Please try again later.' } }, bubbles: true, composed: true }));
          } else {
            dz.file = null;
            imageId = null;
            dz.requestUpdate();
          }
        } catch (error) {
          window.lana?.log(`Failed to perform image DELETE operation:\n${JSON.stringify(error, null, 2)}`);
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
  });

  const eventData = props.eventDataResp;
  if (eventData.eventId) {
    // TODO: would prefer to prioritize eventData.photos, but it is not reliable.
    // let images;

    // if (eventData.photos) {
    //   images = eventData.photos;
    // } else {
    //   images = await getEventImages(eventData.eventId).images;
    // }
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
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
