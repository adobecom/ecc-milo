import { LIBS } from '../../scripts/scripts.js';
import { getCaasTags } from '../../utils/esp-controller.js';
import { generateToolTip, isEmptyObject } from '../../utils/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

async function buildTopicsCheckboxes(el) {
  const cw = createTag('div', { class: 'checkbox-wrapper' });
  const caasTags = await getCaasTags();

  if (!caasTags) return;

  const productTags = caasTags.namespaces.caas.tags['product-categories'].tags;

  Object.values(productTags).forEach((p) => {
    if (isEmptyObject(p.tags)) return;
    createTag('sp-checkbox', { name: p.title, 'data-value': JSON.stringify(p) }, p.title, { parent: cw });
  });

  el.append(cw);
}

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));
  await buildTopicsCheckboxes(el);
}
