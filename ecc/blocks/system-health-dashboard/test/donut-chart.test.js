import { expect } from '@esm-bundle/chai';
import { fixture, html } from '@open-wc/testing';
import ScoreDonutChart from '../components/score-donut-chart.js';

describe('ScoreDonutChart', () => {
  let element;

  beforeEach(async () => {
    element = await fixture(html`<score-donut-chart></score-donut-chart>`);
  });

  it('should render with no data', () => {
    const shadowRoot = element.shadowRoot;
    const noDataElement = shadowRoot.querySelector('.no-data');
    expect(noDataElement).to.exist;
    expect(noDataElement.textContent.trim()).to.equal('No data available');
  });

  it('should render with valid data', async () => {
    const mockData = {
      overall: {
        health_score: 91.92,
        raw_weighted_sum: 91.92,
        new_relic_multiplier: 1.0
      },
      tabs: {
        splunk: {
          score: 92.0,
          weight: 0.17,
          weighted_contribution: 15.64
        },
        cwv: {
          score: 95.0,
          weight: 0.20,
          weighted_contribution: 19.00
        },
        api: {
          score: 88.0,
          weight: 0.14,
          weighted_contribution: 12.32
        }
      }
    };

    element.data = mockData;
    await element.updateComplete;

    const shadowRoot = element.shadowRoot;
    const chartContainer = shadowRoot.querySelector('.chart-container');
    const svg = chartContainer.querySelector('svg');
    
    expect(chartContainer).to.exist;
    expect(svg).to.exist;
    
    // Check that the center text shows the overall score
    const centerText = svg.querySelector('.center-text text');
    expect(centerText.textContent.trim()).to.equal('91.92');
  });

  it('should prepare donut data correctly', () => {
    const mockData = {
      overall: {
        raw_weighted_sum: 91.92
      },
      tabs: {
        splunk: {
          score: 92.0,
          weight: 0.17,
          weighted_contribution: 15.64
        },
        cwv: {
          score: 95.0,
          weight: 0.20,
          weighted_contribution: 19.00
        }
      }
    };

    element.data = mockData;
    const chartData = element.prepareDonutData();
    
    expect(chartData).to.have.length(2);
    expect(chartData[0].key).to.equal('cwv'); // Should be sorted by weighted contribution
    expect(chartData[0].value).to.equal(19.00);
    expect(chartData[0].percentage).to.equal('20.7');
  });

  it('should render legend with data', async () => {
    const mockData = {
      overall: {
        raw_weighted_sum: 91.92
      },
      tabs: {
        splunk: {
          score: 92.0,
          weight: 0.17,
          weighted_contribution: 15.64
        }
      }
    };

    element.data = mockData;
    await element.updateComplete;

    const shadowRoot = element.shadowRoot;
    const legend = shadowRoot.querySelector('.legend');
    const legendItems = legend.querySelectorAll('.legend-item');
    
    expect(legend).to.exist;
    expect(legendItems).to.have.length(1);
    
    const legendLabel = legendItems[0].querySelector('.legend-label');
    expect(legendLabel.textContent.trim()).to.equal('Splunk Errors');
  });
});
