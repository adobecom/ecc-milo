import { getLibs } from '../../scripts/utils.js';
import { generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));

  const caasTags = await fetch('https://www.adobe.com/chimera-api/tags')
    .then((resp) => resp.json()).catch((err) => window.lana?.log(`Failed to load products map JSON: ${err}`));

  if (!caasTags) return;

  const group = createTag('product-selector-group');
  group.dataset.products = JSON.stringify(caasTags.namespaces.caas.tags.mnemonics.tags);

  el.append(group);
}
