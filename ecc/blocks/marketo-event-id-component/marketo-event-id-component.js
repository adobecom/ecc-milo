import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

async function decorateMarketoEventIdFields(el) {
  createTag('sp-checkbox', { id: 'mcz-event', size: 'xl' }, 'You are using the MCZ Program ID', { parent: el });
  const div = createTag('div', { class: 'marketo-event-id hidden' }, '', { parent: el });
  createTag('sp-field-label', { size: 'xl', class: 'field-label' }, 'Adobe Connect MCZ Program ID *', { parent: div });
  const wrapper = createTag('div', { id: 'mcz-event-textfield-wrapper' }, '', { parent: div });
  createTag('span', {}, 'MCZ -', { parent: wrapper });
  createTag('sp-textfield', { id: 'mcz-event-id-textfield', class: 'field-label', placeholder: 'Enter Adobe Connect MCZ Program ID', size: 'l', required: true }, '', { parent: wrapper });
}

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));
  await decorateMarketoEventIdFields(el);
}
