import getJoinedOutput from '../data-handler.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const partnersGroup = component.querySelector('partner-selector-group');
  const partnerVisible = component.querySelector('#partners-visible')?.checked;

  const partners = partnersGroup?.getSelectedPartners();

  props.payload = { ...props.payload, partners, partnerVisible };
}

export default async function init(component, props) {
  const eventData = getJoinedOutput(props.payload, props.response);
  const partnersGroup = component.querySelector('partner-selector-group');

  if (eventData.partners) {
    partnersGroup.setAttribute('.selectedPartners', JSON.stringify(eventData.partners));
  }

  const partnerVisible = component.querySelector('#partners-visible');
  partnerVisible.checked = eventData.partnerVisible;
}
