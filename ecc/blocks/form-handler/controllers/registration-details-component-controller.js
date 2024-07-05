/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const attendeeLimitVal = component.querySelector('#attendee-count-input')?.value;
  const allowWaitlisting = component.querySelector('#registration-allow-waitlist')?.checked;
  const contactHost = component.querySelector('#registration-contact-host')?.checked;
  const hostEmail = component.querySelector('#event-host-email-input')?.value;
  const rsvpDescription = component.querySelector('#rsvp-form-detail-description')?.value;

  const attendeeLimit = Number.isNaN(+attendeeLimitVal) ? null : +attendeeLimitVal;
  const rsvpData = {
    attendeeLimit,
    allowWaitlisting,
    hostEmail: contactHost ? hostEmail : '',
    rsvpDescription,
  };

  props.payload = { ...props.payload, ...rsvpData };
}

export async function onUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  const contactHostEl = component.querySelector('#registration-contact-host');
  const hostEmailEl = component.querySelector('#event-host-email-input');
  const attendeeLimitEl = component.querySelector('#attendee-count-input');
  const allowWaitlistEl = component.querySelector('#registration-allow-waitlist');
  const descriptionEl = component.querySelector('#rsvp-form-detail-description');

  const eventData = props.eventDataResp;
  if (eventData) {
    const {
      attendeeLimit,
      allowWaitlisting,
      hostEmail,
      rsvpDescription,
    } = eventData;

    if (attendeeLimitEl) attendeeLimitEl.value = attendeeLimit;
    if (allowWaitlistEl) allowWaitlistEl.checked = allowWaitlisting;
    if (hostEmailEl) hostEmailEl.value = hostEmail;
    if (descriptionEl) descriptionEl.value = rsvpDescription;
    if (hostEmail) contactHostEl.checked = true;

    if (attendeeLimit || allowWaitlisting || hostEmail || rsvpDescription) {
      component.classList.add('prefilled');
    }
  }

  if (contactHostEl && hostEmailEl) {
    hostEmailEl.disabled = !contactHostEl.checked;

    contactHostEl.addEventListener('change', () => {
      hostEmailEl.disabled = !contactHostEl.checked;
    });
  }
}
