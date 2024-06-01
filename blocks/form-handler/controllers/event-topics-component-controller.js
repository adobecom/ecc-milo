export default function init(component, props) {

}

export function onSubmit(component, props) {
  const checkedBoxes = component.querySelectorAll('sp-checkbox[checked]');
  const topics = Array.from(checkedBoxes).map((cb) => JSON.parse(cb.dataset.tagValue));

  props.payload = { ...props.payload, topics };
}