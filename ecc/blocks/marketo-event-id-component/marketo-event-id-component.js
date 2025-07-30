import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

async function decorateMarketoEventIdFields(el) {
  const div = createTag('div', { class: 'marketo-event-id' }, '', { parent: el });
  const isMCZ = createTag('sp-checkbox', { id: 'mcz-event', size: 'xl' }, "You are using the MCZ Program ID", { parent: div });
  isMCZ.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const textfield = div.querySelector('sp-textfield');
    (isChecked)?textfield.value = 'mcz':textfield.value = '';
  });
  createTag('sp-field-label', { size: 'xl', class: 'field-label' }, 'Adobe Connect MCZ Program ID', { parent: div });
  createTag('sp-textfield', { class: 'field-label', placeholder: 'Enter Adobe Connect MCZ Program ID', size: 'l', disabled: true }, '', { parent: div });
}

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));
  await decorateMarketoEventIdFields(el);
}
