import getJoinedData from '../data-handler.js';
import { uploadBinaryFile } from '../../../utils/esp-controller.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  if (component.classList.contains('venue')) {
    const venueImgVisibleCheck = component.querySelector('#checkbox-venue-image-visible');

    if (venueImgVisibleCheck) {
      props.payload = { ...props.payload, ...{ showVenueImage: venueImgVisibleCheck.checked } };
    }
  }
}

async function uploadImage(configs, file) {
  if (!file || !(file instanceof File)) return null;

  const resp = await uploadBinaryFile(file, configs);
  return resp;
}

export default function init(component, props) {
  const dropzones = component.querySelectorAll('image-dropzone');

  dropzones.forEach((dz) => {
    dz.handleImage = async () => {
      const { file } = dz;
      const resp = await uploadImage(JSON.parse(component.dataset.configs), file);

      if (resp) props.response = resp;
    };
  });

  const eventData = getJoinedData();
  if (component.classList.contains('venue')) {
    const venueImgVisibleCheck = component.querySelector('#checkbox-venue-image-visible');

    if (venueImgVisibleCheck) {
      venueImgVisibleCheck.checked = eventData.showVenueImage;
    }
  }
}
