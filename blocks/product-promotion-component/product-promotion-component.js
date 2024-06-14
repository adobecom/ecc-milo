import { getLibs } from '../../scripts/utils.js';
import { getCaasTags } from '../../utils/esp-controller.js';
import { generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));

  const caasTags = await getCaasTags();

  if (!caasTags) return;

  const group = createTag('product-selector-group');
  const uniqueItems = {};
  const products = [];
  Object.values(caasTags.namespaces.caas.tags['product-categories'].tags).map((x) => [...Object.values(x.tags).map((y) => y)]).flat().forEach((item) => {
    if (!uniqueItems[item.name]) {
      uniqueItems[item.name] = true;
      products.push(item);
    }
  });

  group.dataset.products = JSON.stringify(products);

  el.append(group);
}
