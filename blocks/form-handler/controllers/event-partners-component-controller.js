export function onSubmit(component, props) {

}

export default async function init(component, props) {
  const partners = await fetch(component.dataset.configUrl).then((resp) => resp.json()).catch((err) => window.lana?.log(`Failed to load RSVP fields config: ${err}`));

  if (!partners) return;

  const fieldsets = component.querySelectorAll('.rsvp-field-wrapper');

  fieldsets.forEach((fieldset) => {
    const picker = fieldset.querySelector('.partner-select-input');
    const img = fieldset.querySelector('.partner-img');
    const checkbox = fieldset.querySelector('.checkbox-partner-link');
    const originalCheckboxText = checkbox.textContent;

    picker.addEventListener('change', () => {
      const partnerPicked = partners.data.find((partner) => partner.name === picker.value);
      img.src = partnerPicked.imageUrl;
      checkbox.textContent = originalCheckboxText;
      checkbox.textContent = checkbox.textContent.replace('[Partner name]', partnerPicked.name);
    });
  });
}
