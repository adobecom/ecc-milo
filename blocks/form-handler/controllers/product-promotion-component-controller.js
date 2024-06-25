import getJoinedData from '../data-handler.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const productGroup = component.querySelector('product-selector-group');

  const selectedProducts = productGroup?.getSelectedProducts();

  if (selectedProducts) {
    const relatedProducts = selectedProducts.map((p) => ({
      name: p.title,
      showProductBlade: !!p.showProductBlade,
      tagIds: p.tagIds.map((t) => t.tagID),
    }));

    props.payload = { ...props.payload, relatedProducts };
  }
}

export default async function init(component) {
  const eventData = getJoinedData();
  const productGroup = component.querySelector('product-selector-group');

  if (eventData.relatedProducts) {
    productGroup.setAttribute('.selectedProducts', JSON.stringify(eventData.relatedProducts));
  }
}
