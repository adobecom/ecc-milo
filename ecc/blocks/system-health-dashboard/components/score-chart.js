/* eslint-disable import/no-unresolved */
/* eslint-disable max-len */
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { LIBS } from '../../../scripts/scripts.js';
import style from './score-chart.css.js';
import { DASHBOARD_CONFIG } from '../config/dashboard-config.js';

const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class ScoreChart extends LitElement {
  static properties = {
    data: { type: Array },
    timeRange: { type: Number },
    visibleLines: { type: Object },
  };

  static styles = style;

  constructor() {
    super();
    this.data = [];
    this.timeRange = 7;
    this.visibleLines = {
      overall: true,
      splunk: true,
      cwv: true,
      api: true,
      prod: true,
      a11y: true,
      escape: true,
      e2e: true,
      down: true,
    };
    this.chart = null;
    this.tooltip = null;
    this.resizeObserver = null;
  }

  firstUpdated() {
    this.createChart();
    if (this.data && this.data.length > 0) {
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
    if (changedProperties.has('data') || changedProperties.has('timeRange') || changedProperties.has('visibleLines')) {
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
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 20, right: 80, bottom: 60, left: 60 };

    const svg = d3.create('svg')
      .attr('width', width)
      .attr('height', height);

    // Create chart group
    this.chart = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

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
    if (!this.chart || !this.data.length) {
      return;
    }

    const container = this.shadowRoot.querySelector('.chart-container');
    const width = container.clientWidth - 140; // Account for margins
    const height = 320; // Account for margins

    // Filter data based on time range
    const filteredData = this.data.slice(-this.timeRange);

    // Prepare data for each line
    const lineData = this.prepareLineData(filteredData);

    // Scales - hardcode y-axis to 0-100 as requested
    const xScale = d3.scaleTime()
      .domain(d3.extent(filteredData, (d) => new Date(d.timestamp)))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // Line generator
    const line = d3.line()
      .x((d) => xScale(new Date(d.timestamp)))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Clear existing content
    this.chart.selectAll('*').remove();

    // Add grid lines
    this.chart.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat('')
        .tickSizeOuter(0));

    this.chart.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat('')
        .tickSizeOuter(0));

    // Style grid lines
    this.chart.selectAll('.grid line')
      .style('stroke', '#e0e0e0')
      .style('stroke-opacity', 0.7);

    // Add axes with intelligent tick spacing
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%b %d'))
      .tickSizeOuter(0);

    // Adjust tick frequency based on time range and data density
    const dateRange = d3.extent(filteredData, (d) => new Date(d.timestamp));
    const daysDiff = Math.ceil((dateRange[1] - dateRange[0]) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 7) {
      xAxis.ticks(d3.timeDay.every(1)); // Daily ticks for 1 week or less
    } else if (daysDiff <= 14) {
      xAxis.ticks(d3.timeDay.every(2)); // Every 2 days for 2 weeks
    } else if (daysDiff <= 30) {
      xAxis.ticks(d3.timeDay.every(3)); // Every 3 days for 1 month
    } else {
      xAxis.ticks(d3.timeWeek.every(1)); // Weekly ticks for longer periods
    }

    this.chart.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .call(ScoreChart.removeDuplicateTicks);

    this.chart.append('g')
      .call(d3.axisLeft(yScale)
        .tickSizeOuter(0));

    // Style axes
    this.chart.selectAll('g:not(.grid) line')
      .style('stroke', '#ccc');

    this.chart.selectAll('g:not(.grid) path')
      .style('stroke', '#ccc');

    this.chart.selectAll('g:not(.grid) text')
      .style('fill', '#666')
      .style('font-size', '12px');

    // Add lines
    const lineColors = {
      overall: '#2c3e50',
      splunk: '#3498db',
      cwv: '#e74c3c',
      api: '#f39c12',
      prod: '#9b59b6',
      a11y: '#1abc9c',
      escape: '#e67e22',
      e2e: '#34495e',
      down: '#95a5a6',
    };

    lineData.forEach(({ key, data: linePoints, label }) => {
      if (!this.visibleLines[key]) return;

      const lineGroup = this.chart.append('g')
        .attr('class', `line-group line-${key}`);

      // Add the line
      lineGroup.append('path')
        .datum(linePoints)
        .attr('fill', 'none')
        .attr('stroke', lineColors[key])
        .attr('stroke-width', key === 'overall' ? 3 : 2)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', line);

      // Add dots for hover interaction
      lineGroup.selectAll('.dot')
        .data(linePoints)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => xScale(new Date(d.timestamp)))
        .attr('cy', (d) => yScale(d.value))
        .attr('r', key === 'overall' ? 4 : 3)
        .attr('fill', lineColors[key])
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', (event, d) => {
          this.showTooltip(event, d, key, label);
        })
        .on('mouseout', () => {
          this.hideTooltip();
        });
    });
  }

  prepareLineData(data) {
    const lines = [];

    // Overall score line
    if (this.visibleLines.overall) {
      lines.push({
        key: 'overall',
        label: 'Overall Health Score',
        data: data.map((d) => ({
          timestamp: d.timestamp,
          value: d.overall.health_score,
        })),
      });
    }

    // Sub-score lines
    Object.keys(DASHBOARD_CONFIG.TABS).forEach((tabKey) => {
      if (this.visibleLines[tabKey]) {
        lines.push({
          key: tabKey,
          label: DASHBOARD_CONFIG.TABS[tabKey].label,
          data: data.map((d) => ({
            timestamp: d.timestamp,
            value: d.tabs[tabKey]?.score || 0,
          })),
        });
      }
    });

    return lines;
  }

  showTooltip(event, data, key, label) {
    const date = new Date(data.timestamp);
    const dateStr = d3.timeFormat('%B %d, %Y')(date);

    this.tooltip
      .style('visibility', 'visible')
      .html(`
        <div><strong>${label}</strong></div>
        <div>Date: ${dateStr}</div>
        <div>Score: ${data.value.toFixed(1)}</div>
      `)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 10}px`);
  }

  hideTooltip() {
    this.tooltip.style('visibility', 'hidden');
  }

  static removeDuplicateTicks(selection) {
    const texts = selection.selectAll('text');
    const textData = [];

    texts.each(function () {
      textData.push(d3.select(this).text());
    });

    texts.each(function (d, i) {
      const currentText = d3.select(this).text();
      const isDuplicate = textData.indexOf(currentText) !== i;

      if (isDuplicate) {
        d3.select(this).style('display', 'none');
      }
    });
  }

  toggleLine(lineKey) {
    this.visibleLines = {
      ...this.visibleLines,
      [lineKey]: !this.visibleLines[lineKey],
    };
  }

  renderLegend() {
    const lineColors = {
      overall: '#2c3e50',
      splunk: '#3498db',
      cwv: '#e74c3c',
      api: '#f39c12',
      prod: '#9b59b6',
      a11y: '#1abc9c',
      escape: '#e67e22',
      e2e: '#34495e',
      down: '#95a5a6',
    };

    const legendItems = [
      { key: 'overall', label: 'Overall Health Score' },
      ...Object.keys(DASHBOARD_CONFIG.TABS).map((tabKey) => ({
        key: tabKey,
        label: DASHBOARD_CONFIG.TABS[tabKey].label,
      })),
    ];

    return html`
      <div class="legend">
        ${legendItems.map((item) => html`
          <div class="legend-item ${this.visibleLines[item.key] ? 'active' : 'inactive'}" 
               @click=${() => this.toggleLine(item.key)}>
            <div class="legend-color" style="background-color: ${lineColors[item.key]}"></div>
            <span class="legend-label">${item.label}</span>
            <div class="legend-toggle">
              ${this.visibleLines[item.key] ? '●' : '○'}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  render() {
    if (!this.data || this.data.length === 0) {
      return html`
        <div class="chart-card">
          <h3>Score Trends</h3>
          <div class="no-data">No data available for the selected time range</div>
        </div>
      `;
    }

    return html`
      <div class="chart-card">
        <h3>Score Trends</h3>
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
