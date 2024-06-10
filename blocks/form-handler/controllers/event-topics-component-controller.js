export function onSubmit(component, props) {
  const checkedBoxes = component.querySelectorAll('sp-checkbox[checked]');
  const topics = Array.from(checkedBoxes).map((cb) => cb.name);

  props.payload = { ...props.payload, topics };
}

export default function init(component, props) {
  const checkedBoxes = component.querySelectorAll('sp-checkbox');
  checkedBoxes.forEach((cb) => {
    if (props.payload.topics.includes(cb.name)) cb.checked = true;
  });
}
