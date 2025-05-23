/* eslint-disable max-len */
import { LIBS } from '../../scripts/scripts.js';
import { style } from './product-selector-group.css.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

const defaultProductValue = {
  name: '',
  title: '[Product name]',
};

export default class ProductSelectorGroup extends LitElement {
  static properties = {
    selectedProducts: { type: Array },
    products: { type: Array },
  };

  constructor() {
    super();
    this.selectedProducts = this.selectedProducts?.length || [defaultProductValue];

    try {
      this.products = JSON.parse(this.dataset.products);
    } catch {
      this.products = [];
    }
  }

  static styles = style;

  addProduct() {
    this.selectedProducts = [...this.selectedProducts, {}];
  }

  deleteProduct(index) {
    this.selectedProducts = this.selectedProducts.filter((_, i) => i !== index);
    if (this.selectedProducts.length === 0) {
      this.selectedProducts = [defaultProductValue];
    }
    this.requestUpdate();
  }

  handleProductUpdate(event, index) {
    const productInfo = event.detail.product;
    const tags = this.products.filter((p) => p.name === productInfo.name);

    const updatedProduct = {
      ...productInfo,
      tags,
    };

    this.selectedProducts = this.selectedProducts
      .map((product, i) => (i === index ? updatedProduct : product));
  }

  getSelectedProducts() {
    return this.selectedProducts.filter((p) => p.name);
  }

  countBlades() {
    return this.selectedProducts.filter((p) => p.showProductBlade).length;
  }

  getUniqueProducts() {
    const uniqueItems = {};
    const uniqueProducts = [];
    this.products.forEach((item) => {
      if (!uniqueItems[item.name]) {
        uniqueItems[item.name] = true;
        uniqueProducts.push(item);
      }
    });

    return uniqueProducts;
  }

  hasOnlyEmptyProductLeft() {
    return !this.selectedProducts[0].name && (this.selectedProducts[0].title === defaultProductValue.title || !this.selectedProducts[0].title);
  }

  render() {
    this.products = this.dataset.products ? JSON.parse(this.dataset.products) : [];
    const uniqueProducts = this.getUniqueProducts();

    if (uniqueProducts.length === 0) return html`<div class="error">No product available for topics selected</div>`;

    return html`
      ${repeat(this.selectedProducts, (product, index) => html`
        <product-selector .selectedProduct=${product} .products=${uniqueProducts} .existingProducts=${this.getSelectedProducts()}
          @update-product=${(event) => this.handleProductUpdate(event, index)}>
          <div slot="delete-btn" class="delete-btn">
            ${this.selectedProducts.length === 1 && this.hasOnlyEmptyProductLeft() ? nothing : html`
              <img class="icon icon-remove-circle" src="${this.selectedProducts.length === 1 ? '/ecc/icons/delete.svg' : '/ecc/icons/remove-circle.svg'}" alt="remove-repeater" @click=${() => this.deleteProduct(index)}></img>
            `}
          </div>
        </product-selector>
      `)}
      ${this.selectedProducts.length < uniqueProducts.length ? html`<repeater-element text="Add product promotion" @repeat=${this.addProduct}></repeater-element>` : nothing}
      
    `;
  }
}
