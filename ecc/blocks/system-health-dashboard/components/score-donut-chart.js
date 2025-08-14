/* eslint-disable import/no-unresolved */
/* eslint-disable max-len */
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { LIBS } from '../../../scripts/scripts.js';
import style from './score-donut-chart.css.js';
import { DASHBOARD_CONFIG } from '../config/dashboard-config.js';

const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class ScoreDonutChart extends LitElement {
  static properties = {
    data: { type: Object },
    viewMode: { type: String },
  };

  static styles = style;

  constructor() {
    super();
    this.data = null;
    this.viewMode = 'score';
    this.chart = null;
    this.tooltip = null;
    this.resizeObserver = null;
  }

  firstUpdated() {
    this.createChart();
    if (this.data) {
      this.updateChart();
    }

    // Set up resize observer for responsive chart
    const container = this.shadowRoot.querySelector('.chart-container');
    if (container) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateChart();
      });
      this.resizeObserver.observe(container);
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('data') || changedProperties.has('viewMode')) {
      this.requestUpdate();
      this.updateChart();
    }
  }

  createChart() {
    const container = this.shadowRoot.querySelector('.chart-container');
    if (!container) return;

    // Clear existing chart
    container.innerHTML = '';

    // Create SVG
    const width = 400;
    const height = 400;

    const svg = d3.create('svg')
      .attr('width', width)
      .attr('height', height);

    // Create chart group
    this.chart = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Create tooltip
    this.tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    container.appendChild(svg.node());
  }

  updateChart() {
    if (!this.chart || !this.data) {
      return;
    }

    const container = this.shadowRoot.querySelector('.chart-container');
    const width = container.clientWidth;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 40;
    const innerRadius = radius * 0.6; // Donut hole

    // Prepare data for donut chart
    const chartData = this.prepareDonutData();

    if (chartData.length === 0) {
      this.chart.selectAll('*').remove();
      this.chart.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '14px')
        .style('fill', '#666')
        .text('No data available');
      return;
    }

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(chartData.map((d) => d.key))
      .range([
        '#3498db', // splunk
        '#e74c3c', // cwv
        '#f39c12', // api
        '#9b59b6', // prod
        '#1abc9c', // a11y
        '#e67e22', // escape
        '#34495e', // e2e
        '#95a5a6', // down
      ]);

    // Arc generator
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    // Pie generator
    const pie = d3.pie()
      .value((d) => d.value)
      .sort(null);

    // Clear existing content
    this.chart.selectAll('*').remove();

    // Create donut segments
    const segments = this.chart.selectAll('.segment')
      .data(pie(chartData))
      .enter()
      .append('g')
      .attr('class', 'segment');

    // Add paths
    segments.append('path')
      .attr('d', arc)
      .attr('fill', (d) => colorScale(d.data.key))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        this.showTooltip(event, d);
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1.05)');
      })
      .on('mouseout', (event) => {
        this.hideTooltip();
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1)');
      });

    // Add center text
    const centerGroup = this.chart.append('g')
      .attr('class', 'center-text');

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(`${this.data.overall.health_score}`);

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.5em')
      .style('font-size', '14px')
      .style('fill', '#666')
      .text('Overall Score');

    // Add labels
    const labels = this.chart.selectAll('.label')
      .data(pie(chartData))
      .enter()
      .append('g')
      .attr('class', 'label')
      .attr('transform', (d) => `translate(${arc.centroid(d)})`);

    // Add percentage labels
    labels.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)')
      .text((d) => {
        const percentage = ((d.data.value / this.data.overall.raw_weighted_sum) * 100).toFixed(1);
        return percentage > 5 ? `${percentage}%` : '';
      });
  }

  prepareDonutData() {
    if (!this.data?.tabs) return [];

    const chartData = [];
    const totalWeightedSum = this.data.overall.raw_weighted_sum;

    Object.keys(DASHBOARD_CONFIG.TABS).forEach((tabKey) => {
      const tabData = this.data.tabs[tabKey];
      if (tabData && tabData.weighted_contribution > 0) {
        chartData.push({
          key: tabKey,
          label: DASHBOARD_CONFIG.TABS[tabKey].label,
          value: tabData.weighted_contribution,
          score: tabData.score,
          weight: tabData.weight,
          percentage: ((tabData.weighted_contribution / totalWeightedSum) * 100).toFixed(1),
        });
      }
    });

    // Sort by weighted contribution (largest first)
    return chartData.sort((a, b) => b.value - a.value);
  }

  showTooltip(event, data) {
    const percentage = ((data.data.value / this.data.overall.raw_weighted_sum) * 100).toFixed(1);

    this.tooltip
      .style('visibility', 'visible')
      .html(`
        <div><strong>${data.data.label}</strong></div>
        <div>Score: ${data.data.score}</div>
        <div>Weight: ${data.data.weight}</div>
        <div>Contribution: ${data.data.value.toFixed(1)} (${percentage}%)</div>
      `)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 10}px`);
  }

  hideTooltip() {
    this.tooltip.style('visibility', 'hidden');
  }

  renderLegend() {
    if (!this.data?.tabs) return html``;

    const chartData = this.prepareDonutData();
    const colorScale = d3.scaleOrdinal()
      .domain(chartData.map((d) => d.key))
      .range([
        '#3498db', '#e74c3c', '#f39c12', '#9b59b6',
        '#1abc9c', '#e67e22', '#34495e', '#95a5a6',
      ]);

    return html`
      <div class="legend">
        ${chartData.map((item) => html`
          <div class="legend-item">
            <div class="legend-color" style="background-color: ${colorScale(item.key)}"></div>
            <div class="legend-content">
              <div class="legend-label">${item.label}</div>
              <div class="legend-details">
                <span class="legend-score">${item.score}</span>
                <span class="legend-weight">(w: ${item.weight})</span>
                <span class="legend-contribution">${item.percentage}%</span>
              </div>
            </div>
          </div>
        `)}
      </div>
    `;
  }

  render() {
    if (!this.data) {
      return html`
        <div class="chart-card">
          <h3>Score Breakdown</h3>
          <div class="no-data">No data available</div>
        </div>
      `;
    }

    return html`
      <div class="chart-card">
        <h3>Score Breakdown</h3>
        <div class="chart-description">
          Weighted contribution of each health category to the overall score
        </div>
        <div class="chart-container"></div>
        ${this.renderLegend()}
      </div>
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.tooltip) {
      this.tooltip.remove();
    }
  }
}
