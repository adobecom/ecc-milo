/* eslint-disable no-unused-vars */
import { getAttribute } from '../../scripts/data-utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';
import { EVENT_TYPES, LINK_REGEX } from '../../scripts/constants.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const rsvpform = component.querySelector('div > rsvp-form');

  const registrationPayload = rsvpform.getRegistrationPayload();

  const removeData = [];
  if (registrationPayload.registration?.type === 'Marketo') {
    if (!registrationPayload.registration?.formData.match(LINK_REGEX)) {
      setPropsPayload(
        props,
        registrationPayload,
        removeData,
      );
      throw new Error('Please enter a valid website address starting with "https://". For example: https://www.example.com');
    }

    // Remove the rsvpFormFields from the payload only when formUrl is valid
    removeData.push({
      key: 'rsvpFormFields',
      path: '',
    });
  }

  setPropsPayload(
    props,
    registrationPayload,
    removeData,
  );
}

function setMarketoAttributes(rsvpForm, registration) {
  const { formData } = registration;
  rsvpForm.setAttribute('formType', 'marketo');
  rsvpForm.setAttribute('formUrl', formData);
}

function setBasicFormAttributes(rsvpForm, eventData, locale) {
  const rsvpFormFields = getAttribute(eventData, 'rsvpFormFields', locale);
  const visibleFields = new Set(rsvpFormFields?.visible || []);
  const requiredFields = new Set(rsvpFormFields?.required || []);

  rsvpForm.setAttribute('formType', 'basic');
  rsvpForm.visible = visibleFields;
  rsvpForm.required = requiredFields;
}

function setRsvpFormAttributes(props, eventData, component) {
  const eventType = getAttribute(eventData, 'eventType', props.locale);
  const registration = getAttribute(eventData, 'registration', props.locale);

  const rsvpForm = component.querySelector('div > rsvp-form');
  rsvpForm.setAttribute('eventType', eventType);

  if (eventType === EVENT_TYPES.WEBINAR && registration?.type === 'Marketo') {
    setMarketoAttributes(rsvpForm, registration);
  } else {
    setBasicFormAttributes(rsvpForm, eventData, props.locale);
  }
}

export async function onPayloadUpdate(component, props) {
  setRsvpFormAttributes(props, props.payload, component);
}

export async function onRespUpdate(component, props) {
  setRsvpFormAttributes(props, props.eventDataResp, component);
}

export default function init(component, props) {
  setRsvpFormAttributes(props, props.eventDataResp, component);
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
