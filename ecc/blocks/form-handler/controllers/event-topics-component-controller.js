/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (!component.closest('.fragment')?.classList.contains('activated')) return;

  const checkedBoxes = component.querySelectorAll('sp-checkbox[checked]');
  const topics = Array.from(checkedBoxes).map((cb) => cb.name);
  const fullTopicsValue = Array.from(checkedBoxes).map((cb) => cb.dataset.value);

  props.payload = { ...props.payload, topics, fullTopicsValue };
}

export async function onUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  const eventData = props.eventDataResp;
  const checkedBoxes = component.querySelectorAll('sp-checkbox');
  if (eventData.topics?.length !== 0) {
    checkedBoxes.forEach((cb) => {
      if (eventData.topics?.includes(cb.name)) cb.checked = true;
    });

    component.classList.add('prefilled');
  }
}
