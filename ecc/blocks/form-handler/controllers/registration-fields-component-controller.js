/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const defaultFields = ['firstName', 'lastName', 'email', 'jobTitle'];

  const rsvpFormFields = {
    visible: [...defaultFields, ...Array.from(component.querySelectorAll('sp-checkbox.check-appear[checked]')).map((f) => f.name)],
    required: [...defaultFields, ...Array.from(component.querySelectorAll('sp-checkbox.check-require[checked]')).map((f) => f.name)],
  };

  props.payload = { ...props.payload, rsvpFormFields };
}

export async function onUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  const eventData = props.eventDataResp;
  const appearChecks = component.querySelectorAll('sp-checkbox.check-appear');
  const requireChecks = component.querySelectorAll('sp-checkbox.check-require');

  appearChecks.forEach((cb) => {
    if (eventData.rsvpFormFields?.visible?.includes(cb.name)) cb.checked = true;
  });

  requireChecks.forEach((cb) => {
    if (eventData.rsvpFormFields?.required?.includes(cb.name)) cb.checked = true;
  });
}
