/* eslint-disable no-unused-vars */
import { getCaasTags } from '../../scripts/caas.js';
import { handlize } from '../../scripts/utils.js';
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

async function updateProductSelector(component, props) {
  const supportedProducts = [
    'Acrobat Pro',
    'Acrobat Reader',
    'Adobe Express',
    'Adobe Firefly',
    'Adobe Fonts',
    'Adobe Photoshop',
    'Adobe Substance 3D Collection',
    'Adobe Stock',
    'Aero',
    'After Effects',
    'AI Assistant for Acrobat',
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
    'Firefly',
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
  if (!caasTags) return;

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
  const localeEventData = eventData.localizations?.[props.lang] || eventData;
  const { cloudType } = props.payload || localeEventData;
  if (cloudType) component.dataset.cloudType = cloudType;
  const productGroup = component.querySelector('product-selector-group');

  if (localeEventData.relatedProducts?.length) {
    const selectedProducts = localeEventData.relatedProducts.map((p) => ({
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
