export function onSubmit(component, props) {
  const productGroup = component.querySelector('product-selector-group');

  const selectedProducts = productGroup?.getSelectedProducts();

  const relatedProducts = selectedProducts.map((p) => ({
    name: p.title,
    url: p.url,
  }));

  props.payload = { ...props.payload, relatedProducts };
}

export default async function init(component, props) {

}
