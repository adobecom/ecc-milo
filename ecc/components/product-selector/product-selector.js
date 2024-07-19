import { LIBS } from '../../scripts/scripts.js';
import { isEmptyObject } from '../../scripts/utils.js';
import { style } from './product-selector.css.js';

const { LitElement, html, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class ProductSelector extends LitElement {
  static properties = {
    products: { type: Array },
    selectedProduct: { type: Object },
    groupContainer: { type: Object },
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

  render() {
    const match = this.products.find((product) => product.name === this.selectedProduct.name);
    const availableProducts = this.products.filter((p) => {
      if (this.groupContainer) {
        return !this.groupContainer.getSelectedProducts()
          .find((selectedProduct) => selectedProduct.name === p.name);
      }
      return true;
    }).map((product) => html`<sp-menu-item value="${product.name}">${product.title}
    </sp-menu-item>`);

    return html`
      <fieldset class="rsvp-field-wrapper">
      ${html`<img class="product-img" src="${this.selectedProduct.tagImage || match?.tagImage || '/ecc/icons/icon-placeholder.svg'}" alt="${this.selectedProduct.title || nothing}">`}  
        <sp-picker class="product-select-input" label="Select a product" value=${this.selectedProduct.name || nothing} @change="${this.handleSelectChange}">
          ${availableProducts};
        </sp-picker>
        ${html`<sp-checkbox class="checkbox-product-link" .checked=${this.selectedProduct.showProductBlade} .disabled=${!this.isValidSelection()} @change="${this.handleCheckChange}">Show ${this.selectedProduct.title || '[Product name]'} product blade on event details page</sp-checkbox>`}
        <slot name="delete-btn"></slot>
      </fieldset>
    `;
  }
}
