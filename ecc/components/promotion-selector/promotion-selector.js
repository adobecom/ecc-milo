import { LIBS } from '../../scripts/scripts.js';
import { style } from './promotion-selector.css.js';

const { LitElement, html, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class PromotionSelector extends LitElement {
  static properties = {
    promotions: { type: Array },
    selectedPromotion: { type: Object },
    existingPromotions: { type: Array },
  };

  constructor() {
    super();
    this.promotions = this.promotions || [];
    this.selectedPromotion = {};
  }

  static styles = style;

  handleSelectChange(event) {
    const promotionName = event.target.value;
    this.selectedPromotion = this.promotions.find((promotion) => promotion.name === promotionName);

    this.dispatchEvent(new CustomEvent('update-promotion', {
      detail: { promotion: this.selectedPromotion },
      bubbles: true,
      composed: true,
    }));

    this.requestUpdate();
  }

  getAvailablePromotions() {
    const selectedPromotions = this.existingPromotions || [];
    return this.promotions.filter((promotion) => {
      const notSelectedByOthers = !selectedPromotions.some((p) => p.name === promotion.name);
      const isCurrentPromotion = promotion.name === this.selectedPromotion.name;
      return notSelectedByOthers || isCurrentPromotion;
    })
      .map((promotion) => html`<sp-menu-item value="${promotion.name}">${promotion.name}</sp-menu-item>`);
  }

  getImageSource() {
    const { thumbnail, name } = this.selectedPromotion;
    const match = this.promotions.find((promotion) => promotion.name === name);
    return thumbnail || match?.thumbnail || '/ecc/icons/icon-placeholder.svg';
  }

  render() {
    const { name } = this.selectedPromotion;
    const availablePromotions = this.getAvailablePromotions();
    const imageSource = this.getImageSource();

    return html`
      <fieldset class="promotion-field-wrapper">
        <img class="promotion-img" src="${imageSource}" alt="${name || nothing}">
        <sp-picker class="promotion-select-input" label="Select a promotion" value=${name || nothing} @change="${this.handleSelectChange}">
          ${availablePromotions}
        </sp-picker>
        <slot name="delete-btn"></slot>
      </fieldset>
    `;
  }
}
