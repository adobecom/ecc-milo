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
      return SystemHealthDashboard.aggregateData(last3Days);
    }

    // 7d - aggregate all available days
    return SystemHealthDashboard.aggregateData(this.data.days);
  }

  static aggregateData(days) {
    if (!days.length) return null;

    const aggregatedTabs = {};
    const tabKeys = Object.keys(days[0].tabs);

    // Initialize aggregated structure
    tabKeys.forEach((tabKey) => {
      if (tabKey !== 'new_relic') {
        aggregatedTabs[tabKey] = {
          inputs: {},
          score: 0,
          weight: days[0].tabs[tabKey].weight,
          weighted_contribution: 0,
        };
      }
    });

    // Aggregate scores and inputs
    tabKeys.forEach((tabKey) => {
      if (tabKey === 'new_relic') return;

      const scores = days.map((day) => day.tabs[tabKey].score);
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      aggregatedTabs[tabKey].score = Math.round(avgScore * 10) / 10;
      aggregatedTabs[tabKey].weighted_contribution = Math.round(avgScore * aggregatedTabs[tabKey].weight * 10) / 10;

      // Aggregate inputs (average numeric values, sum counts)
      const inputs = days.map((day) => day.tabs[tabKey].inputs);
      aggregatedTabs[tabKey].inputs = SystemHealthDashboard.aggregateInputs(inputs, tabKey);
    });

    // Calculate overall health score
    const rawWeightedSum = Object.values(aggregatedTabs)
      .reduce((sum, tab) => sum + tab.weighted_contribution, 0);

    // Use average New Relic multiplier
    const newRelicMultipliers = days.map((day) => day.tabs.new_relic.multiplier);
    const avgMultiplier = newRelicMultipliers.reduce((sum, mult) => sum + mult, 0) / newRelicMultipliers.length;

    const healthScore = Math.round(rawWeightedSum * avgMultiplier * 10) / 10;

    return {
      timestamp: days[days.length - 1].timestamp,
      overall: {
        raw_weighted_sum: Math.round(rawWeightedSum * 10) / 10,
        new_relic_multiplier: Math.round(avgMultiplier * 10000) / 10000,
        health_score: healthScore,
      },
      tabs: aggregatedTabs,
    };
  }

  static aggregateInputs(inputs, tabKey) {
    const aggregated = {};

    if (tabKey === 'splunk') {
      // Sum requests, average baseline, sum errors
      aggregated.requests = inputs.reduce((sum, input) => sum + (input.requests || 0), 0);
      aggregated.baseline_requests = inputs.reduce((sum, input) => sum + (input.baseline_requests || 0), 0) / inputs.length;
      aggregated.errors = {
        500: inputs.reduce((sum, input) => sum + (input.errors?.[500] || 0), 0),
        503: inputs.reduce((sum, input) => sum + (input.errors?.[503] || 0), 0),
        418: inputs.reduce((sum, input) => sum + (input.errors?.[418] || 0), 0),
        401: inputs.reduce((sum, input) => sum + (input.errors?.[401] || 0), 0),
        404: inputs.reduce((sum, input) => sum + (input.errors?.[404] || 0), 0),
      };
    } else if (tabKey === 'cwv') {
      // Average CWV pass rate
      aggregated.cwv_pass_rate_percent = Math.round(
        inputs.reduce((sum, input) => sum + (input.cwv_pass_rate_percent || 0), 0) / inputs.length,
      );
    } else if (tabKey === 'api') {
      // Average failure rate and coverage
      aggregated.failure_rate = Math.round(
        (inputs.reduce((sum, input) => sum + (input.failure_rate || 0), 0) / inputs.length) * 1000,
      ) / 1000;
      aggregated.coverage = Math.round(
        (inputs.reduce((sum, input) => sum + (input.coverage || 0), 0) / inputs.length) * 100,
      ) / 100;
    } else if (tabKey === 'prod') {
      // Combine all incidents
      aggregated.incidents = inputs.reduce((all, input) => {
        if (input.incidents && input.incidents.length > 0) {
          return all.concat(input.incidents);
        }
        return all;
      }, []);
    } else if (tabKey === 'a11y') {
      // Average a11y score
      aggregated.a11y_score = Math.round(
        inputs.reduce((sum, input) => sum + (input.a11y_score || 0), 0) / inputs.length,
      );
    } else if (tabKey === 'escape') {
      // Sum escape count
      aggregated.count = inputs.reduce((sum, input) => sum + (input.count || 0), 0);
    } else if (tabKey === 'e2e') {
      // Average failure rate
      aggregated.failure_rate = Math.round(
        (inputs.reduce((sum, input) => sum + (input.failure_rate || 0), 0) / inputs.length) * 1000,
      ) / 1000;
    } else if (tabKey === 'down') {
      // Sum downtime minutes
      aggregated.downtime_minutes = inputs.reduce((sum, input) => sum + (input.downtime_minutes || 0), 0);
    }

    return aggregated;
  }

  static getTabDisplayName(key) {
    const names = {
      splunk: 'Splunk Errors',
      cwv: 'Core Web Vitals',
      api: 'API Health',
      prod: 'Production Incidents',
      a11y: 'Accessibility',
      escape: 'Escape Velocity',
      e2e: 'End-to-End Tests',
      down: 'Downtime',
    };
    return names[key] || key;
  }

  getTabValue(key, data) {
    if (!data?.tabs?.[key]) return 0;

    if (this.viewMode === 'score') {
      return data.tabs[key].score;
    }

    // Return appropriate input value based on tab type
    const { inputs } = data.tabs[key];
    switch (key) {
      case 'splunk':
        return inputs.requests?.toLocaleString() || 'N/A';
      case 'cwv':
        return `${inputs.cwv_pass_rate_percent || 0}%`;
      case 'api':
        return `${((inputs.failure_rate || 0) * 100).toFixed(1)}%`;
      case 'prod':
        return inputs.incidents?.length || 0;
      case 'a11y':
        return inputs.a11y_score || 0;
      case 'escape':
        return inputs.count || 0;
      case 'e2e':
        return `${((inputs.failure_rate || 0) * 100).toFixed(1)}%`;
      case 'down':
        return `${inputs.downtime_minutes || 0} min`;
      default:
        return 'N/A';
    }
  }

  getTabUnit(key) {
    if (this.viewMode === 'score') {
      return '';
    }

    const units = {
      splunk: ' requests',
      cwv: '',
      api: '',
      prod: ' incidents',
      a11y: '',
      escape: ' escapes',
      e2e: '',
      down: '',
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

    const score = data.overall.health_score;
    const color = SystemHealthDashboard.getScoreColor(score);

    return html`
      <div class="main-score-container">
        <div class="main-score ${color}">
          <div class="score-value">${score}</div>
          <div class="score-label">System Health Score</div>
          <div class="score-subtitle">${this.timeRange.toUpperCase()} Average</div>
          <div class="score-details">
            <div class="score-detail">Raw Score: ${data.overall.raw_weighted_sum}</div>
            <div class="score-detail">Multiplier: ${data.overall.new_relic_multiplier}</div>
          </div>
        </div>
      </div>
    `;
  }

  renderTabCard(key, data) {
    if (!data?.tabs?.[key]) return nothing;

    const value = this.getTabValue(key, data);
    const displayName = SystemHealthDashboard.getTabDisplayName(key);
    const unit = this.getTabUnit(key);
    const color = this.viewMode === 'score' ? SystemHealthDashboard.getScoreColor(data.tabs[key].score) : 'neutral';
    const { weight } = data.tabs[key];

    return html`
      <div class="metric-card ${color}">
        <div class="metric-header">
          <h3 class="metric-title">${displayName}</h3>
          <span class="metric-weight">${(weight * 100).toFixed(0)}%</span>
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
      {
        label: 'Total Requests',
        value: data.tabs?.splunk?.inputs?.requests?.toLocaleString() || 'N/A',
      },
      {
        label: 'CWV Pass Rate',
        value: `${data.tabs?.cwv?.inputs?.cwv_pass_rate_percent || 0}%`,
      },
      {
        label: 'API Coverage',
        value: `${((data.tabs?.api?.inputs?.coverage || 0) * 100).toFixed(1)}%`,
      },
      {
        label: 'Active Incidents',
        value: data.tabs?.prod?.inputs?.incidents?.length || 0,
      },
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
            <strong>Improve Core Web Vitals:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Focus on critical user journey test cases.
          </div>
        </div>
        <div class="suggestion">
          <div class="suggestion-icon">🔧</div>
          <div class="suggestion-content">
            <strong>Reduce Production Incidents:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consider implementing blue-green deployments.
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

    const tabKeys = [
      'splunk',
      'cwv',
      'api',
      'prod',
      'a11y',
      'escape',
      'e2e',
      'down',
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
            <h3 class="sub-scores-title">Health Categories</h3>
            <div class="sub-scores-grid">
              ${repeat(tabKeys, (key) => this.renderTabCard(key, currentData))}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('system-health-dashboard', SystemHealthDashboard);
