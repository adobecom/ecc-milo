export default function init(component, props) {

}

export function onSubmit(component, props) {
  const attendeeLimit = component.querySelector('#attendee-count-input')?.value;
  const allowWaitlist = component.querySelector('#registration-allow-waitlist')?.checked;
  const contactHost = component.querySelector('#registration-contact-host')?.checked;
  const hostEmail = component.querySelector('#event-host-email-input')?.value;
  const title = component.querySelector('#rsvp-form-detail-title')?.value;
  const subtitle = component.querySelector('#rsvp-form-detail-subtitle')?.value;
  const description = component.querySelector('#rsvp-form-detail-description')?.value;

  const rsvpData = {
    attendeeLimit,
    allowWaitlist,
    contactHost,
    hostEmail,
    title,
    subtitle,
    description,
  };

  props.payload = { ...props.payload, rsvpData };
}
