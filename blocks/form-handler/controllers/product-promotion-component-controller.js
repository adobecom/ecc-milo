export function onSubmit(component, props) {
  const productGroup = component.querySelector('product-selector-group');

  const selectedProducts = productGroup?.getSelectedProducts();

  if (selectedProducts) {
    const relatedProducts = selectedProducts.map((p) => ({
      name: p.name,
      showProductBlade: p.showProductBlade,
    }));

    props.payload = { ...props.payload, relatedProducts };
  }
}

export default async function init(component, props) {
  const productGroup = component.querySelector('product-selector-group');

  if (props.payload?.relatedProducts) {
    productGroup.setAttribute('.selectedProducts', JSON.stringify(props.payload.relatedProducts));
  }
}
