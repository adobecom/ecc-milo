/* eslint-disable max-len */
import { LIBS } from '../../scripts/scripts.js';
import { style } from './searchable-picker.css.js';

const { LitElement, html, repeat } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export class SearchablePicker extends LitElement {
  static styles = style;

  static properties = {
    items: { type: Array },
    filteredItems: { type: Array },
    displayValue: { type: String },
    value: { type: String },
    menuOpen: { type: Boolean },
    focusedIndex: { type: Number },
  };

  constructor() {
    super();
    this.items = this.dataset.items ? JSON.parse(this.dataset.items) : [];
    this.filteredItems = [...this.items];
    this.displayValue = this.dataset.displayValue || '';
    this.value = '';
    this.menuOpen = false;
    this.focusedIndex = -1;
    this.isClickInsideMenu = false;
  }

  firstUpdated() {
    this.shadow = this.shadowRoot;
  }

  handleInput(event) {
    const filterValue = event.target.value.toLowerCase();
    this.filteredItems = this.items.filter((i) => i.label.toLowerCase().includes(filterValue));
    this.menuOpen = this.filteredItems.length > 0;
    this.focusedIndex = this.menuOpen ? 0 : -1;
  }

  handleFocus() {
    this.menuOpen = true;
  }

  handleUnfocus() {
    if (!this.isClickInsideMenu) {
      this.menuOpen = false;
    }
    this.isClickInsideMenu = false;
  }

  handleItemClick(event) {
    const selectedItem = event.target;

    this.dispatchEvent(new CustomEvent('picker-change', {
      detail: {
        value: selectedItem.value,
        label: selectedItem.textContent.trim(),
      },
    }));
    this.value = selectedItem.value;
    this.displayValue = selectedItem.textContent.trim();
    this.menuOpen = false;
  }

  handleMouseDownOnItem() {
    this.isClickInsideMenu = true;
  }

  handleKeyDown(event) {
    if (!this.menuOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        this.focusedIndex = (this.focusedIndex + 1) % this.filteredItems.length;
        this.scrollIntoViewIfNeeded(this.focusedIndex);
        break;
      case 'ArrowUp':
        this.focusedIndex = (this.focusedIndex - 1 + this.filteredItems.length) % this.filteredItems.length;
        this.scrollIntoViewIfNeeded(this.focusedIndex);
        break;
      case 'Enter':
        if (this.focusedIndex > -1) {
          this.selectItem(this.filteredItems[this.focusedIndex]);
        }
        break;
      case 'Escape':
        this.menuOpen = false;
        break;
      default:
        break;
    }
  }

  selectItem(item) {
    this.dispatchEvent(new CustomEvent('picker-change', {
      detail: {
        value: item.value,
        label: item.label,
      },
    }));
    this.value = item.value;
    this.displayValue = item.label;
    this.menuOpen = false;
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
        .value=${this.displayValue}
        @input=${this.handleInput}
        @focus=${this.handleFocus}
        @blur=${this.handleUnfocus}
        @keydown=${this.handleKeyDown}
        placeholder="Type to search"
      ></sp-textfield>
      <div class="menu-overlay ${this.menuOpen ? 'open' : ''}">
        <sp-menu>
          ${repeat(this.filteredItems, (item, index) => html`
            <sp-menu-item
              value=${item.value}
              ?active=${this.value === item.value}
              class=${index === this.focusedIndex ? 'focused' : ''}
              @mousedown=${this.handleMouseDownOnItem}
              @click=${this.handleItemClick}
            >
              ${item.label}
            </sp-menu-item>
          `)}
        </sp-menu>
      </div>
    `;
  }
}
