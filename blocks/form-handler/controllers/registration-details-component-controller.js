export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

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

export default function init(component, props) {
  if (!props.payload.rsvpData) return;

  const {
    attendeeLimit,
    allowWaitlist,
    contactHost,
    hostEmail,
    title,
    subtitle,
    description,
  } = props.payload.rsvpData;

  const attendeeLimitEl = component.querySelector('#attendee-count-input');
  const allowWaitlistEl = component.querySelector('#registration-allow-waitlist');
  const contactHostEl = component.querySelector('#registration-contact-host');
  const hostEmailEl = component.querySelector('#event-host-email-input');
  const titleEl = component.querySelector('#rsvp-form-detail-title');
  const subtitleEl = component.querySelector('#rsvp-form-detail-subtitle');
  const descriptionEl = component.querySelector('#rsvp-form-detail-description');

  if (attendeeLimitEl) attendeeLimitEl.value = attendeeLimit;
  if (allowWaitlistEl) allowWaitlistEl.checked = allowWaitlist;
  if (contactHostEl) contactHostEl.checked = contactHost;
  if (hostEmailEl) hostEmailEl.value = hostEmail;
  if (titleEl) titleEl.value = title;
  if (subtitleEl) subtitleEl.value = subtitle;
  if (descriptionEl) descriptionEl.value = description;
}
