/* eslint-disable no-unused-vars */
import { getCaasTags } from '../../../scripts/esp-controller.js';
import { handlize } from '../../../scripts/utils.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const productGroup = component.querySelector('product-selector-group');

  const selectedProducts = productGroup?.getSelectedProducts();

  if (selectedProducts) {
    const topicsVal = props.payload.fullTopicsValue?.map((x) => JSON.parse(x));
    const relatedProducts = selectedProducts
      .filter((p) => topicsVal.find((t) => p.tagID.includes(t.tagID)))
      .map((p) => ({
        name: p.title,
        showProductBlade: !!p.showProductBlade,
        tags: p.tags.map((t) => t.tagID).join(','),
      }));

    props.payload = { ...props.payload, relatedProducts };
  }
}

async function updateProductSelector(component, props) {
  const supportedProducts = [
    'Acrobat Pro',
    'Acrobat Reader',
    'Adobe Express',
    'Adobe Firefly',
    'Adobe Fonts',
    'Adobe Stock',
    'Aero',
    'After Effects',
    'Animate',
    'Audition',
    'Behance',
    'Bridge',
    'Capture',
    'Character Animator',
    'Color',
    'Creative Cloud Libraries',
    'Dimension',
    'Dreamweaver',
    'Fill & Sign',
    'Frame.io',
    'Fresco',
    'Illustrator',
    'InCopy',
    'InDesign',
    'Lightroom',
    'Lightroom Classic',
    'Media Encoder',
    'Photoshop',
    'Photoshop Express',
    'Portfolio',
    'Premiere Pro',
    'Premiere Rush',
    'Scan',
    'Substance 3D Collection',
  ];
  const caasTags = await getCaasTags();
  const topicsVal = props.payload.fullTopicsValue?.map((x) => JSON.parse(x));
  if (!caasTags || !topicsVal) return;

  const productGroups = component.querySelectorAll('product-selector-group');
  let products = Object.values(caasTags.namespaces.caas.tags['product-categories'].tags).map((x) => [...Object.values(x.tags).map((y) => y)]).flat();

  products = products.filter(
    (p) => topicsVal.find((t) => p.tagID.includes(t.tagID)) && supportedProducts.includes(p.title),
  );

  productGroups.forEach((pg) => {
    pg.setAttribute('data-products', JSON.stringify(products));
    pg.setAttribute('data-selected-topics', JSON.stringify(topicsVal));
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

export async function onUpdate(component, props) {
  await updateProductSelector(component, props);
}

export default async function init(component, props) {
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
