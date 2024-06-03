export default function init(component, props) {

}

export function onSubmit(component, props) {
  const rsvpFormFields = {
    visible: Array.from(component.querySelectorAll('sp-checkbox.check-appear[checked]')).map((f) => f.name),
    required: Array.from(component.querySelectorAll('sp-checkbox.check-require[checked]')).map((f) => f.name),
  };

  props.payload = { ...props.payload, rsvpFormFields };
}
