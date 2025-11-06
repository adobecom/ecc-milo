import { getSeriesForUser } from '../../scripts/esp-controller.js';
import { LIBS } from '../../scripts/scripts.js';
import { style } from './marketo-id-modal.css.js';
const { createTag } = await import(`${LIBS}/utils/utils.js`);
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
const MCZ_PREFIX = 'mcz-';
// Initialize Spectrum Components
await loadSpectrumComponents();

export default class MarketoIdModal extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    heading: { type: String },
    marketoId: { type: String },
    isValid: { type: Boolean },
    errorMessage: { type: String },
    timeoutId: { type: Number},
    loading: { type: Boolean},
    iframe: {type: HTMLIFrameElement}
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

  formatMarketoUrl = (marketoId) => {
    // Ensure consistent format for URL (without dash)
    const idWithPrefix = this.addMczPrefix(marketoId);
    return idWithPrefix.replace('-', '');
  }
  /**
   * Convert time from hhmmss format to hh:mm:ss format
   * @param {string|number} time - Time in hhmmss format (e.g., 101010)
   * @returns {string} Time in hh:mm:ss format (e.g., 10:10:10)
   */
  formatDate(date) {
    // Ensure input is a string
    const str = String(date).padStart(6, '0'); // pad in case of missing leading zeros

    // Extract hh, mm, ss
    const year = str.substring(0, 4);
    const mm = str.substring(4, 6);
    const dd = str.substring(6, 8);

    return `${year}-${mm}-${dd}`;
  }
  formatTime(time) {
    // Ensure input is a string
    const str = String(time).padStart(6, '0'); // pad in case of missing leading zeros

    // Extract hh, mm, ss
    const hh = str.substring(0, 2);
    const mm = str.substring(2, 4);
    const ss = str.substring(4, 6);

    return `${hh}:${mm}:${ss}`;
  }


  updateFormUsingMarketoData = async(params) =>{
    const seriesName = params.profile['Series Name'];
  
    // lookup seriesId from eventInfo.seriesName
    const series = await getSeriesForUser();
    const seriesId = series.find((s) => s.seriesName === seriesName)?.seriesId;
  
    const eventStartDateTime = params.profile['Event Start Date Time ISO'];
    const eventEndDateTime = params.profile['Event End Date Time ISO'];
  
    const localStartDate = this.formatDate(eventStartDateTime.split('T')[0]);
    const localEndDate = this.formatDate(eventEndDateTime.split('T')[0]);
    const localStartTime = this.formatTime(eventStartDateTime.split('T')[1]);
    const localEndTime = this.formatTime(eventEndDateTime.split('T')[1]);
  
    const eventInfo = {
      title: params.profile['Event Name'],
      description: params.profile['Event Description'],
      localStartDate,
      localStartTime,
      localEndDate,
      localEndTime,
      timezone: params.profile['Event Timezone'],
      enTitle: params.profile['Event Name'],
      eventDetails: params.profile['Event Description'],
    };
  
    if (seriesId) {
      eventInfo.seriesId = seriesId;
    }
    console.log('eventInfo : ', eventInfo);
    return eventInfo
  }

  openModal() {
    this.open = true;
    this.resetForm();
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
    this.isValid = true;
    this.errorMessage = '';
  }

  validateMarketoId(value) {
    // Basic validation: should be a number with 6-10 digits
    const trimmed = value.trim();
    if (!trimmed) {
      this.errorMessage = 'Marketo ID is required';
      this.isValid = false;
      return false;
    }
    if(/^\d+$/.test(trimmed) && trimmed.length < 6){
      this.errorMessage = 'Marketo ID should be 6-10 digits';
      this.isValid = true;
      return false;
    }
    if (!/^\d{6,10}$/.test(trimmed)) {
      this.errorMessage = 'Marketo ID should be 6-10 digits';
      this.isValid = false;
      return false;
    }
    
    this.errorMessage = '';
    return true;
  }

  handleInputChange(event) {
    this.marketoId = event.target.value;
    if(!this.marketoId){
      this.isValid = true;
      this.errorMessage = '';
      return;
    }
    this.validateMarketoId(this.marketoId);
  }

  formatMarketoUrl = (marketoId) => {
    // Ensure consistent format for URL (without dash)
    const idWithPrefix = this.addMczPrefix(marketoId);
    return idWithPrefix.replace('-', '');
  }

  loadMarketoEventInfo(marketoId) {
    this.errorMessage = '';
    const urlFormatId = this.formatMarketoUrl(marketoId);
    this.iframe = createTag('iframe', {
      src: `https://engage.adobe.com/${urlFormatId}.html?mkto_src=emc`,
      class: 'hidden',
    });
    document.getElementById("marketo-event-modal")?.append(this.iframe);
    let that = this;
    window.addEventListener('message', (event) => {
      console.log("iframe message recieved",event.data.data);
      that.onMczMessage(event)
    });
  }

  onMczMessage = async(event) =>{
    const config = { allowedOrigins: ['https://engage.adobe.com', 'https://business.adobe.com'] };
    const eventOrigin = new URL(event.origin);
    let allowedToPass = false;
    for (let i = 0; i < config.allowedOrigins.length; i += 1) {
      const allowedOriginURL = new URL(config.allowedOrigins[i]);
      if (
        eventOrigin.host === allowedOriginURL.host
          && eventOrigin.protocol === allowedOriginURL.protocol
          && eventOrigin.port === allowedOriginURL.port
      ) {
        allowedToPass = true;
        break;
      }
    }
    if (event.data && event.data.type !== 'mcz_marketoForm_pref_sync') {
      allowedToPass = false;
    }
    if (!allowedToPass) {
      this.timeoutId = setTimeout(() => {
       this.loading = false;
       this.errorMessage = 'Invalid Marketo Id';
        this.isValid = false;
       clearTimeout(this.timeoutId);
      }, 7000);
      return;
    }
    // eslint-disable-next-line no-console
    console.log('MCZ RefData Received:', event.data);
    if (event.data && event.data.target_path !== null && event.data.target_attribute !== null) {
      clearTimeout(this.timeoutId);
      const eventData = await this.updateFormUsingMarketoData(event.data.data);
      this.dispatchEvent(new CustomEvent('marketo-id-submit', {
        bubbles: true,
        composed: true,
        detail: { 
          marketoId: this.marketoId.trim(),
          action: 'connect',
          eventData: eventData
        }
      }));
      this.iframe.remove();
      this.closeModal();
    }
    this.loading = false;
    this.isValid = false;
    this.errorMessage = 'Invalid Marketo Id';
  }

  handleInputKeyDown(event) {
    // Handle Enter key to submit
    if(this.iframe){
      this.iframe.remove();
    }
    if (event.key === 'Enter' && this.isValid) {
      this.handleConnectClick();
    }
    // Handle Escape key to cancel
    if (event.key === 'Escape') {
      this.handleCancelClick();
    }
  }

  addMczPrefix = (value) => {
    if (!value) return '';
    // Don't add prefix if it already exists
    return value.startsWith(MCZ_PREFIX) ? value : `${MCZ_PREFIX}${value}`;
  };

  handleConnectClick() {
    if (!this.isValid) {
      // Trigger validation to show error message
      this.isValid = this.validateMarketoId(this.marketoId);
      return this.isValid;
    }
    const marketoId = this.addMczPrefix(this.marketoId);
    this.loading = true;
    this.loadMarketoEventInfo(marketoId)
  }

  handleCancelClick() {
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
                .disabled=${this.loading}
              ></sp-textfield>
              ${this.errorMessage ? html`
                <div class="error-message ${this.isValid ? '':'invalid'}" role="alert">
                  ${this.errorMessage}
                </div>
              ` : ''}
            </div>
          </div>
          <div class="button-container" slot="button">
            <sp-button 
              variant="secondary" 
              treatment="outline"
              @click=${this.handleCancelClick}
              .disabled=${this.loading}
              class
            >
              Cancel
            </sp-button>
            <sp-button 
              variant="cta"
              static-color="black"
              ?disabled=${!this.isValid}
              @click=${this.handleConnectClick}
              .disabled=${this.marketoId.length < 6 || !this.isValid}
              .pending=${this.loading}
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
