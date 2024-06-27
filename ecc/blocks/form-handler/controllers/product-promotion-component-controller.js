/* eslint-disable no-unused-vars */
import { getCaasTags } from '../../../utils/esp-controller.js';
import { handlize } from '../../../utils/utils.js';

export function onSubmit(component, props) {
  if (!component.closest('.fragment')?.classList.contains('activated')) return;

  const productGroup = component.querySelector('product-selector-group');

  const selectedProducts = productGroup?.getSelectedProducts();

  if (selectedProducts) {
    const relatedProducts = selectedProducts.map((p) => ({
      name: p.title,
      showProductBlade: !!p.showProductBlade,
      tags: p.tags.map((t) => t.tagID).join(','),
    }));

    props.payload = { ...props.payload, relatedProducts };
  }
}

async function updateProductSelector(component, props) {
  const caasTags = await getCaasTags();
  const topicsVal = props.payload.fullTopicsValue?.map((x) => JSON.parse(x));
  if (!caasTags || !topicsVal) return;

  const productGroups = component.querySelectorAll('product-selector-group');
  let products = Object.values(caasTags.namespaces.caas.tags['product-categories'].tags).map((x) => [...Object.values(x.tags).map((y) => y)]).flat();

  products = products.filter((p) => topicsVal.find((t) => p.tagID.includes(t.tagID)));

  productGroups.forEach((p) => {
    p.setAttribute('data-products', JSON.stringify(products));
    p.setAttribute('data-selected-topics', JSON.stringify(topicsVal));
    p.requestUpdate();

    p.shadowRoot.querySelectorAll('product-selector').forEach((ps) => {
      ps.dispatchEvent(new CustomEvent('update-product', {
        detail: { product: ps.selectedProduct },
        bubbles: true,
        composed: true,
      }));
    });
  });
}

export async function onUpdate(component, props) {
  await updateProductSelector(component, props);
}

export default async function init(component, props) {
  const eventData = props.eventDataResp;
  const productGroup = component.querySelector('product-selector-group');

  if (eventData.relatedProducts) {
    const selectedProducts = eventData.relatedProducts.map((p) => ({
      name: handlize(p.name),
      title: p.name,
      showProductBlade: !!p.showProductBlade,
      tags: p.tags.split(',').map((tagID) => ({ tagID })),
    }));

    productGroup.selectedProducts = selectedProducts;
    productGroup.requestUpdate();
    component.classList.add('prefilled');
  }
}
