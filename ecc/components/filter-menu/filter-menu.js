/* eslint-disable max-len */
import { LIBS } from '../../scripts/scripts.js';
import { camelToSentenceCase } from '../../scripts/utils.js';
import { style } from './filter-menu.css.js';

const { LitElement, html, repeat } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export class FilterMenu extends LitElement {
  static styles = style;

  static properties = {
    type: { type: String },
    items: { type: Array },
    selectedItems: { type: Array },
  };

  constructor() {
    super();
    this.displayValue = 'Select filters';
    this.selectedItems = [];
  }

  selectItem(e) {
    const selectedItems = e.target.value;
    this.selectedItems = selectedItems ? selectedItems.split(',') : [];

    this.dispatchEvent(new CustomEvent('filter-change', {
      detail: {
        type: this.type,
        value: this.selectedItems,
      },
    }));

    const typeName = camelToSentenceCase(this.type).toLowerCase();
    const filterCount = this.selectedItems.length;
    this.displayValue = this.selectedItems.length ? `${filterCount} ${filterCount === 1 ? `${typeName} filter` : `${typeName} filters`} selected` : 'Select filters';
  }

  scrollIntoViewIfNeeded(index) {
    const menuItem = this.shadowRoot.querySelectorAll('sp-menu-item')[index];
    if (menuItem) {
      menuItem.scrollIntoView({ block: 'nearest' });
    }
  }

  render() {
    return html`
      <sp-textfield
        id=${this.type}-filter-trigger
        allowed-keys=none
        .value=${this.displayValue}
      ></sp-textfield>
      <sp-overlay trigger=${this.type}-filter-trigger@click placement="bottom">
        <sp-popover>
          <sp-menu
            selects="multiple"
            @change="${this.selectItem}">
            ${repeat(this.items, (item) => html`
              <sp-menu-item value=${item}>
                ${item}
              </sp-menu-item>
            `)}
          </sp-menu>
        </sp-popover>
      </sp-overlay>
    `;
  }
}
