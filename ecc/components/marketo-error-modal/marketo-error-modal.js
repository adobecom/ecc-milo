import { LIBS } from '../../scripts/scripts.js';
import { style } from './marketo-error-modal.css.js';

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
await loadSpectrumComponents();

export default class MarketoErrorModal extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    heading: { type: String },
    message: { type: String },
    marketoId: { type: String },
  };

  static styles = style;

  constructor() {
    super();
    this.open = false;
    this.heading = 'Cannot connect to Marketo';
    this.message = 'Make sure you entered your Marketo ID correctly.';
    this.marketoId = '';
  }

  openModal(marketoId = '') {
    this.marketoId = marketoId;
    this.open = true;
  }

  closeModal() {
    this.open = false;
  }

  handleGoBackClick() {
    this.dispatchEvent(new CustomEvent('marketo-error-back', {
      bubbles: true,
      composed: true,
      detail: { 
        action: 'back',
        marketoId: this.marketoId,
      },
    }));
    this.closeModal();
  }

  handleUnderlayClick() {
    this.handleGoBackClick();
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
        </sp-dialog>
      </sp-theme>
    `;
  }
}

customElements.define('marketo-error-modal', MarketoErrorModal);
