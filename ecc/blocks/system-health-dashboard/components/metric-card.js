/* eslint-disable max-len */
import { LIBS } from '../../../scripts/scripts.js';
import { style } from './metric-card.css.js';
import { getTabConfig, getTabValue, getScoreColor } from '../config/dashboard-config.js';

const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class MetricCard extends LitElement {
  static properties = {
    tabKey: { type: String },
    data: { type: Object },
    viewMode: { type: String },
  };

  static styles = style;

  constructor() {
    super();
    this.tabKey = '';
    this.data = null;
    this.viewMode = 'score';
  }

  render() {
    if (!this.data?.tabs?.[this.tabKey]) {
      return html`<div class="metric-card empty">No data available</div>`;
    }

    const config = getTabConfig(this.tabKey);
    if (!config) {
      return html`<div class="metric-card error">Invalid tab configuration</div>`;
    }

    const tabData = this.data.tabs[this.tabKey];
    const value = getTabValue(this.tabKey, this.data, this.viewMode);
    const color = this.viewMode === 'score' ? getScoreColor(tabData.score) : 'neutral';
    const { weight } = tabData;

    return html`
      <div class="metric-card ${color}">
        <div class="metric-header">
          <h3 class="metric-title">
            <span class="metric-icon">${config.icon}</span>
            ${config.label}
          </h3>
          <span class="metric-weight">${(weight * 100).toFixed(0)}%</span>
        </div>
        <div class="metric-value">${value}</div>
        <div class="metric-footer">
          ${this.viewMode === 'score' ? 'Score' : 'Raw Value'}
        </div>
        <div class="metric-description">${config.description}</div>
      </div>
    `;
  }
}

customElements.define('metric-card', MetricCard);
