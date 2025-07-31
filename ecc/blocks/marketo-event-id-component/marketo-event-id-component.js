import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

async function decorateMarketoEventIdFields(el) {
  const div = createTag('div', { class: 'marketo-event-id' }, '', { parent: el });
  createTag('sp-checkbox', { id: 'mcz-event', size: 'xl' }, "You are using the MCZ Program ID", { parent: div });
  createTag('sp-field-label', { size: 'xl', class: 'field-label' }, 'Adobe Connect MCZ Program ID', { parent: div });
  createTag('sp-textfield', { class: 'field-label', placeholder: 'Enter ID', size: 'l' }, '', { parent: div });
}

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));
  await decorateMarketoEventIdFields(el);
}
