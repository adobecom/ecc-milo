/* eslint-disable no-unused-vars */
import { getAttribute } from '../../scripts/data-utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const defaultFields = component.dataset.mandatedfields?.split(',');

  const rsvpform = component.querySelector('div > rsvp-form');

  let rsvpFormFields = {};
  const rsvpFormData = rsvpform.getRsvpFormFields();

  rsvpFormFields = {
    visible: [...defaultFields, ...rsvpFormData.visible],
    required: [...defaultFields, ...rsvpFormData.required],
  };

  setPropsPayload(props, { rsvpFormFields });
}

export async function onPayloadUpdate(_component, _props) {
  // Do nothing
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  const eventData = props.eventDataResp;
  const rsvpForm = component.querySelector('div > rsvp-form');
  const eventType = getAttribute(eventData, 'eventType', props.locale);
  rsvpForm.setAttribute('eventType', eventType);
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
