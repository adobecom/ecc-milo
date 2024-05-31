export default function init(component, props) {

}

export function onSubmit(component, props) {
  if (component.classList.contains('venue')) {
    const venueImgVisibleCheck = component.querySelector('#checkbox-venue-image-visible');

    if (venueImgVisibleCheck) {
      props.payload = { ...props.payload, ...{ showVenueImage: venueImgVisibleCheck.checked }};
    }
  }
}
