import { LIBS } from '../../../scripts/scripts.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function decorateSwitchFieldset(attr, textContent) {
  const fieldset = createTag('fieldset', { class: 'switch-wrapper' });
  const checkbox = createTag('input', { ...attr, type: 'checkbox', class: 'hidden' });
  const spLabel = createTag('sp-label', {}, textContent);
  const switchLabel = createTag('label', { class: 'custom-switch' });
  switchLabel.append(checkbox);
  fieldset.append(switchLabel, spLabel);

  return fieldset;
}

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

function decorateRegFullConfigsRadios(component) {
  const attendeeFieldswrapper = component.querySelector('.attendee-configs-wrapper');

  if (!attendeeFieldswrapper) return;
  const fieldset = decorateSwitchFieldset({ id: 'registration-disable-waitlist' }, 'When limit is reached, disable registration button');
  attendeeFieldswrapper.append(fieldset);
}

function decorateAttendeeCountField(component) {
  const attendeeFieldswrapper = component.querySelector('.attendee-configs-wrapper');

  if (!attendeeFieldswrapper) return;

  const attendeeCount = createTag('div', { class: 'attendee-count' });
  const input = createTag('input', { id: 'attendee-count-input', name: 'attendee-count-input', class: 'number-input', type: 'number', min: 0 });
  const label = createTag('label', { for: 'attendee-count-input', class: 'number-input-label' }, 'Registration limit');
  attendeeCount.append(input, label);

  attendeeFieldswrapper.append(attendeeCount);
}

function decorateHostEmailField(component) {
  const attendeeConfigsWrapper = component.querySelector('.attendee-configs-wrapper');
  const fieldset = decorateSwitchFieldset({ id: 'registration-contact-host' }, 'Contact host');
  const input = createTag('sp-textfield', {
    id: 'event-host-email-input',
    class: 'text-input',
    type: 'email',
    size: 's',
  });
  createTag('sp-help-text', {}, 'Add host email', { parent: input });

  const wrapperDiv = createTag('div', { class: 'host-contact-wrapper' });
  wrapperDiv.append(fieldset, input);

  attendeeConfigsWrapper.append(wrapperDiv);
}

function buildCreativeCloudFields(component) {
  decorateRegFullConfigsRadios(component);
  decorateAttendeeCountField(component);
  decorateHostEmailField(component);
}

function buildExperienceCloudInPersonFields(component) {

}

function buildExperienceCloudWebinarFields(component) {

}

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const attendeeLimitVal = component.querySelector('#attendee-count-input')?.value?.trim();
  const allowWaitlisting = component.querySelector('#registration-disable-waitlist')?.checked === false;
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
  const { cloudType, format } = props.payload;
  if (cloudType && cloudType !== component.dataset.cloudType) {
    const attendeeConfigsWrapper = component.querySelector('.attendee-configs-wrapper');
    attendeeConfigsWrapper.innerHTML = '';

    if (cloudType === 'CreativeCloud') {
      buildCreativeCloudFields(component);
    }

    if (cloudType === 'DX') {
      switch (format) {
        case 'inPerson':
          buildExperienceCloudInPersonFields(component);
          break;
        case 'webinar':
          buildExperienceCloudWebinarFields(component);
          break;
        default:
          break;
      }
    }
  } else if (format && format !== component.dataset.format) {
    switch (format) {
      case 'inPerson':
        buildExperienceCloudInPersonFields(component);
        break;
      case 'webinar':
        buildExperienceCloudWebinarFields(component);
        break;
      default:
        break;
    }
  }
}

export async function onRespUpdate(component, props) {
  if (!props.eventDataResp) return;

  prefillFields(component, props);
}

export default function init(component, props) {
  component.dataset.cloudType = props.payload.cloudType || props.eventDataResp.cloudType;
  component.dataset.format = props.payload.format || props.eventDataResp.format;

  switch (component.dataset.cloudType) {
    case 'CreativeCloud':
      buildCreativeCloudFields(component);
      break;
    case 'ExperienceCloud':
      switch (component.dataset.format) {
        case 'inPerson':
          buildExperienceCloudInPersonFields(component);
          break;
        case 'webinar':
          buildExperienceCloudWebinarFields(component);
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }

  prefillFields(component, props);
}

export function onEventUpdate(component, props) {
  // Do nothing
}
