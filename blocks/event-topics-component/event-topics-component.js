import { getLibs } from '../../scripts/utils.js';
import { generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

async function buildTopicsCheckboxes(el) {
  const cw = createTag('div', { class: 'checkbox-wrapper' });
  const caasResp = await fetch('https://www.adobe.com/chimera-api/tags')
    .then((resp) => (resp.ok ? resp.json() : null))
    .catch((err) => window.lana?.log(`Failed to fetch Chimera tags: ${err}`));

  if (!caasResp) return;

  const productTags = caasResp.namespaces.caas.tags['product-categories'].tags;

  Object.values(productTags).forEach((p) => {
    createTag('sp-checkbox', {}, p.title, { parent: cw });
  });

  el.append(cw);
}

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));
  await buildTopicsCheckboxes(el);
}
