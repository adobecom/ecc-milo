import { LIBS } from '../../scripts/scripts.js';
import { style } from './marketo-id-modal.css.js';

// Import Spectrum Web Components
const loadSpectrumComponents = async () => {
  await Promise.all([
    import(`${LIBS}/deps/lit-all.min.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/theme.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/underlay.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/dialog.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/button.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/textfield.js`),
  ]);
};

const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);

// Initialize Spectrum Components
await loadSpectrumComponents();

export default class MarketoIdModal extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    heading: { type: String },
    marketoId: { type: String },
    isValid: { type: Boolean },
    errorMessage: { type: String },
  };

  static styles = style;

  constructor() {
    super();
    this.open = false;
    this.heading = 'Enter your Marketo ID';
    this.marketoId = '';
    this.isValid = false;
    this.errorMessage = '';
  }

  openModal() {
    this.open = true;
    // Focus the input field when modal opens
    this.updateComplete.then(() => {
      const input = this.shadowRoot.querySelector('#marketo-id-input');
      if (input) {
        input.focus();
      }
    });
  }

  closeModal() {
    this.open = false;
    this.resetForm();
  }

  resetForm() {
    this.marketoId = '';
    this.isValid = false;
    this.errorMessage = '';
  }

  validateMarketoId(value) {
    // Basic validation: should be a number with 6-10 digits
    const trimmed = value.trim();
    if (!trimmed) {
      this.errorMessage = 'Marketo ID is required';
      return false;
    }
    
    if (!/^\d{6,10}$/.test(trimmed)) {
      this.errorMessage = 'Marketo ID should be 6-10 digits';
      return false;
    }
    
    this.errorMessage = '';
    return true;
  }

  handleInputChange(event) {
    this.marketoId = event.target.value;
    this.isValid = this.validateMarketoId(this.marketoId);
  }

  handleInputKeyDown(event) {
    // Handle Enter key to submit
    if (event.key === 'Enter' && this.isValid) {
      this.handleConnectClick();
    }
    // Handle Escape key to cancel
    if (event.key === 'Escape') {
      this.handleCancelClick();
    }
  }

  handleConnectClick() {
    if (!this.isValid) {
      // Trigger validation to show error message
      this.isValid = this.validateMarketoId(this.marketoId);
      return;
    }

    this.dispatchEvent(new CustomEvent('marketo-id-submit', {
      bubbles: true,
      composed: true,
      detail: { 
        marketoId: this.marketoId.trim(),
        action: 'connect'
      }
    }));
    this.closeModal();
  }

  handleCancelClick() {
    this.dispatchEvent(new CustomEvent('marketo-id-submit', {
      bubbles: true,
      composed: true,
      detail: { 
        marketoId: null,
        action: 'cancel'
      }
    }));
    this.closeModal();
  }

  handleUnderlayClick() {
    this.handleCancelClick();
  }

  render() {
    return html`
      <sp-theme theme="spectrum" color="light" scale="medium">
        <sp-underlay 
          ?open=${this.open}
          @click=${this.handleUnderlayClick}
        ></sp-underlay>
        <sp-dialog 
          ?open=${this.open}
          no-divider
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-heading"
        >
          <h1 slot="heading" id="modal-heading">${this.heading}</h1>
          <div class="modal-content">
            <div class="input-container">
              <sp-textfield
                id="marketo-id-input"
                placeholder="ex. 12345678"
                .value=${this.marketoId}
                ?invalid=${this.errorMessage !== ''}
                @input=${this.handleInputChange}
                @keydown=${this.handleInputKeyDown}
                autocomplete="off"
                inputmode="numeric"
                pattern="[0-9]*"
              ></sp-textfield>
              ${this.errorMessage ? html`
                <div class="error-message" role="alert">
                  ${this.errorMessage}
                </div>
              ` : ''}
            </div>
          </div>
          <div class="button-container" slot="button">
            <sp-button 
              variant="secondary" 
              @click=${this.handleCancelClick}
            >
              Cancel
            </sp-button>
            <sp-button 
              variant="cta"
              ?disabled=${!this.isValid}
              @click=${this.handleConnectClick}
            >
              Connect
            </sp-button>
          </div>
        </sp-dialog>
      </sp-theme>
    `;
  }
}

customElements.define('marketo-id-modal', MarketoIdModal);
