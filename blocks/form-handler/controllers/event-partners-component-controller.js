export function onSubmit(component, props) {
  const partnerVisible = component.querySelector('#partners-visible')?.checked;

  props.payload = { ...props.payload, partnerVisible };
}

export default async function init(component, props) {
  const partnersGroup = component.querySelector('partner-selector-group');

  if (props.payload?.partners) {
    partnersGroup.setAttribute('.selectedPartners', JSON.stringify(props.payload.partners));
  }

  const partnerVisible = component.querySelector('#partners-visible');
  partnerVisible.checked = props.payload?.partnerVisible;
}
