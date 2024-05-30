export function onSubmit(component, props) {
  const partnerSelectors = component.querySelectorAll('partner-selector');

  const partners = Array.from(partnerSelectors).map((p) => p.getSelectedPartner());

  props.payload = { ...props.payload, partners };
}

export default async function init(component, props) {

}
