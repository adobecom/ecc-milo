import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

async function decorateMarketoEventIdFields(el) {
  const div = createTag('div', { class: 'marketo-event-id' }, '', { parent: el });
  createTag('sp-field-label', { size: 'xl', class: 'field-label' }, 'Marketo Event ID', { parent: div });
  createTag('sp-textfield', { class: 'field-label', placeholder: 'Enter Marketo Event ID', size: 'l' }, '', { parent: div });
}

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));
  await decorateMarketoEventIdFields(el);
}