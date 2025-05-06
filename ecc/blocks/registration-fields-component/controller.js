/* eslint-disable no-unused-vars */
import { getAttribute } from '../../scripts/data-utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';
import { EVENT_TYPES } from '../../scripts/constants.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const defaultFields = component.dataset.mandatedfields?.split(',');

  const rsvpform = component.querySelector('div > rsvp-form');

  const registrationPayload = rsvpform.getRegistrationPayload();

  const removeData = [];
  if (registrationPayload.registration?.type === 'Marketo') {
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
  const { formUrl } = registration;
  rsvpForm.setAttribute('formType', 'marketo');
  rsvpForm.setAttribute('formUrl', formUrl);
}

function setBasicFormAttributes(rsvpForm, eventData, locale) {
  const rsvpFormFields = getAttribute(eventData, 'rsvpFormFields', locale);
  const visibleFields = new Set(rsvpFormFields?.visible || []);
  const requiredFields = new Set(rsvpFormFields?.required || []);

  rsvpForm.setAttribute('formType', 'basic');
  rsvpForm.visible = visibleFields;
  rsvpForm.required = requiredFields;
}

function setRsvpFormAttributes(props, component) {
  const eventData = props.eventDataResp;
  const eventType = getAttribute(eventData, 'eventType', props.locale);
  const registration = getAttribute(eventData, 'registration', props.locale);

  const rsvpForm = component.querySelector('div > rsvp-form');
  rsvpForm.setAttribute('eventType', eventType);

  if (eventType === EVENT_TYPES.ONLINE && registration?.type === 'Marketo') {
    setMarketoAttributes(rsvpForm, registration);
  } else {
    setBasicFormAttributes(rsvpForm, eventData, props.locale);
  }
}

export async function onPayloadUpdate(component, props) {
  setRsvpFormAttributes(props, component);
}

export async function onRespUpdate(component, props) {
  setRsvpFormAttributes(props, component);
}

export default function init(component, props) {
  setRsvpFormAttributes(props, component);
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
