import { getLibs } from '../../scripts/utils.js';
import { style } from './product-selector.css.js';

const { LitElement, html, nothing } = await import(`${getLibs()}/deps/lit-all.min.js`);

export default class ProductSelector extends LitElement {
  static properties = {
    products: { type: Array },
    selectedProduct: { type: Object },
    caasTags: { type: Object },
  };

  static styles = style;

  handleSelectChange(event) {
    const productName = event.target.value;
    this.selectedProduct = {
      ...this.products.find((product) => product.name === productName),
      ...this.caasTags[productName],
    };

    this.dispatchEvent(new CustomEvent('update-product', {
      detail: { product: this.selectedProduct },
      bubbles: true,
      composed: true,
    }));

    this.requestUpdate();
  }

  handleCheckChange(event) {
    const showproductLink = event.target.checked;
    this.selectedProduct = {
      ...this.selectedProduct,
      showproductLink,
    };
    this.requestUpdate();
  }

  render() {
    return html`
      <fieldset class="rsvp-field-wrapper">
      ${html`<img class="product-img" src="${this.selectedProduct.tagImage || '/icons/icon-placeholder.svg'}" alt="${this.selectedProduct.title || nothing}">`}  
        <sp-picker class="product-select-input" label="Select a product" value=${this.selectedProduct.name || nothing} @change="${this.handleSelectChange}">
          ${this.products.map((product) => html`<sp-menu-item value="${product.name}">${this.caasTags[product.name].title}
          </sp-menu-item>`)}
        </sp-picker>
        ${html`<sp-checkbox class="checkbox-product-link" @change="${this.handleCheckChange}">Link to ${this.selectedProduct.title || '[Product name]'}</sp-checkbox>`}
        <slot name="delete-btn"></slot>
      </fieldset>
    `;
  }
}
