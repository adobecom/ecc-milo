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

export default function init(component, props) {
  const dropzones = component.querySelectorAll('image-dropzone');

  dropzones.forEach((dz) => {
    dz.handleImage = async () => {
      const file = dz.getFile();

      if (!file || !(file instanceof File)) return;
      const resp = await uploadBinaryFile(file, JSON.parse(component.dataset.configs));

      if (resp) props.response = resp;
    };
  });

  const eventData = props.response;
  if (component.classList.contains('venue')) {
    const venueImgVisibleCheck = component.querySelector('#checkbox-venue-image-visible');

    if (venueImgVisibleCheck) {
      venueImgVisibleCheck.checked = eventData.showVenueImage;
    }
  }
}
