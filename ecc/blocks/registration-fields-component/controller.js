/* eslint-disable no-unused-vars */
import { getAttribute } from '../../scripts/data-utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';

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

export async function onPayloadUpdate(_component, _props) {
  // Do nothing
}

export async function onRespUpdate(component, props) {
  const eventData = props.eventDataResp;
  const eventType = getAttribute(eventData, 'eventType', props.locale);

  const rsvpForm = component.querySelector('div > rsvp-form');
  rsvpForm.setAttribute('eventType', eventType);
}

export default function init(component, props) {
  const eventData = props.eventDataResp;
  const eventType = getAttribute(eventData, 'eventType', props.locale);

  const rsvpForm = component.querySelector('div > rsvp-form');
  rsvpForm.setAttribute('eventType', eventType);
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
