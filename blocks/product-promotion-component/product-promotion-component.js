import { getLibs } from '../../scripts/utils.js';
import { generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));

  const [caasTags, productsMap] = await Promise.all([
    fetch('https://www.adobe.com/chimera-api/tags')
      .then((resp) => resp.json()).catch((err) => window.lana?.log(`Failed to load products map JSON: ${err}`)),
    fetch('https://main--ecc-milo--adobecom.hlx.page/system/products-map.json')
      .then((resp) => resp.json()).catch((err) => window.lana?.log(`Failed to load products map JSON: ${err}`)),
  ]);

  if (!caasTags || !productsMap) return;

  const group = createTag('product-selector-group');
  group.dataset.products = JSON.stringify(productsMap.data);
  group.dataset.caasTags = JSON.stringify(caasTags.namespaces.caas.tags.mnemonics.tags);

  el.append(group);
}
