/* eslint-disable no-unused-vars */
import { getAttribute } from '../../scripts/data-utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const defaultFields = component.dataset.mandatedfields?.split(',');

  const rsvpFormFields = {
    visible: [...defaultFields, ...Array.from(component.querySelectorAll('input[type="checkbox"].check-appear')).filter((f) => f.checked).map((f) => f.name)],
    required: [...defaultFields, ...Array.from(component.querySelectorAll('input[type="checkbox"].check-require')).filter((f) => f.checked).map((f) => f.name)],
  };

// TODO - Uncomment this when rsvp-form is available
// const rsvpform = component.querySelector('div > rsvp-form');

// const rsvpFormData = rsvpform.getRsvpFormFields();

// const rsvpFormFields = {
//   visible: [...defaultFields, ...rsvpFormData.visible],
//   required: [...defaultFields, ...rsvpFormData.required],
// };

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
  const rsvpFormFields = getAttribute(eventData, 'rsvpFormFields', props.locale);
  const appearChecks = component.querySelectorAll('input[type="checkbox"].check-appear');
  const requireChecks = component.querySelectorAll('input[type="checkbox"].check-require');

  requireChecks.forEach((cb) => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        appearChecks.forEach((ac) => {
          if (ac.name === cb.name) ac.checked = true;
        });
      }
    });
  });

  appearChecks.forEach((cb) => {
    cb.addEventListener('change', () => {
      if (!cb.checked) {
        requireChecks.forEach((rc) => {
          if (rc.name === cb.name) rc.checked = false;
        });
      }
    });
  });

  if (!rsvpFormFields) return;

  appearChecks.forEach((cb) => {
    if (rsvpFormFields.visible?.includes(cb.name)) cb.checked = true;
  });

  requireChecks.forEach((cb) => {
    if (rsvpFormFields.required?.includes(cb.name)) cb.checked = true;
  });
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
