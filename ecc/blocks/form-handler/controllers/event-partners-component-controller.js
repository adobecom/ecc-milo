/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (!component.closest('.fragment')?.classList.contains('activated')) return;

  const partnerVisible = component.querySelector('#partners-visible')?.checked;

  props.payload = { ...props.payload, partnerVisible };
}

export async function onUpdate(_component, _props) {
  // Do nothing
}

export default async function init(component, props) {
  const eventData = props.eventDataResp;
  const partnersGroup = component.querySelector('partner-selector-group');

  if (eventData.partners) {
    partnersGroup.setAttribute('.selectedPartners', JSON.stringify(eventData.partners));
  }

  const partnerVisible = component.querySelector('#partners-visible');
  partnerVisible.checked = eventData.partnerVisible;
}
