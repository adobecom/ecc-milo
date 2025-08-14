/* eslint-disable max-len */
import { LIBS } from '../../../scripts/scripts.js';
import { style } from './dashboard-toolbar.css.js';
import { DASHBOARD_CONFIG } from '../config/dashboard-config.js';

const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class DashboardToolbar extends LitElement {
  static properties = {
    viewMode: { type: String },
    timeRange: { type: String },
  };

  static styles = style;

  constructor() {
    super();
    this.viewMode = 'score';
    this.timeRange = '7d';
  }

  toggleViewMode() {
    const newMode = this.viewMode === 'score' ? 'value' : 'score';
    this.dispatchEvent(new CustomEvent('viewModeChanged', {
      detail: { viewMode: newMode },
      bubbles: true,
      composed: true,
    }));
  }

  setTimeRange(range) {
    this.dispatchEvent(new CustomEvent('timeRangeChanged', {
      detail: { timeRange: range },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <div class="toolbar">
        <div class="toolbar-section">
          <span class="toolbar-label">View Mode:</span>
          ${Object.entries(DASHBOARD_CONFIG.VIEW_MODES).map(([key, config]) => html`
            <button 
              class="toolbar-btn ${this.viewMode === key ? 'active' : ''}"
              @click=${this.toggleViewMode}
            >
              ${config.label}
            </button>
          `)}
        </div>
        
        <div class="toolbar-section">
          <span class="toolbar-label">Time Range:</span>
          ${Object.entries(DASHBOARD_CONFIG.TIME_RANGES).map(([key, config]) => html`
            <button 
              class="toolbar-btn ${this.timeRange === key ? 'active' : ''}"
              @click=${() => this.setTimeRange(key)}
            >
              ${config.label}
            </button>
          `)}
        </div>
      </div>
    `;
  }
}
