import getJoinedData from '../data-handler.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const partnerVisible = component.querySelector('#partners-visible')?.checked;

  props.payload = { ...props.payload, partnerVisible };
}

export default async function init(component, props) {
  const eventData = getJoinedData();
  const partnersGroup = component.querySelector('partner-selector-group');

  if (eventData.partners) {
    partnersGroup.setAttribute('.selectedPartners', JSON.stringify(eventData.partners));
  }

  const partnerVisible = component.querySelector('#partners-visible');
  partnerVisible.checked = eventData.partnerVisible;
}
