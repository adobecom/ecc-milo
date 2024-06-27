/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

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
  const checkBoxes = component.querySelectorAll('sp-checkbox');
  const checkedBoxes = [];
  if (eventData.topics?.length !== 0) {
    checkBoxes.forEach((cb) => {
      if (eventData.topics?.includes(cb.name)) {
        cb.checked = true;
        checkedBoxes.push(cb);
      }
    });

    const topics = checkedBoxes.map((cb) => cb.name);
    const fullTopicsValue = Array.from(checkedBoxes).map((cb) => cb.dataset.value);
    props.payload = { ...props.payload, topics, fullTopicsValue };
    component.classList.add('prefilled');
  }
}
