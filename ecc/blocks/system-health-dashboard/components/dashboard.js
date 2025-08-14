/* eslint-disable max-len */
import { LIBS } from '../../../scripts/scripts.js';
import { style } from './dashboard.css.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class SystemHealthDashboard extends LitElement {
  static properties = {
    data: { type: Object },
    viewMode: { type: String }, // 'score' or 'value'
    timeRange: { type: String }, // '1d', '3d', '7d'
  };

  constructor() {
    super();
    this.data = this.data || {};
    this.viewMode = 'score';
    this.timeRange = '7d';
  }

  static styles = style;

  get currentData() {
    if (!this.data.days || !this.data.days.length) return null;

    if (this.timeRange === '1d') {
      return this.data.days[this.data.days.length - 1];
    }

    if (this.timeRange === '3d') {
      const last3Days = this.data.days.slice(-3);
      return this.aggregateData(last3Days);
    }

    // 7d - use pre-computed aggregates
    return this.data.aggregates?.['7d'] || this.aggregateData(this.data.days.slice(-7));
  }

  aggregateData(days) {
    if (!days.length) return null;

    const metrics = {};
    const subScores = {};
    const metricKeys = Object.keys(days[0].metrics);
    const subScoreKeys = Object.keys(days[0].sub_scores);

    // Average metrics
    metricKeys.forEach((key) => {
      metrics[key] = days.reduce((sum, day) => sum + day.metrics[key], 0) / days.length;
    });

    // Average sub-scores
    subScoreKeys.forEach((key) => {
      subScores[key] = days.reduce((sum, day) => sum + day.sub_scores[key], 0) / days.length;
    });

    // Calculate health score
    const weights = this.data.weights || {};
    const healthScore = Object.keys(subScores).reduce((score, key) => score + (subScores[key] * (weights[key] || 0)), 0);

    return {
      metrics,
      sub_scores: subScores,
      health_score: Math.round(healthScore * 10) / 10,
    };
  }

  static getMetricDisplayName(key) {
    const names = {
      splunk_error_rate: 'Splunk Error Rate',
      prod_incidents: 'Production Incidents',
      stage_to_prod_regressions: 'Stage to Prod Regressions',
      automation_failures_api: 'API Automation Failures',
      automation_failures_ui: 'UI Automation Failures',
      downtime: 'Downtime',
      unit_test_coverage: 'Unit Test Coverage',
      regression_pass_rate: 'Regression Pass Rate',
      deployment_success_rate: 'Deployment Success Rate',
    };
    return names[key] || key;
  }

  getMetricValue(key, data) {
    if (this.viewMode === 'score') {
      return data.sub_scores?.[key] || 0;
    }
    return data.metrics?.[key] || 0;
  }

  getMetricUnit(key) {
    if (this.viewMode === 'score') {
      return '';
    }

    const units = {
      splunk_errors_per_1k_requests: ' per 1k',
      prod_incidents: '',
      stage_to_prod_regressions: '',
      automation_failures_api: '',
      automation_failures_ui: '',
      downtime_minutes: ' min',
      unit_test_coverage_percent: '%',
      regression_pass_rate_percent: '%',
      deployment_success_rate_percent: '%',
    };
    return units[key] || '';
  }

  static getScoreColor(score) {
    if (score >= 90) return 'green';
    if (score >= 70) return 'yellow';
    if (score >= 50) return 'orange';
    return 'red';
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'score' ? 'value' : 'score';
  }

  setTimeRange(range) {
    this.timeRange = range;
  }

  renderToolbar() {
    return html`
      <div class="toolbar">
        <div class="toolbar-section">
          <span class="toolbar-label">View Mode:</span>
          <button 
            class="toolbar-btn ${this.viewMode === 'score' ? 'active' : ''}"
            @click=${this.toggleViewMode}
          >
            Score
          </button>
          <button 
            class="toolbar-btn ${this.viewMode === 'value' ? 'active' : ''}"
            @click=${this.toggleViewMode}
          >
            Value
          </button>
        </div>
        
        <div class="toolbar-section">
          <span class="toolbar-label">Time Range:</span>
          <button 
            class="toolbar-btn ${this.timeRange === '1d' ? 'active' : ''}"
            @click=${() => this.setTimeRange('1d')}
          >
            1 Day
          </button>
          <button 
            class="toolbar-btn ${this.timeRange === '3d' ? 'active' : ''}"
            @click=${() => this.setTimeRange('3d')}
          >
            3 Days
          </button>
          <button 
            class="toolbar-btn ${this.timeRange === '7d' ? 'active' : ''}"
            @click=${() => this.setTimeRange('7d')}
          >
            1 Week
          </button>
        </div>
      </div>
    `;
  }

  renderMainScore(data) {
    if (!data) return nothing;

    const score = data.health_score;
    const color = SystemHealthDashboard.getScoreColor(score);

    return html`
      <div class="main-score-container">
        <div class="main-score ${color}">
          <div class="score-value">${score}</div>
          <div class="score-label">System Health Score</div>
          <div class="score-subtitle">${this.timeRange.toUpperCase()} Average</div>
        </div>
      </div>
    `;
  }

  renderMetricCard(key, data) {
    if (!data) return nothing;

    const value = this.getMetricValue(key, data);
    const displayName = SystemHealthDashboard.getMetricDisplayName(key);
    const unit = this.getMetricUnit(key);
    const color = this.viewMode === 'score' ? SystemHealthDashboard.getScoreColor(value) : 'neutral';

    return html`
      <div class="metric-card ${color}">
        <div class="metric-header">
          <h3 class="metric-title">${displayName}</h3>
        </div>
        <div class="metric-value">
          ${value}${unit}
        </div>
        <div class="metric-footer">
          ${this.viewMode === 'score' ? 'Score' : 'Raw Value'}
        </div>
      </div>
    `;
  }

  static renderKeyMetrics(data) {
    if (!data) return nothing;

    const keyMetrics = [
      { label: 'Total Requests', value: data.metrics?.requests?.toLocaleString() || 'N/A' },
      { label: 'Error Rate', value: `${data.metrics?.splunk_errors_per_1k_requests || 0} per 1k` },
      { label: 'Uptime', value: `${((100 - ((data.metrics?.downtime_minutes || 0) / 1440) * 100)).toFixed(2)}%` },
      { label: 'Test Coverage', value: `${data.metrics?.unit_test_coverage_percent || 0}%` },
    ];

    return html`
      <div class="key-metrics-card">
        <h3>Key Metrics</h3>
        <div class="key-metrics-grid">
          ${repeat(keyMetrics, (metric) => html`
            <div class="key-metric">
              <div class="key-metric-label">${metric.label}</div>
              <div class="key-metric-value">${metric.value}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  static renderAISuggestions() {
    return html`
      <div class="ai-suggestions-card">
        <h3>AI Suggestions</h3>
        <div class="suggestion">
          <div class="suggestion-icon">💡</div>
          <div class="suggestion-content">
            <strong>Optimize Error Handling:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consider implementing circuit breakers for external API calls.
          </div>
        </div>
        <div class="suggestion">
          <div class="suggestion-icon">⚡</div>
          <div class="suggestion-content">
            <strong>Improve Test Coverage:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Focus on critical user journey test cases.
          </div>
        </div>
        <div class="suggestion">
          <div class="suggestion-icon">🔧</div>
          <div class="suggestion-content">
            <strong>Deployment Optimization:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consider implementing blue-green deployments.
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const { currentData } = this;

    if (!this.data.days) {
      return html`
        <div class="dashboard-container">
          <div class="loading">Loading dashboard data...</div>
        </div>
      `;
    }

    const metricKeys = [
      'splunk_error_rate',
      'prod_incidents',
      'stage_to_prod_regressions',
      'automation_failures_api',
      'automation_failures_ui',
      'downtime',
      'unit_test_coverage',
      'regression_pass_rate',
      'deployment_success_rate',
    ];

    return html`
      <div class="dashboard-container">
        ${this.renderToolbar()}
        
        ${this.renderMainScore(currentData)}
        
        <div class="dashboard-grid">
          <div class="grid-left">
            ${SystemHealthDashboard.renderKeyMetrics(currentData)}
            ${SystemHealthDashboard.renderAISuggestions()}
          </div>
          
          <div class="grid-right">
            <h3 class="sub-scores-title">Sub-Scores</h3>
            <div class="sub-scores-grid">
              ${repeat(metricKeys, (key) => this.renderMetricCard(key, currentData))}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('system-health-dashboard', SystemHealthDashboard);
