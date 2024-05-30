export function onSubmit(component, props) {
  const partnerSelectors = component.querySelectorAll('partner-selector');
  const partnerVisible = component.querySelector('#partners-visible')?.checked;

  const partners = Array.from(partnerSelectors).map((p) => p.getSelectedPartner());

  props.payload = { ...props.payload, partners, partnerVisible };
}

export default async function init(component, props) {

}
