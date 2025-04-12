import { getAttribute } from '../../scripts/data-utils.js';
import { LIBS } from '../../scripts/scripts.js';
import { addTooltipToEl, changeInputValue, decorateSwitchFieldset } from '../../scripts/utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

const contentMap = {
  CreativeCloud: {
    tooltipText: 'Optionally enable email links to the host or add a description to the RSVP process for your attendees.',
    eventLimit: {
      inputLabelText: 'Attendee limit',
      switchLabelText: 'When limit is reached, disable registration button',
      tooltipText: 'When no limit is set, all users will be admitted into event.',
    },
    contactHost: {
      switchLabelText: 'Contact host',
      tooltipText: 'Contact host is optional.',
    },
  },
  ExperienceCloud: {
    tooltipText: 'Dx events are waitlist only. Call-to-action buttons are will only allow waitlisting.',
    eventLimit: {
      inputLabelText: 'Attendee limit',
      switchLabelText: 'When limit is reached, disable registration button',
      tooltipText: {
        count: 'When no limit is set, all users will be admitted into event.',
        config: 'When selected, disable registration button when limit is reached.',
      },
    },
    allowGuestRegistration: {
      switchLabelText: 'Allow guest registration',
      tooltipText: 'When selected, uesrs can register for events without logging in.',
    },
    contactHost: {
      switchLabelText: 'Contact host',
      tooltipText: 'Contact host is optional.',
    },
  },
};

