/* eslint-disable max-len */
import { LIBS } from '../../../scripts/scripts.js';
import { style } from './date-range-picker.css.js';
import { DASHBOARD_CONFIG } from '../config/dashboard-config.js';

const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class DateRangePicker extends LitElement {
  static properties = {
    selectedDays: { type: Number },
    customStartDate: { type: String },
    customEndDate: { type: String },
    isCustomRange: { type: Boolean },
  };

  static styles = style;

  constructor() {
    super();
    this.selectedDays = DASHBOARD_CONFIG.DATE_RANGE.defaultDays;
    this.customStartDate = '';
    this.customEndDate = '';
    this.isCustomRange = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setDefaultDates();
  }

  setDefaultDates() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - this.selectedDays);

    [this.customStartDate, this.customEndDate] = [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]];
  }

  handlePresetClick(days) {
    this.selectedDays = days;
    this.isCustomRange = false;
    this.setDefaultDates();
    this.dispatchDateRangeChange();
  }

  handleCustomRangeToggle() {
    this.isCustomRange = !this.isCustomRange;
    if (this.isCustomRange) {
      this.setDefaultDates();
    }
  }

  handleDateChange() {
    if (this.customStartDate && this.customEndDate) {
      const start = new Date(this.customStartDate);
      const end = new Date(this.customEndDate);
      const diffTime = Math.abs(end - start);
      this.selectedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      this.dispatchDateRangeChange();
    }
  }

  dispatchDateRangeChange() {
    this.dispatchEvent(new CustomEvent('dateRangeChanged', {
      detail: {
        days: this.selectedDays,
        startDate: this.customStartDate,
        endDate: this.customEndDate,
        isCustomRange: this.isCustomRange,
      },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <div class="date-range-picker">
        <div class="picker-header">
          <h4 class="picker-title">Date Range</h4>
          <button 
            class="custom-toggle ${this.isCustomRange ? 'active' : ''}"
            @click=${this.handleCustomRangeToggle}
          >
            ${this.isCustomRange ? 'Presets' : 'Custom Range'}
          </button>
        </div>

        ${this.isCustomRange ? this.renderCustomRange() : this.renderPresets()}
      </div>
    `;
  }

  renderPresets() {
    return html`
      <div class="preset-buttons">
        ${DASHBOARD_CONFIG.DATE_RANGE.presets.map((preset) => html`
          <button 
            class="preset-btn ${this.selectedDays === preset.days ? 'active' : ''}"
            @click=${() => this.handlePresetClick(preset.days)}
          >
            ${preset.label}
          </button>
        `)}
      </div>
    `;
  }

  renderCustomRange() {
    return html`
      <div class="custom-range">
        <div class="date-inputs">
          <div class="date-input-group">
            <label for="start-date">Start</label>
            <input 
              type="date" 
              id="start-date"
              .value=${this.customStartDate}
              @change=${(e) => {
    this.customStartDate = e.target.value;
    this.handleDateChange();
  }}
              max=${this.customEndDate || new Date().toISOString().split('T')[0]}
            >
          </div>
          <div class="date-input-group">
            <label for="end-date">End</label>
            <input 
              type="date" 
              id="end-date"
              .value=${this.customEndDate}
              @change=${(e) => {
    this.customEndDate = e.target.value;
    this.handleDateChange();
  }}
              min=${this.customStartDate}
              max=${new Date().toISOString().split('T')[0]}
            >
          </div>
          <div class="range-summary">
            <span class="range-days">${this.selectedDays} days</span>
          </div>
        </div>
      </div>
    `;
  }
}
