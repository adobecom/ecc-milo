import { LIBS } from '../../scripts/scripts.js';
import { style } from './custom-search.css.js';

const { LitElement, html, repeat } = await import(`${LIBS}/deps/lit-all.min.js`);

const SEARCH_TIMEOUT_MS = 500;

// eslint-disable-next-line import/prefer-default-export
export class CustomSearch extends LitElement {
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
    this.closeOverlay = () => {};
    this.searchTimeoutId = null;
    this.searchField = null;
    this.openPopoverLock = false;
    this.searchResults = [];
    this.searchResultsPopover = null;
  }

  async updateSearchResults(searchField) {
    const popover = this.shadowRoot.querySelector('sp-popover');

    if (this.isPopoverOpen || this.openPopoverLock) {
      return;
    }

    const searchVal = this.searchInput.toLowerCase();

    this.searchResults = this.searchInput?.trim().length !== 0 && this.searchdata.length > 0
      // eslint-disable-next-line max-len
      ? this.searchdata.filter((item) => (this.searchMap.searchKeys.some((k) => item[k].toLowerCase().includes(searchVal)))) : [];

    if (this.searchResults.length === 0) {
      return;
    }

    this.openPopoverLock = true;
    this.searchResultsPopover = popover;
    const interaction = 'click';
    const options = { placement: 'bottom-start', receivesFocus: 'false' };
    // eslint-disable-next-line max-len, no-underscore-dangle
    this.closeOverlay = await window.__merch__spectrum_Overlay.open(searchField, interaction, popover, options);
    await popover.updateComplete;
    this.openPopoverLock = false;
  }

  async onSearchInput(e) {
    this.searchInput = (e.detail.value);

    const searchField = e.currentTarget;

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
      this.updateSearchResults(searchField);
    }, SEARCH_TIMEOUT_MS);
  }

  closePopover() {
    if (this.closeOverlay) {
      this.closeOverlay();
    }
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
  }}>${this.searchMap.renderKeys.map((rk) => entry[rk]).join(' ')}</sp-menu-item>`)}`;
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
          fielddata=${JSON.stringify(this.fielddata)}
          config=${JSON.stringify(this.config)}
          @input-custom=${this.onSearchInput}
          @submit=${this.onSubmitSearch}
          @change-custom=${(e) => { e.stopPropagation(); this.dispatchEvent(new CustomEvent('change-custom-search', { detail: { value: this.searchInput } })); }}
          @sp-opened=${() => {
    this.isPopoverOpen = true;
  }}
          @sp-closed=${() => {
    this.isPopoverOpen = false;
  }}
          @keydown=${this.handleKeydown}
      ></custom-textfield>
      <sp-popover dialog>
          <sp-menu>${this.renderMenuItems()}</sp-menu>
      </sp-popover>
  `;
  }
}
