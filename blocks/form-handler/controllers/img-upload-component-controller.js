export default function init(component, props) {
  const dropzones = component.querySelectorAll('image-dropzone');
  const type = `event-${component.classList[1]}-image`;

  const configs = {
    type,
    altText: `event-${component.classList[1]}-image`,
    targetUrl: `http://localhost:8500/v1/events/${props.payload.eventId}/images`,
  };

  dropzones.forEach((dz) => {
    dz.setAttribute('configs', JSON.stringify(configs));
  });
}

export function onSubmit(component, props) {
  return {};
}
