import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

async function decorateVideoContentFields(el) {
  const div = createTag('div', { class: 'video-content' }, '', { parent: el });
  createTag('sp-field-label', { size: 'xl', class: 'field-label' }, 'Add external URL', { parent: div });
  createTag('sp-textfield', { class: 'field-label', placeholder: 'https://', size: 'l' }, '', { parent: div });
}

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));
  await decorateVideoContentFields(el);
}
