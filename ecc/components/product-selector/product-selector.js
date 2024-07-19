import { LIBS } from '../../scripts/scripts.js';
import { isEmptyObject } from '../../scripts/utils.js';
import { style } from './product-selector.css.js';

const { LitElement, html, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class ProductSelector extends LitElement {
  static properties = {
    products: { type: Array },
    selectedProduct: { type: Object },
    existingProducts: { type: Array },
  };

  constructor() {
    super();
    this.products = this.products || [];
    this.selectedProduct = { showProductBlade: false };
  }

  static styles = style;

  handleSelectChange(event) {
    const productName = event.target.value;
    this.selectedProduct = {
      ...this.selectedProduct,
      ...Object.values(this.products).find((product) => product.name === productName),
    };

    delete this.selectedProduct.isPlaceholder;

    this.dispatchEvent(new CustomEvent('update-product', {
      detail: { product: this.selectedProduct },
      bubbles: true,
      composed: true,
    }));

    this.requestUpdate();
  }

  handleCheckChange(event) {
    const showProductBlade = event.target.checked;
    this.selectedProduct = {
      ...this.selectedProduct,
      showProductBlade,
    };

    this.dispatchEvent(new CustomEvent('update-product', {
      detail: { product: this.selectedProduct },
      bubbles: true,
      composed: true,
    }));

    this.requestUpdate();
  }

  isValidSelection() {
    return this.selectedProduct.name && !isEmptyObject(this.selectedProduct);
  }

  getAvailableProducts() {
    const selectedProducts = this.existingProducts || [];
    return this.products.filter((product) => !selectedProducts.includes(product.name))
      .map((product) => html`<sp-menu-item value="${product.name}">${product.title}</sp-menu-item>`);
  }

  getImageSource() {
    const { tagImage, name } = this.selectedProduct;
    const match = this.products.find((product) => product.name === name);
    return tagImage || match?.tagImage || '/ecc/icons/icon-placeholder.svg';
  }

  render() {
    const { name, title, showProductBlade } = this.selectedProduct;
    const availableProducts = this.getAvailableProducts();
    const imageSource = this.getImageSource();

    return html`
      <fieldset class="rsvp-field-wrapper">
        <img class="product-img" src="${imageSource}" alt="${title || nothing}">
        <sp-picker class="product-select-input" label="Select a product" value=${name || nothing} @change="${this.handleSelectChange}">
          ${availableProducts}
        </sp-picker>
        <sp-checkbox class="checkbox-product-link" .checked=${showProductBlade} .disabled=${!this.isValidSelection()} @change="${this.handleCheckChange}">
          Show ${title || '[Product name]'} product blade on event details page
        </sp-checkbox>
        <slot name="delete-btn"></slot>
      </fieldset>
    `;
  }
}
