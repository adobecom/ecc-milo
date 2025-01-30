/* eslint-disable no-unused-vars */
import { getCaasTags } from '../../scripts/esp-controller.js';
import { handlize } from '../../scripts/utils.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const productGroup = component.querySelector('product-selector-group');

  const selectedProducts = productGroup?.getSelectedProducts();

  if (selectedProducts) {
    const relatedProducts = selectedProducts
      .map((p) => ({
        name: p.title,
        showProductBlade: !!p.showProductBlade,
        tags: p.tags.map((t) => t.tagID).join(','),
      }));

    props.payload = { ...props.payload, relatedProducts };
  } else {
    delete props.payload.relatedProducts;
  }
}

async function updateProductSelector(component, props) {
  const caasTags = await getCaasTags();
  if (!caasTags) return;

  const productGroups = component.querySelectorAll('product-selector-group');
  const products = Object.values(caasTags.namespaces.caas.tags['product-categories'].tags).map((x) => [...Object.values(x.tags).map((y) => y)]).flat();

  productGroups.forEach((pg) => {
    pg.setAttribute('data-products', JSON.stringify(products));
    pg.requestUpdate();

    const selectedProducts = pg.getSelectedProducts();

    selectedProducts.forEach((sp, i) => {
      const isProductAvailable = products.find((p) => p.name === sp.name);

      if (!isProductAvailable) {
        pg.deleteProduct(i);
      }
    });

    pg.shadowRoot.querySelectorAll('product-selector').forEach((ps) => {
      ps.dispatchEvent(new CustomEvent('update-product', {
        detail: { product: ps.selectedProduct },
        bubbles: true,
        composed: true,
      }));
    });
  });
}

export async function onPayloadUpdate(component, props) {
  const { cloudType } = props.payload;

  if (cloudType && cloudType !== component.dataset.cloudType) {
    component.dataset.cloudType = cloudType;
  }

  await updateProductSelector(component, props);
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default async function init(component, props) {
  const { cloudType } = props.payload || props.eventDataResp;
  if (cloudType) component.dataset.cloudType = cloudType;
  const eventData = props.eventDataResp;
  const productGroup = component.querySelector('product-selector-group');

  if (eventData.relatedProducts?.length) {
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

export function onTargetUpdate(component, props) {
  // Do nothing
}
