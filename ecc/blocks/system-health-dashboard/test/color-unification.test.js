import { expect } from '@esm-bundle/chai';
import { DASHBOARD_CONFIG, getTabColor } from '../config/dashboard-config.js';

describe('Color Unification', () => {
  it('should have consistent colors across components', () => {
    const expectedColors = {
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

    // Check that config has the expected colors
    expect(DASHBOARD_CONFIG.CHART_COLORS).to.deep.equal(expectedColors);

    // Check that getTabColor function returns correct colors
    Object.entries(expectedColors).forEach(([tabKey, expectedColor]) => {
      expect(getTabColor(tabKey)).to.equal(expectedColor);
    });
  });

  it('should return fallback color for unknown tab keys', () => {
    expect(getTabColor('unknown')).to.equal('#95a5a6');
  });

  it('should have colors for all tab keys', () => {
    const tabKeys = Object.keys(DASHBOARD_CONFIG.TABS);
    
    tabKeys.forEach((tabKey) => {
      expect(DASHBOARD_CONFIG.CHART_COLORS[tabKey]).to.exist;
      expect(getTabColor(tabKey)).to.be.a('string');
      expect(getTabColor(tabKey)).to.match(/^#[0-9a-fA-F]{6}$/); // Valid hex color
    });
  });
});
