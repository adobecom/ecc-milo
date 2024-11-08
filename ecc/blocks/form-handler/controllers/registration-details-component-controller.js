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

function decorateRegConfigsRadios(component) {
  const regFieldswrapper = component.querySelector('.registration-configs-wrapper');

  if (!regFieldswrapper) return;

  const { cloudType } = component.dataset;

  let labelText = '';

  switch (cloudType) {
    case 'ExperienceCloud':
      labelText = 'Waitlist limit';
      break;
    case 'CreativeCloud':
    default:
      labelText = 'Registration limit';
      break;
  }

  const attendeeConfigsWrapper = createTag('div', { class: 'attendee-configs-wrapper' });
  const fieldset = decorateSwitchFieldset({ id: 'registration-disable-waitlist' }, 'When limit is reached, disable registration button');

  const attendeeCount = createTag('div', { class: 'attendee-count' });
  const input = createTag('input', { id: 'attendee-count-input', name: 'attendee-count-input', class: 'number-input', type: 'number', min: 0 });
  const label = createTag('label', { for: 'attendee-count-input', class: 'number-input-label' }, labelText);
  attendeeCount.append(input, label);

  attendeeConfigsWrapper.append(fieldset, attendeeCount);
  regFieldswrapper.append(attendeeConfigsWrapper);
}

function decorateHostEmailField(component) {
  const regFieldswrapper = component.querySelector('.registration-configs-wrapper');

  if (!regFieldswrapper) return;

  const fieldset = decorateSwitchFieldset({ id: 'registration-contact-host' }, 'Contact host');
  const input = createTag('sp-textfield', {
    id: 'event-host-email-input',
    class: 'text-input',
    type: 'email',
    size: 's',
  });
  createTag('sp-help-text', { size: 's', slot: 'help-text' }, 'Add host email', { parent: input });

  const wrapperDiv = createTag('div', { class: 'host-contact-wrapper' });
  wrapperDiv.append(fieldset, input);

  regFieldswrapper.append(wrapperDiv);
}

function decorateLoginRequirementToggle(component) {
  const regFieldswrapper = component.querySelector('.registration-configs-wrapper');

  if (!regFieldswrapper) return;

  const loginRequirementWrapper = createTag('div', { class: 'login-requirement-wrapper' });
  const fieldset = decorateSwitchFieldset({ id: 'registration-login-required' }, 'Require login to register');
  loginRequirementWrapper.append(fieldset);

  regFieldswrapper.append(loginRequirementWrapper);
}

function buildCreativeCloudFields(component) {
  decorateRegConfigsRadios(component);
  decorateHostEmailField(component);
}

function buildExperienceCloudInPersonFields(component) {
  decorateRegConfigsRadios(component);
  decorateLoginRequirementToggle(component);
  decorateHostEmailField(component);
}

function buildExperienceCloudWebinarFields(component) {
  decorateRegConfigsRadios(component);
  decorateLoginRequirementToggle(component);
}

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const attendeeCountInput = component.querySelector('#attendee-count-input');
  const allowWaitlistingInput = component.querySelector('#registration-disable-waitlist');
  const contactHostInput = component.querySelector('#registration-contact-host');
  const hostEmailInput = component.querySelector('#event-host-email-input');
  const rsvpDescriptionInput = component.querySelector('#rsvp-form-detail-description');
  const signInRequiredInput = component.querySelector('#registration-login-required');

  const attendeeLimitVal = attendeeCountInput ? attendeeCountInput.value?.trim() : null;
  const allowWaitlisting = allowWaitlistingInput?.checked;
  const contactHost = contactHostInput?.checked;
  const hostEmail = hostEmailInput?.value?.trim();
  const rsvpDescription = rsvpDescriptionInput?.value || '';
  const signInRequired = signInRequiredInput ? signInRequiredInput.checked : true;

  const attendeeLimit = Number.isNaN(+attendeeLimitVal) ? null : +attendeeLimitVal;

  const rsvpData = {};

  rsvpData.rsvpDescription = rsvpDescription;
  rsvpData.allowWaitlisting = !!allowWaitlisting;
  rsvpData.signInRequired = !!signInRequired;
  if (contactHost && hostEmail) rsvpData.hostEmail = hostEmail;
  if (attendeeLimit) rsvpData.attendeeLimit = attendeeLimit;

  props.payload = { ...props.payload, ...rsvpData };
}

export async function onPayloadUpdate(component, props) {
  const { cloudType, format } = props.payload;
  if (cloudType && cloudType !== component.dataset.cloudType) {
    const registrationConfigsWrapper = component.querySelector('.registration-configs-wrapper');

    if (!registrationConfigsWrapper) return;

    registrationConfigsWrapper.innerHTML = '';

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
