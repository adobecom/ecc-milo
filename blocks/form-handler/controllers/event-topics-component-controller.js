export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const checkedBoxes = component.querySelectorAll('sp-checkbox[checked]');
  const topics = Array.from(checkedBoxes).map((cb) => cb.name);
  const fullTopicsValue = Array.from(checkedBoxes).map((cb) => cb.dataset.value);

  props.payload = { ...props.payload, topics, fullTopicsValue };
}

export default function init(component, props) {
  const eventData = props.eventDataResp;
  const checkedBoxes = component.querySelectorAll('sp-checkbox');
  checkedBoxes.forEach((cb) => {
    if (eventData.topics?.includes(cb.name)) cb.checked = true;
  });
}
