import { getLibs } from '../../scripts/utils.js';
import { isEmptyObject } from '../../utils/utils.js';
import { style } from './product-selector-group.css.js';

const { LitElement, html, repeat, nothing } = await import(`${getLibs()}/deps/lit-all.min.js`);

const defaultProductValue = {
  showProductBlade: false,
  name: '',
  url: '',
  title: '[Product name]',
  isPlaceholder: true,
};
export default class ProductSelectorGroup extends LitElement {
  static properties = {
    selectedProducts: { type: Array },
    products: { type: Array },
    caasTags: { type: Array },
  };

  constructor() {
    super();
    this.selectedProducts = this.selectedProducts || [defaultProductValue];
    this.products = JSON.parse(this.dataset.products);
    this.caasTags = JSON.parse(this.dataset.caasTags);
  }

  static styles = style;

  addProduct() {
    this.selectedProducts = [...this.selectedProducts, {}];
  }

  deleteProduct(index) {
    this.selectedProducts = this.selectedProducts.filter((_, i) => i !== index);
    this.requestUpdate();
  }

  handleProductUpdate(event, index) {
    const updatedProduct = event.detail.product;
    this.selectedProducts = this.selectedProducts
      .map((Product, i) => (i === index ? updatedProduct : Product));
  }

  getSelectedProducts() {
    return this.selectedProducts.filter((p) => !p.isPlaceholder || !isEmptyObject(p));
  }

  countBlades() {
    return this.selectedProducts.filter((p) => p.showProductBlade).length;
  }

  render() {
    return html`
      ${repeat(this.selectedProducts, (product, index) => html`
        <product-selector .showBladeCheck=${this.countBlades() < 2 || product.showProductBlade} .selectedProduct=${product} .products=${this.products} .caasTags=${this.caasTags}
          @update-product=${(event) => this.handleProductUpdate(event, index)}>
          <div slot="delete-btn" class="delete-btn">
            ${this.selectedProducts.length > 1 ? html`
              <img class="icon icon-remove-circle" src="/icons/remove-circle.svg" alt="remove-repeater" @click=${() => this.deleteProduct(index)}></img>
            ` : nothing}
          </div>
        </product-selector>
      `)}
      <repeater-element text="Add product promotion" @repeat=${this.addProduct}></repeater-element>
    `;
  }
}