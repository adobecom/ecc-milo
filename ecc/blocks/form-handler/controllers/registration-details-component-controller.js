/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const attendeeLimitVal = component.querySelector('#attendee-count-input')?.value;
  const allowWaitlisting = component.querySelector('#registration-allow-waitlist')?.checked;
  const contactHost = component.querySelector('#registration-contact-host')?.checked;
  const hostEmail = component.querySelector('#event-host-email-input')?.value;
  const rsvpDescription = component.querySelector('#rsvp-form-detail-description')?.value;

  const attendeeLimit = Number.isNaN(+attendeeLimitVal) ? null : +attendeeLimitVal;

  const rsvpData = {};

  if (rsvpDescription) rsvpData.rsvpDescription = rsvpDescription;
  if (contactHost && hostEmail) rsvpData.hostEmail = hostEmail;
  if (attendeeLimit) rsvpData.attendeeLimit = attendeeLimit;
  if (allowWaitlisting) rsvpData.allowWaitlisting = allowWaitlisting;

  props.payload = { ...props.payload, ...rsvpData };
}

export async function onUpdate(component, props) {
  if (!props.eventDataResp) return;

  if (props.eventDataResp.cloudType === 'CreativeCloud') {
    component.querySelector('.attendee-count-wrapper')?.classList.add('hidden');
    component.querySelector('#registration-allow-waitlist')?.classList.add('hidden');
  }
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

    if (attendeeLimitEl && attendeeLimit) attendeeLimitEl.value = attendeeLimit;
    if (allowWaitlistEl && allowWaitlisting) allowWaitlistEl.checked = allowWaitlisting;
    if (descriptionEl && rsvpDescription) descriptionEl.value = rsvpDescription;
    if (hostEmail) {
      if (contactHostEl) contactHostEl.checked = true;
      if (hostEmailEl) hostEmailEl.value = hostEmail;
    }

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