/* eslint-disable no-unused-vars */
function prefillFields(component, props) {
  const contactHostEl = component.querySelector('#registration-contact-host');
  const hostEmailEl = component.querySelector('#event-host-email-input');
  const attendeeLimitEl = component.querySelector('#attendee-count-input');
  const disbleWaitlistEl = component.querySelector('#registration-disable-waitlist');
  const allowGuestRegistrationEl = component.querySelector('#allow-guest-registration');
  const descriptionEl = component.querySelector('#rsvp-description-rte');

  const eventData = props.eventDataResp;

  if (eventData) {
    const attendeeLimit = getAttribute(eventData, 'attendeeLimit', props.locale);
    const allowWaitlisting = getAttribute(eventData, 'allowWaitlisting', props.locale);
    const rsvpDescription = getAttribute(eventData, 'rsvpDescription', props.locale);
    const hostEmail = getAttribute(eventData, 'hostEmail', props.locale);
    const allowGuestRegistration = getAttribute(eventData, 'allowGuestRegistration', props.locale);

    if (attendeeLimitEl && attendeeLimit) attendeeLimitEl.value = attendeeLimit;
    if (disbleWaitlistEl) disbleWaitlistEl.checked = !allowWaitlisting;
    if (descriptionEl && rsvpDescription) descriptionEl.content = rsvpDescription;
    if (hostEmail) {
      if (contactHostEl) contactHostEl.checked = true;
      if (hostEmailEl) hostEmailEl.value = hostEmail;
    }
    if (allowGuestRegistrationEl) allowGuestRegistrationEl.checked = !!allowGuestRegistration;

    if (attendeeLimit
      || allowWaitlisting
      || hostEmail
      || rsvpDescription
      || allowGuestRegistrationEl) {
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

function decorateRegConfigs(component) {
  const regFieldswrapper = component.querySelector('.registration-configs-wrapper');

  if (!regFieldswrapper) return;

  const { cloudType } = component.dataset;

  if (!contentMap[cloudType]) return;

  const leftCol = createTag('div', { class: 'left-col' });
  const rightCol = createTag('div', { class: 'right-col' });

  const attendeeCountTooltipText = contentMap[cloudType].eventLimit.tooltipText.count;
  const attendeeConfigTooltipText = contentMap[cloudType].eventLimit.tooltipText.config;

  const attendeeConfigsWrapper = createTag('div', { class: 'attendee-configs-wrapper' });
  const fieldset = decorateSwitchFieldset({ id: 'registration-disable-waitlist' }, contentMap[cloudType].eventLimit.switchLabelText);

  if (attendeeConfigTooltipText) addTooltipToEl(attendeeConfigTooltipText, fieldset);

  const attendeeCount = createTag('div', { class: 'attendee-count' });
  const attendeeCountInputWrapper = createTag('div', { class: 'attendee-count-input-wrapper' });
  const label = createTag('label', { for: 'attendee-count-input', class: 'number-input-label' }, contentMap[cloudType].eventLimit.inputLabelText);
  const input = createTag('input', { id: 'attendee-count-input', name: 'attendee-count-input', class: 'number-input', type: 'number', min: 0 });

  attendeeCountInputWrapper.append(label, input);
  attendeeCount.append(attendeeCountInputWrapper);
  if (attendeeCountTooltipText) addTooltipToEl(attendeeCountTooltipText, attendeeCount);

  leftCol.append(attendeeCount);
  rightCol.append(fieldset);
  attendeeConfigsWrapper.append(leftCol, rightCol);
  regFieldswrapper.append(attendeeConfigsWrapper);
}

function decorateHostEmailField(component) {
  const regFieldswrapper = component.querySelector('.registration-configs-wrapper');

  if (!regFieldswrapper) return;

  const leftCol = createTag('div', { class: 'left-col' });
  const rightCol = createTag('div', { class: 'right-col' });

  const fieldset = decorateSwitchFieldset({ id: 'registration-contact-host' }, 'Contact host');
  const input = createTag('sp-textfield', {
    id: 'event-host-email-input',
    class: 'text-input',
    type: 'email',
    size: 's',
  });
  createTag('sp-help-text', { size: 's', slot: 'help-text' }, 'Add host email', { parent: input });

  addTooltipToEl(contentMap[component.dataset.cloudType].contactHost.tooltipText, fieldset);

  rightCol.append(fieldset, input);
  const wrapperDiv = createTag('div', { class: 'host-contact-wrapper' });
  wrapperDiv.append(leftCol, rightCol);

  regFieldswrapper.append(wrapperDiv);
}

function decorateLoginRequirementToggle(component) {
  const regFieldswrapper = component.querySelector('.registration-configs-wrapper');

  if (!regFieldswrapper) return;

  const leftCol = createTag('div', { class: 'left-col' });
  const rightCol = createTag('div', { class: 'right-col' });

  const loginRequirementWrapper = createTag('div', { class: 'login-requirement-wrapper' });
  const fieldset = decorateSwitchFieldset({ id: 'allow-guest-registration' }, 'Allow Guest Registration');
  rightCol.append(fieldset);
  loginRequirementWrapper.append(leftCol, rightCol);

  if (contentMap[component.dataset.cloudType].allowGuestRegistration.tooltipText) {
    addTooltipToEl(contentMap[component.dataset.cloudType]
      .allowGuestRegistration.tooltipText, fieldset);
  }

  regFieldswrapper.append(loginRequirementWrapper);
}

function buildCreativeCloudFields(component) {
  decorateRegConfigs(component);
  decorateHostEmailField(component);
}

function buildExperienceCloudInPersonFields(component) {
  decorateRegConfigs(component);
  decorateLoginRequirementToggle(component);
  decorateHostEmailField(component);
}

function buildExperienceCloudWebinarFields(component) {
  decorateRegConfigs(component);
  decorateLoginRequirementToggle(component);
}

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const attendeeCountInput = component.querySelector('#attendee-count-input');
  const disbleWaitlistingInput = component.querySelector('#registration-disable-waitlist');
  const contactHostInput = component.querySelector('#registration-contact-host');
  const hostEmailInput = component.querySelector('#event-host-email-input');
  const rsvpDescriptionInput = component.querySelector('#rsvp-description-rte-output');
  const guestRegistrationInput = component.querySelector('#allow-guest-registration');

  const attendeeLimitVal = attendeeCountInput ? attendeeCountInput.value?.trim() : null;
  const allowWaitlisting = !disbleWaitlistingInput?.checked;
  const contactHost = contactHostInput?.checked;
  const hostEmail = hostEmailInput?.value?.trim();
  const rsvpDescription = rsvpDescriptionInput?.value || '';
  const allowGuestRegistration = guestRegistrationInput?.checked || false;

  const attendeeLimit = Number.isNaN(+attendeeLimitVal) ? null : +attendeeLimitVal;
  const rsvpData = {};
  const removeData = [];

  rsvpData.rsvpDescription = rsvpDescription;
  rsvpData.allowWaitlisting = !!allowWaitlisting;
  rsvpData.allowGuestRegistration = !!allowGuestRegistration;

  if (contactHost && hostEmail) {
    rsvpData.hostEmail = hostEmail;
  } else {
    removeData.push({
      key: 'hostEmail',
      path: '',
    });
  }

  if (attendeeLimit) rsvpData.attendeeLimit = attendeeLimit;

  setPropsPayload(props, rsvpData, removeData);
}

function updateHeadingTooltip(component) {
  const tooltip = component.querySelector(':scope > div .sp-tooltip');
  if (!tooltip) return;

  const { cloudType } = component.dataset;
  const { tooltipText } = contentMap[cloudType];

  tooltip.textContent = tooltipText;
}

export async function onPayloadUpdate(component, props) {
  const { cloudType, eventType } = props.payload;
  const eventTypeChange = eventType && eventType !== component.dataset.eventType;
  const cloudTypeChange = cloudType && cloudType !== component.dataset.cloudType;

  if (eventTypeChange) component.dataset.eventType = eventType;
  if (cloudTypeChange) component.dataset.cloudType = cloudType;
  if (cloudTypeChange || eventTypeChange) {
    const registrationConfigsWrapper = component.querySelector('.registration-configs-wrapper');

    if (!registrationConfigsWrapper) return;

    registrationConfigsWrapper.innerHTML = '';

    if (cloudType === 'CreativeCloud') {
      buildCreativeCloudFields(component);
    }

    if (cloudType === 'ExperienceCloud') {
      switch (eventType) {
        case 'InPerson':
          buildExperienceCloudInPersonFields(component);
          break;
        case 'Webinar':
          buildExperienceCloudWebinarFields(component);
          break;
        default:
          break;
      }
    }

    updateHeadingTooltip(component);
  }
}

export async function onRespUpdate(component, props) {
  if (!props.eventDataResp) return;

  prefillFields(component, props);
}

export default function init(component, props) {
  const descriptionRTE = component.querySelector('#rsvp-description-rte');
  const descriptionRTEOutput = component.querySelector('#rsvp-description-rte-output');

  if (descriptionRTE) {
    descriptionRTE.handleInput = (output) => {
      changeInputValue(descriptionRTEOutput, 'value', output);
    };
  }
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
