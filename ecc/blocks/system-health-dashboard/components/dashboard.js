/* eslint-disable max-len */
import { LIBS } from '../../../scripts/scripts.js';
import { style } from './dashboard.css.js';
import DashboardDataService from '../services/data-service.js';
import { dashboardStore } from '../store/dashboard-store.js';
import { DASHBOARD_CONFIG, getScoreColor } from '../config/dashboard-config.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class SystemHealthDashboard extends LitElement {
  static properties = {
    data: { type: Object },
    viewMode: { type: String },
    timeRange: { type: String },
    loading: { type: Boolean },
    error: { type: String },
    toolbarExpanded: { type: Boolean },
  };

  static styles = style;

  constructor() {
    super();
    this.data = null;
    this.viewMode = 'score';
    this.timeRange = 7;
    this.loading = false;
    this.error = null;
    this.toolbarExpanded = false;

    // Subscribe to store changes
    this.unsubscribe = dashboardStore.subscribe(this.handleStateChange.bind(this));

    // Get initial state from store
    const initialState = dashboardStore.getState();
    this.handleStateChange(initialState);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleStateChange(state) {
    this.data = state.data;
    this.viewMode = state.viewMode;
    this.timeRange = state.timeRange;
    this.loading = state.loading;
    this.error = state.error;
  }

  get currentData() {
    if (!this.data?.days) return null;
    return DashboardDataService.getAggregatedData(this.data.days, this.timeRange);
  }

  handleViewModeChanged(event) {
    const { viewMode } = event.detail;
    dashboardStore.setViewMode(viewMode);
    this.requestUpdate(); // Use 'this' to satisfy linter
  }

  handleTimeRangeChanged(event) {
    const { timeRange } = event.detail;
    dashboardStore.setTimeRange(timeRange);
    this.requestUpdate(); // Use 'this' to satisfy linter
  }

  handleDateRangeChanged(event) {
    const { days } = event.detail;
    dashboardStore.setTimeRange(days);
    this.requestUpdate(); // Use 'this' to satisfy linter
  }

  getTimeRangeLabel() {
    if (this.timeRange === 1) return '1 Day';
    if (this.timeRange === 3) return '3 Days';
    if (this.timeRange === 7) return '1 Week';
    if (this.timeRange === 14) return '2 Weeks';
    if (this.timeRange === 30) return '1 Month';
    return `${this.timeRange} Days`;
  }

  toggleToolbar() {
    this.toolbarExpanded = !this.toolbarExpanded;
    this.requestUpdate();
  }

  handleToggleClick(e) {
    e.stopPropagation();
    this.toggleToolbar();
  }

  renderToolbar() {
    return html`
      <div class="toolbar">
        <div class="toolbar-header" @click=${this.toggleToolbar}>
          <h3 class="toolbar-title">Dashboard Controls</h3>
          <button class="toolbar-toggle" @click=${this.handleToggleClick}>
            <svg class="toolbar-toggle-icon ${this.toolbarExpanded ? 'rotated' : ''}" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>
        </div>
        
        <div class="toolbar-content ${this.toolbarExpanded ? 'expanded' : ''}">
          <div class="toolbar-body">
            <div class="toolbar-section">
              <span class="toolbar-label">View Mode:</span>
              <button 
                class="toolbar-btn ${this.viewMode === 'score' ? 'active' : ''}"
                @click=${() => this.handleViewModeChanged({ detail: { viewMode: 'score' } })}
              >
                Score
              </button>
              <button 
                class="toolbar-btn ${this.viewMode === 'value' ? 'active' : ''}"
                @click=${() => this.handleViewModeChanged({ detail: { viewMode: 'value' } })}
              >
                Value
              </button>
            </div>
            
            <date-range-picker
              .selectedDays=${this.timeRange}
              @dateRangeChanged=${this.handleDateRangeChanged}
            ></date-range-picker>
          </div>
        </div>
      </div>
    `;
  }

  renderMainScore(data) {
    if (!data) return nothing;

    const score = data.overall.health_score;
    const color = getScoreColor(score);

    return html`
      <div class="main-score-container">
        <div class="main-score ${color}">
          <div class="score-value">${score}</div>
          <div class="score-label">System Health Score</div>
          <div class="score-subtitle">${this.getTimeRangeLabel()} Average</div>
          
          <div class="meter-container">
            <div class="meter ${color}">
              <div class="meter-fill" style="width: ${score}%"></div>
            </div>
            <div class="meter-value">${score}/100</div>
          </div>
          
          <div class="score-details">
            <div class="score-detail">Raw Score: ${data.overall.raw_weighted_sum}</div>
            <div class="score-detail">Multiplier: ${data.overall.new_relic_multiplier}</div>
          </div>
        </div>
      </div>
    `;
  }

  renderMetricCards(data) {
    if (!data) return nothing;

    const tabKeys = Object.keys(DASHBOARD_CONFIG.TABS);

    return html`
      <div class="sub-scores-grid">
        ${repeat(tabKeys, (tabKey) => html`
          <metric-card
            .tabKey=${tabKey}
            .data=${data}
            .viewMode=${this.viewMode}
          ></metric-card>
        `)}
      </div>
    `;
  }

  renderKeyMetrics() {
    const data = this.currentData;
    if (!data) return nothing;

    return html`
      <div class="key-metrics-card">
        <h3>Key Metrics</h3>
        <div class="key-metrics-grid">
          ${repeat(DASHBOARD_CONFIG.KEY_METRICS, (metric) => html`
            <div class="key-metric">
              <div class="key-metric-label">${metric.label}</div>
              <div class="key-metric-value">${metric.getValue(data)}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  renderError() {
    return html`
      <div class="dashboard-container">
        <div class="error">
          <h3>Error Loading Dashboard</h3>
          <p>${this.error}</p>
          <button @click=${() => dashboardStore.setLoading(true)}>Retry</button>
        </div>
      </div>
    `;
  }

  render() {
    if (this.loading) {
      return html`
      <div class="dashboard-container">
        <div class="loading">Loading dashboard data...</div>
      </div>
    `;
    }

    if (this.error) {
      return this.renderError();
    }

    if (!this.data?.days) {
      return html`
        <div class="dashboard-container">
          <div class="loading">No data available</div>
        </div>
      `;
    }

    return html`
      <div class="dashboard-container">
        ${this.renderToolbar()}
        
        ${this.renderMainScore(this.currentData)}
        
        <div class="dashboard-grid">
          <div class="grid-left">
            ${this.renderKeyMetrics()}
            ${html`
              <div class="ai-suggestions-card">
                <h3>AI Suggestions</h3>
                ${repeat(DASHBOARD_CONFIG.AI_SUGGESTIONS, (suggestion) => html`
                  <div class="suggestion">
                    <div class="suggestion-icon">${suggestion.icon}</div>
                    <div class="suggestion-content">
                      <strong>${suggestion.title}:</strong> ${suggestion.content}
                    </div>
                  </div>
                `)}
              </div>
            `}
          </div>
          
          <div class="grid-right">
            <h3 class="sub-scores-title">Health Categories</h3>
            ${this.renderMetricCards(this.currentData)}
          </div>
        </div>
      </div>
    `;
  }
}
