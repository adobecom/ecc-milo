export default function init(component, props) {
  const appearChecks = component.querySelectorAll('sp-checkbox.check-appear');
  const requireChecks = component.querySelectorAll('sp-checkbox.check-require');

  appearChecks.forEach((cb) => {
    if (props.payload.rsvpFormFields?.visible?.includes(cb.name)) cb.checked = true;
  });

  requireChecks.forEach((cb) => {
    if (props.payload.rsvpFormFields?.required?.includes(cb.name)) cb.checked = true;
  });
}

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const rsvpFormFields = {
    visible: Array.from(component.querySelectorAll('sp-checkbox.check-appear[checked]')).map((f) => f.name),
    required: Array.from(component.querySelectorAll('sp-checkbox.check-require[checked]')).map((f) => f.name),
  };

  props.payload = { ...props.payload, rsvpFormFields };
}
