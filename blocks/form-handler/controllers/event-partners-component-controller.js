export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const partnersGroup = component.querySelector('partner-selector-group');
  const partnerVisible = component.querySelector('#partners-visible')?.checked;

  const partners = partnersGroup?.getSelectedPartners();

  props.payload = { ...props.payload, partners, partnerVisible };
}

export default async function init(component, props) {
  const partnersGroup = component.querySelector('partner-selector-group');

  if (props.payload?.partners) {
    partnersGroup.setAttribute('.selectedPartners', JSON.stringify(props.payload.partners));
  }

  const partnerVisible = component.querySelector('#partners-visible');
  partnerVisible.checked = props.payload?.partnerVisible;
}
