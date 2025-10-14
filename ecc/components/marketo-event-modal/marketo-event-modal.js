import { LIBS } from '../../scripts/scripts.js';
import { style } from './marketo-event-modal.css.js';

// Import Spectrum Web Components
const loadSpectrumComponents = async () => {
  await Promise.all([
    import(`${LIBS}/deps/lit-all.min.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/theme.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/underlay.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/dialog.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/button.js`),
  ]);
};

const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);

// Initialize Spectrum Components
const spectrumInitialized = loadSpectrumComponents();

// Child modal components will initialize their own Spectrum dependencies
const childModalsImported = Promise.all([
  import('../marketo-id-modal/marketo-id-modal.js'),
  import('../marketo-error-modal/marketo-error-modal.js'),
]);

// Wait for all dependencies to load
await Promise.all([spectrumInitialized, childModalsImported]);

const MODAL_STATES = {
  INITIAL: 'initial',
  ID_MODAL: 'id-modal',
  ERROR_MODAL: 'error-modal',
};

export default class MarketoEventModal extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    heading: { type: String },
    description: { type: String },
    state: { type: String },
  };

  static styles = style;

  constructor() {
    super();
    this.open = false;
    this.heading = 'Do you need to connect your new webinar to a Marketo Event?';
    this.description = 'Connect your webinar to an existing Marketo event to sync the details.';
  }

  firstUpdated() {
    // Set up event listeners for the ID modal and error modal
    this.shadowRoot.addEventListener('marketo-id-submit', this.handleIdModalSubmit.bind(this));
    this.shadowRoot.addEventListener('marketo-error-back', this.handleErrorModalBack.bind(this));
  }

  openModal() {
    this.open = true;
    this.state = MODAL_STATES.INITIAL;
  }

  closeModal() {
    this.open = false;
    this.state = MODAL_STATES.INITIAL;
  }

  handleYesClick() {
    this.closeModal();
    // Open the ID modal after closing this one
    setTimeout(() => {
      const idModal = this.shadowRoot.querySelector('marketo-id-modal');
      if (idModal) {
        idModal.openModal();
      }
    }, 150); // Small delay for smooth transition
  }

  handleNoClick() {
    this.dispatchEvent(new CustomEvent('marketo-connect', {
      bubbles: true,
      composed: true,
      detail: { connect: false },
    }));
    this.closeModal();
  }

  handleUnderlayClick() {
    this.closeModal();
  }

  handleIdModalSubmit(event) {
    const { marketoId, action } = event.detail;

    if (action === 'connect' && marketoId) {
      // Simulate validation - for demo purposes, make certain IDs fail
      const isValidMarketoId = this.validateMarketoConnection(marketoId);

      if (isValidMarketoId) {
        // User provided a valid Marketo ID - dispatch success event
        this.dispatchEvent(new CustomEvent('marketo-connect', {
          bubbles: true,
          composed: true,
          detail: {
            connect: true,
            marketoId,
          },
        }));
      } else {
        // Connection failed - show error modal
        const errorModal = this.shadowRoot.querySelector('marketo-error-modal');
        if (errorModal) {
          errorModal.openModal(marketoId);
        }
      }
    } else {
      // User canceled - dispatch cancellation event
      this.dispatchEvent(new CustomEvent('marketo-connect', {
        bubbles: true,
        composed: true,
        detail: { connect: false },
      }));
    }
  }

  // eslint-disable-next-line class-methods-use-this
  validateMarketoConnection(marketoId) {
    // Simulate connection validation
    // For demo purposes, make IDs ending in '0' or '1' fail
    // In a real implementation, this would be an API call
    const lastDigit = marketoId.slice(-1);
    return lastDigit !== '0' && lastDigit !== '1';
  }

  handleErrorModalBack(event) {
    const { marketoId } = event.detail;
    // Reopen the ID modal with the previous ID value
    const idModal = this.shadowRoot.querySelector('marketo-id-modal');
    if (idModal) {
      idModal.marketoId = marketoId || '';
      idModal.openModal();
    }
  }

  renderInitialContent() {
    return html`
      <h1 slot="heading" id="modal-heading">${this.heading}</h1>
          <div class="modal-content">
            <p class="modal-description">${this.description}</p>
          </div>
          <div class="button-container" id="button-container" slot="button">
            <sp-button 
              variant="secondary" 
              @click=${this.handleNoClick}
            >
              No
            </sp-button>
            <sp-button 
              variant="cta" 
              @click=${this.handleYesClick}
            >
              Yes
            </sp-button>
          </div>
    `;
  }

  renderContent() {
    switch (this.state) {
      case MODAL_STATES.INITIAL:
        return this.renderInitialContent();
      case MODAL_STATES.ID_MODAL:
        return this.renderIdModalContent();
      case MODAL_STATES.ERROR_MODAL:
        return this.renderErrorModalContent();
    }
  }

  renderIdModalContent() {
    return html`
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
    `;
  }

  renderErrorModalContent() {
    return html`
      <div class="modal-header">
            <div class="warning-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L21.09 19.5H2.91L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <path d="M12 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1 id="modal-heading">${this.heading}</h1>
          </div>
          <div class="modal-content">
            <p class="modal-message">${this.message}</p>
          </div>
          <div class="button-container" slot="button">
            <sp-button 
              variant="secondary"
              @click=${this.handleGoBackClick}
            >
              Go back
            </sp-button>
          </div>
    `;
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
          ${this.renderContent()}
        </sp-dialog>
      </sp-theme>
      
      <!-- Marketo ID Modal - triggered when user clicks Yes -->
      <marketo-id-modal></marketo-id-modal>
      
      <!-- Marketo Error Modal - triggered when connection fails -->
      <marketo-error-modal></marketo-error-modal>
    `;
  }
}

customElements.define('marketo-event-modal', MarketoEventModal);
