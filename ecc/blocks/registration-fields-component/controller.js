/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const defaultFields = component.dataset.mandatedfields?.split(',');

  const rsvpFormFields = {
    visible: [...defaultFields, ...Array.from(component.querySelectorAll('input[type="checkbox"].check-appear')).filter((f) => f.checked).map((f) => f.name)],
    required: [...defaultFields, ...Array.from(component.querySelectorAll('input[type="checkbox"].check-require')).filter((f) => f.checked).map((f) => f.name)],
  };

  props.payload = { ...props.payload, rsvpFormFields };
}

export async function onPayloadUpdate(_component, _props) {
  // Do nothing
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  const eventData = props.eventDataResp;
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

  if (!eventData.rsvpFormFields) return;

  appearChecks.forEach((cb) => {
    if (eventData.rsvpFormFields?.visible?.includes(cb.name)) cb.checked = true;
  });

  requireChecks.forEach((cb) => {
    if (eventData.rsvpFormFields?.required?.includes(cb.name)) cb.checked = true;
  });
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
