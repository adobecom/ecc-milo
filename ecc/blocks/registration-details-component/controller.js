/* eslint-disable no-unused-vars */
function prefillFields(component, props) {
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
      if (!contactHostEl.checked) hostEmailEl.value = '';
    });
  }
}

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const attendeeLimitVal = component.querySelector('#attendee-count-input')?.value?.trim();
  const allowWaitlisting = component.querySelector('#registration-allow-waitlist')?.checked;
  const contactHost = component.querySelector('#registration-contact-host')?.checked;
  const hostEmail = component.querySelector('#event-host-email-input')?.value?.trim();
  const rsvpDescription = component.querySelector('#rsvp-form-detail-description')?.value;

  const attendeeLimit = Number.isNaN(+attendeeLimitVal) ? null : +attendeeLimitVal;

  const rsvpData = {};

  rsvpData.rsvpDescription = rsvpDescription || '';
  rsvpData.allowWaitlisting = !!allowWaitlisting;
  if (contactHost && hostEmail) rsvpData.hostEmail = hostEmail;
  if (attendeeLimit) rsvpData.attendeeLimit = attendeeLimit;

  props.payload = { ...props.payload, ...rsvpData };
}

export async function onPayloadUpdate(component, props) {
  // Do nothing
}

export async function onRespUpdate(component, props) {
  if (!props.eventDataResp) return;

  if (props.eventDataResp.cloudType === 'CreativeCloud') {
    component.querySelector('#registration-allow-waitlist')?.classList.add('hidden');
  }

  prefillFields(component, props);
}

export default function init(component, props) {
  prefillFields(component, props);
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
