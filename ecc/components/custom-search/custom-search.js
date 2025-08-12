import { LIBS } from '../../scripts/scripts.js';
import { style } from './custom-search.css.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

const SEARCH_TIMEOUT_MS = 500;

export default class CustomSearch extends LitElement {
  static properties = {
    identifier: { type: String },
    searchMap: { type: Object },
    searchInput: { type: String },
    isPopoverOpen: { type: Boolean },
    config: { type: Object, reflect: true },
    fielddata: { type: Object, reflect: true },
    searchdata: { type: Array },
    searchResults: { type: Array },
  };

  static styles = style;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.identifier = '';
    this.searchMap = { searchKeys: [], renderKeys: [] };
    this.searchInput = '';
    this.isPopoverOpen = false;
    this.searchTimeoutId = null;
    this.searchField = null;
    this.openPopoverLock = false;
    this.searchResults = [];
    this.searchResultsPopover = null;
    this.isClickInsideMenu = false;
    this.isKeyboardNavigation = false;
  }

  async updateSearchResults() {
    if (this.isPopoverOpen || this.openPopoverLock) {
      return;
    }

    const searchVal = this.searchInput.toLowerCase();

    this.searchResults = this.searchInput?.trim().length !== 0 && this.searchdata.length > 0
      // eslint-disable-next-line max-len
      ? this.searchdata.filter((item) => (item.value.toLowerCase().includes(searchVal))) : [];

    if (this.searchResults.length === 0) {
      return;
    }

    this.openPopoverLock = true;
    this.searchResultsPopover = this.shadowRoot.querySelector('.menu-overlay');

    await this.updateComplete;
    this.openPopoverLock = false;
  }

  async onSearchInput(e) {
    this.searchInput = (e.detail.value);

    if (!this.searchInput || this.searchInput.length === 0) {
      this.closePopover();
      return;
    }

    // Clear any existing timeout
    if (this.searchTimeoutId) {
      clearTimeout(this.searchTimeoutId);
      this.searchTimeoutId = null;
    }

    this.searchTimeoutId = setTimeout(() => {
      this.updateSearchResults();
    }, SEARCH_TIMEOUT_MS);
  }

  closePopover() {
    this.searchResults = [];
  }

  handleBlur() {
    // Delay closing to allow for item selection and keyboard navigation
    setTimeout(() => {
      if (!this.isClickInsideMenu && !this.isKeyboardNavigation) {
        this.closePopover();
      }
      this.isClickInsideMenu = false;
      this.isKeyboardNavigation = false;
    }, 150);
  }

  handleMouseDownOnMenu() {
    this.isClickInsideMenu = true;
  }

  handleMenuFocus() {
    this.isKeyboardNavigation = true;
  }

  handleMenuBlur() {
    // When menu loses focus, check if we're still within the component
    setTimeout(() => {
      const { activeElement } = this.shadowRoot;
      if (!activeElement || activeElement === this.shadowRoot.querySelector('custom-textfield')) {
        this.closePopover();
      }
    }, 50);
  }

  handleClickOutside = (event) => {
    if (!this.shadowRoot.contains(event.target)) {
      this.closePopover();
    }
  };

  handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      this.closePopover();
    }
  };

  connectedCallback() {
    super.connectedCallback();
    // Add global event listeners
    document.addEventListener('click', this.handleClickOutside);
    document.addEventListener('keydown', this.handleEscapeKey);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Remove global event listeners
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleEscapeKey);
  }

  handleCommonActionsOnCLick() {
    this.closePopover();
    // Clear any existing timeout
    if (this.searchTimeoutId) {
      clearTimeout(this.searchTimeoutId);
      this.searchTimeoutId = null;
    }
  }

  selectEntry(entryData) {
    this.dispatchEvent(
      new CustomEvent(
        'entry-selected',
        { detail: { entryData: { ...entryData } } },
      ),
    );
  }

  renderMenuItems() {
    return html` 
        ${repeat(this.searchResults, (item) => item[this.identifier], (entry) => html`
        <sp-menu-item @click=${() => {
    this.selectEntry(entry);
    this.handleCommonActionsOnCLick();
  }}>
    <div class="search-row" style="
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;">
    ${this.config.showImage ? html`<img src=${entry.image || '/ecc/icons/icon-placeholder.svg'} class="search-row-image" style="
    width: 24px;
    height: 24px;
    object-fit: cover;
${this.config.thumbnailType === 'circle' ? 'border-radius: 24px;' : ''}
"></img>` : nothing}
      ${entry.displayValue}
    </div>
  </sp-menu-item>`)}`;
  }

  onSubmitSearch(e) {
    e.stopPropagation();
    e.preventDefault();
    this.closePopover();
  }

  // eslint-disable-next-line class-methods-use-this
  handleKeydown(event) {
    const { code } = event;
    const shouldFocusResultsList = code === 'ArrowDown' || code === 'ArrowUp';
    if (shouldFocusResultsList) {
      event.preventDefault();
      event.stopPropagation();
      const spMenu = (this.searchResultsPopover.querySelector('sp-menu-item'));
      spMenu?.setAttribute('focused', 'true');
      spMenu?.focus();
    }
  }

  render() {
    return html`
      <custom-textfield 
          id="search-trigger"
          fielddata=${JSON.stringify(this.fielddata)}
          config=${JSON.stringify(this.config)}
          @input-custom=${this.onSearchInput}
          @submit=${this.onSubmitSearch}
          @change-custom=${(e) => { e.stopPropagation(); this.dispatchEvent(new CustomEvent('change-custom-search', { detail: { value: this.searchInput } })); }}
          @blur=${this.handleBlur}
          @sp-opened=${() => {
    this.isPopoverOpen = true;
  }}
          @sp-closed=${() => {
    this.isPopoverOpen = false;
  }}
          @keydown=${this.handleKeydown}
      ></custom-textfield>
      <div class="menu-overlay ${this.searchResults.length > 0 ? 'open' : ''}" @mousedown=${this.handleMouseDownOnMenu}>
        <sp-menu @focus=${this.handleMenuFocus} @blur=${this.handleMenuBlur}>${this.renderMenuItems()}</sp-menu>
      </div>
  `;
  }
}
