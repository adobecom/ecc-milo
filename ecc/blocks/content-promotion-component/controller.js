/* eslint-disable no-unused-vars */
import { getCaasTags } from '../../scripts/caas.js';
import { getAttribute } from '../../scripts/data-utils.js';
import { getEventPageHost, handlize } from '../../scripts/utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const productGroup = component.querySelector('product-selector-group');

  const selectedProducts = productGroup?.getSelectedProducts();

  if (selectedProducts) {
    const relatedProducts = selectedProducts
      .map((p) => ({
        name: p.title,
        showProductBlade: !!p.showProductBlade,
      }));

    setPropsPayload(props, { relatedProducts });
  } else {
    setPropsPayload(props, { relatedProducts: null });
  }
}

async function getPromotionalContentSheet() {
  const data = await fetch(`${getEventPageHost()}/events/default/promotional-content.json`).then((res) => res.json());

  return data;
}

async function updateProductSelector(component, props) {
  const promotionalContent = await getPromotionalContentSheet();
  console.log('promotionalContent', promotionalContent);
  if (!promotionalContent) return;

  const productGroups = component.querySelectorAll('product-selector-group');
  const products = Object.values(caasTags.namespaces.caas.tags['product-categories'].tags)
    .map((x) => [...Object.values(x.tags).map((y) => y)])
    .flat()
    .filter(
      (p) => supportedProducts?.includes(p.title),
    );

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
  const eventData = props.eventDataResp;

  const [
    cloudType,
    relatedProducts,
  ] = [
    getAttribute(eventData, 'cloudType', props.locale),
    getAttribute(eventData, 'relatedProducts', props.locale),
  ];

  if (cloudType) component.dataset.cloudType = cloudType;
  const productGroup = component.querySelector('product-selector-group');

  if (relatedProducts?.length) {
    const selectedProducts = relatedProducts.map((p) => ({
      name: handlize(p.name),
      title: p.name,
      showProductBlade: !!p.showProductBlade,
    }));

    productGroup.selectedProducts = selectedProducts;
    productGroup.requestUpdate();
    component.classList.add('prefilled');
  }
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
