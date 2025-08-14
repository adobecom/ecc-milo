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
    this.visibleComponents = {
      mainScore: true,
      scoreChart: true,
      scoreDonutChart: true,
      keyMetrics: true,
      aiSuggestions: true,
      healthCategories: true,
    };
    this.darkMode = false;

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

  handleComponentVisibilityChanged(componentKey) {
    this.visibleComponents = {
      ...this.visibleComponents,
      [componentKey]: !this.visibleComponents[componentKey],
    };
    this.requestUpdate();
  }

  handleToggleAllComponents() {
    const allVisible = Object.values(this.visibleComponents).every(Boolean);
    const newState = !allVisible;

    this.visibleComponents = {
      mainScore: newState,
      scoreChart: newState,
      scoreDonutChart: newState,
      keyMetrics: newState,
      aiSuggestions: newState,
      healthCategories: newState,
    };
    this.requestUpdate();
  }

  handleDarkModeToggle() {
    this.darkMode = !this.darkMode;
    this.requestUpdate();
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
              <date-range-picker
                class=${this.darkMode ? 'dark-mode' : ''}
                .selectedDays=${this.timeRange}
                @dateRangeChanged=${this.handleDateRangeChanged}
              ></date-range-picker>
            </div>
            
            <div class="toolbar-section">
              <span class="toolbar-label">Theme:</span>
              <button 
                class="dark-mode-toggle"
                @click=${this.handleDarkModeToggle}
                title="Toggle dark mode"
              >
                <svg class="dark-mode-icon" viewBox="0 0 24 24" fill="currentColor">
                  ${this.darkMode ? html`
                    <!-- Sun icon for light mode -->
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                  ` : html`
                    <!-- Moon icon for dark mode -->
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                  `}
                </svg>
                <span class="toggle-text">${this.darkMode ? 'Light' : 'Dark'} Mode</span>
              </button>
            </div>
            
            <div class="toolbar-section">
              <span class="toolbar-label">Components:</span>
              <button 
                class="toolbar-btn toggle-all-btn"
                @click=${this.handleToggleAllComponents}
              >
                ${Object.values(this.visibleComponents).every(Boolean) ? 'Hide All' : 'Show All'}
              </button>
              <div class="component-toggles">
                <label class="component-toggle">
                  <input 
                    type="checkbox" 
                    .checked=${this.visibleComponents.mainScore}
                    @change=${() => this.handleComponentVisibilityChanged('mainScore')}
                  >
                  <span class="toggle-slider small"></span>
                  <span class="toggle-text">Main Score</span>
                </label>
                
                <label class="component-toggle">
                  <input 
                    type="checkbox" 
                    .checked=${this.visibleComponents.scoreChart}
                    @change=${() => this.handleComponentVisibilityChanged('scoreChart')}
                  >
                  <span class="toggle-slider small"></span>
                  <span class="toggle-text">Score Chart</span>
                </label>
                
                <label class="component-toggle">
                  <input 
                    type="checkbox" 
                    .checked=${this.visibleComponents.scoreDonutChart}
                    @change=${() => this.handleComponentVisibilityChanged('scoreDonutChart')}
                  >
                  <span class="toggle-slider small"></span>
                  <span class="toggle-text">Donut Chart</span>
                </label>
                
                <label class="component-toggle">
                  <input 
                    type="checkbox" 
                    .checked=${this.visibleComponents.keyMetrics}
                    @change=${() => this.handleComponentVisibilityChanged('keyMetrics')}
                  >
                  <span class="toggle-slider small"></span>
                  <span class="toggle-text">Key Metrics</span>
                </label>
                
                <label class="component-toggle">
                  <input 
                    type="checkbox" 
                    .checked=${this.visibleComponents.aiSuggestions}
                    @change=${() => this.handleComponentVisibilityChanged('aiSuggestions')}
                  >
                  <span class="toggle-slider small"></span>
                  <span class="toggle-text">AI Suggestions</span>
                </label>
                
                <label class="component-toggle">
                  <input 
                    type="checkbox" 
                    .checked=${this.visibleComponents.healthCategories}
                    @change=${() => this.handleComponentVisibilityChanged('healthCategories')}
                  >
                  <span class="toggle-slider small"></span>
                  <span class="toggle-text">Health Categories</span>
                </label>
              </div>
            </div>
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

  renderScoreChart() {
    if (!this.data?.days) return nothing;

    return html`
      <score-chart
        class=${this.darkMode ? 'dark-mode' : ''}
        .data=${this.data.days}
        .timeRange=${this.timeRange}
      ></score-chart>
    `;
  }

  renderScoreDonutChart() {
    if (!this.currentData) return nothing;

    return html`
      <score-donut-chart
        class=${this.darkMode ? 'dark-mode' : ''}
        .data=${this.currentData}
        .viewMode=${this.viewMode}
      ></score-donut-chart>
    `;
  }

  renderMetricCards(data) {
    if (!data) return nothing;

    const tabKeys = Object.keys(DASHBOARD_CONFIG.TABS);

    return html`
      <div class="sub-scores-grid">
        ${repeat(tabKeys, (tabKey) => html`
          <metric-card
            class=${this.darkMode ? 'dark-mode' : ''}
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
      <div class="dashboard-container ${this.darkMode ? 'dark-mode' : ''}">
        ${this.renderToolbar()}
        
        ${this.visibleComponents.mainScore ? this.renderMainScore(this.currentData) : ''}
        
        ${this.visibleComponents.scoreChart ? this.renderScoreChart() : ''}
        
        ${this.visibleComponents.scoreDonutChart ? this.renderScoreDonutChart() : ''}
        
        <div class="dashboard-grid">
          <div class="grid-left">
            ${this.visibleComponents.keyMetrics ? this.renderKeyMetrics() : ''}
            ${this.visibleComponents.aiSuggestions ? html`
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
            ` : ''}
          </div>
          
          ${this.visibleComponents.healthCategories ? html`
            <div class="grid-right">
              <div class="sub-scores-header">
                <h3 class="sub-scores-title">Health Categories</h3>
                <div class="view-mode-toggle">
                  <span class="toggle-label">Score</span>
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      .checked=${this.viewMode === 'value'}
                      @change=${(e) => this.handleViewModeChanged({ detail: { viewMode: e.target.checked ? 'value' : 'score' } })}
                    >
                    <span class="toggle-slider"></span>
                  </label>
                  <span class="toggle-label">Value</span>
                </div>
              </div>
              ${this.renderMetricCards(this.currentData)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}
