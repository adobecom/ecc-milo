/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;
}

export async function onPayloadUpdate(_component, _props) {
  // Do nothing
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {

}

export function onEventUpdate(component, props) {
  // Do nothing
}
