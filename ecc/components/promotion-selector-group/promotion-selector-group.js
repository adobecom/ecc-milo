/* eslint-disable max-len */
import { LIBS } from '../../scripts/scripts.js';
import { style } from './promotion-selector-group.css.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

const defaultPromotionValue = { name: '' };

export default class PromotionSelectorGroup extends LitElement {
  static properties = {
    selectedPromotions: { type: Array },
    promotions: { type: Array },
  };

  constructor() {
    super();
    this.selectedPromotions = this.selectedPromotions?.length || [defaultPromotionValue];
    this.promotions = this.promotions || [];
  }

  static styles = style;

  addPromotion() {
    this.selectedPromotions = [...this.selectedPromotions, {}];
  }

  deletePromotion(index) {
    this.selectedPromotions = this.selectedPromotions.filter((_, i) => i !== index);
    if (this.selectedPromotions.length === 0) {
      this.selectedPromotions = [defaultPromotionValue];
    }
    this.requestUpdate();
  }

  handlePromotionUpdate(event, index) {
    const promotionInfo = event.detail.promotion;

    this.selectedPromotions = this.selectedPromotions
      .map((promotion, i) => (i === index ? promotionInfo : promotion));
  }

  getSelectedPromotions() {
    return this.selectedPromotions.filter((p) => p.name);
  }

  getUniquePromotions() {
    const uniqueItems = {};
    const uniquePromotions = [];
    this.promotions.forEach((item) => {
      if (!uniqueItems[item.name]) {
        uniqueItems[item.name] = true;
        uniquePromotions.push(item);
      }
    });

    return uniquePromotions;
  }

  hasOnlyEmptyPromotionLeft() {
    return !this.selectedPromotions[0].name && (this.selectedPromotions[0].title === defaultPromotionValue.title || !this.selectedPromotions[0].title);
  }

  render() {
    const uniquePromotions = this.getUniquePromotions();

    if (uniquePromotions.length === 0) return html`<div class="error">No promotion items available for this event</div>`;

    return html`
      ${repeat(this.selectedPromotions, (promotion, index) => html`
        <promotion-selector .selectedPromotion=${promotion} .promotions=${uniquePromotions} .existingPromotions=${this.getSelectedPromotions()}
          @update-promotion=${(event) => this.handlePromotionUpdate(event, index)}>
          <div slot="delete-btn" class="delete-btn">
            ${this.selectedPromotions.length === 1 && this.hasOnlyEmptyPromotionLeft() ? nothing : html`
              <img class="icon icon-remove-circle" src="${this.selectedPromotions.length === 1 ? '/ecc/icons/delete.svg' : '/ecc/icons/remove-circle.svg'}" alt="remove-repeater" @click=${() => this.deletePromotion(index)}></img>
            `}
          </div>
        </promotion-selector>
      `)}
      ${this.selectedPromotions.length < uniquePromotions.length ? html`<repeater-element text="Add promotional item" @repeat=${this.addPromotion}></repeater-element>` : nothing}
      
    `;
  }
}
