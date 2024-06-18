import getJoinedOutput from '../data-handler.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const checkedBoxes = component.querySelectorAll('sp-checkbox[checked]');
  const topics = Array.from(checkedBoxes).map((cb) => cb.name);

  props.payload = { ...props.payload, topics };
}

export default function init(component, props) {
  const eventData = getJoinedOutput(props.payload, props.response);
  const checkedBoxes = component.querySelectorAll('sp-checkbox');
  checkedBoxes.forEach((cb) => {
    if (eventData.topics?.includes(cb.name)) cb.checked = true;
  });
}
