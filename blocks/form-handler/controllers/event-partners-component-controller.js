export function onSubmit(component, props) {
  const partnersGroup = component.querySelector('partner-selector-group');
  const partnerVisible = component.querySelector('#partners-visible')?.checked;

  const partners = partnersGroup?.getSelectedPartners();

  props.payload = { ...props.payload, partners, partnerVisible };
}

export default async function init(component, props) {

}
