/* eslint-disable max-len */
// Data service for handling dashboard data operations

export default class DashboardDataService {
  /**
   * Get aggregated data for a specific time range
   * @param {Array} days - Array of daily data
   * @param {number|string} timeRange - Number of days or legacy string format
   * @returns {Object|null} Aggregated data
   */
  static getAggregatedData(days, timeRange) {
    if (!days || !days.length) return null;

    // Handle legacy string format for backward compatibility
    if (typeof timeRange === 'string') {
      switch (timeRange) {
        case '1d':
          return days[days.length - 1];
        case '3d':
          return this.aggregateData(days.slice(-3));
        case '7d':
          return this.aggregateData(days);
        default:
          return this.aggregateData(days);
      }
    }

    // Handle numeric days
    const daysToShow = Math.min(timeRange, days.length);
    if (daysToShow === 1) {
      return days[days.length - 1];
    }

    return this.aggregateData(days.slice(-daysToShow));
  }

  /**
   * Aggregate data across multiple days
   * @param {Array} days - Array of daily data
   * @returns {Object|null} Aggregated data
   */
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

      // Aggregate inputs
      const inputs = days.map((day) => day.tabs[tabKey].inputs);
      aggregatedTabs[tabKey].inputs = this.aggregateInputs(inputs, tabKey);
    });

    // Calculate overall health score
    const rawWeightedSum = Object.values(aggregatedTabs)
      .reduce((sum, tab) => sum + tab.weighted_contribution, 0);

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

  /**
   * Aggregate inputs for a specific tab type
   * @param {Array} inputs - Array of input objects
   * @param {string} tabKey - Tab identifier
   * @returns {Object} Aggregated inputs
   */
  static aggregateInputs(inputs, tabKey) {
    const aggregators = {
      splunk: this.aggregateSplunkInputs,
      cwv: this.aggregateCWVInputs,
      api: this.aggregateAPIInputs,
      prod: this.aggregateProdInputs,
      a11y: this.aggregateA11yInputs,
      escape: this.aggregateEscapeInputs,
      e2e: this.aggregateE2EInputs,
      down: this.aggregateDownInputs,
    };

    const aggregator = aggregators[tabKey];
    return aggregator ? aggregator(inputs) : {};
  }

  static aggregateSplunkInputs(inputs) {
    return {
      requests: inputs.reduce((sum, input) => sum + (input.requests || 0), 0),
      baseline_requests: inputs.reduce((sum, input) => sum + (input.baseline_requests || 0), 0) / inputs.length,
      errors: {
        500: inputs.reduce((sum, input) => sum + (input.errors?.[500] || 0), 0),
        503: inputs.reduce((sum, input) => sum + (input.errors?.[503] || 0), 0),
        418: inputs.reduce((sum, input) => sum + (input.errors?.[418] || 0), 0),
        401: inputs.reduce((sum, input) => sum + (input.errors?.[401] || 0), 0),
        404: inputs.reduce((sum, input) => sum + (input.errors?.[404] || 0), 0),
      },
    };
  }

  static aggregateCWVInputs(inputs) {
    return {
      cwv_pass_rate_percent: Math.round(
        inputs.reduce((sum, input) => sum + (input.cwv_pass_rate_percent || 0), 0) / inputs.length,
      ),
    };
  }

  static aggregateAPIInputs(inputs) {
    return {
      failure_rate: Math.round(
        (inputs.reduce((sum, input) => sum + (input.failure_rate || 0), 0) / inputs.length) * 1000,
      ) / 1000,
      coverage: Math.round(
        (inputs.reduce((sum, input) => sum + (input.coverage || 0), 0) / inputs.length) * 100,
      ) / 100,
    };
  }

  static aggregateProdInputs(inputs) {
    return {
      incidents: inputs.reduce((all, input) => {
        if (input.incidents && input.incidents.length > 0) {
          return all.concat(input.incidents);
        }
        return all;
      }, []),
    };
  }

  static aggregateA11yInputs(inputs) {
    return {
      a11y_score: Math.round(
        inputs.reduce((sum, input) => sum + (input.a11y_score || 0), 0) / inputs.length,
      ),
    };
  }

  static aggregateEscapeInputs(inputs) {
    return { count: inputs.reduce((sum, input) => sum + (input.count || 0), 0) };
  }

  static aggregateE2EInputs(inputs) {
    return {
      failure_rate: Math.round(
        (inputs.reduce((sum, input) => sum + (input.failure_rate || 0), 0) / inputs.length) * 1000,
      ) / 1000,
    };
  }

  static aggregateDownInputs(inputs) {
    return { downtime_minutes: inputs.reduce((sum, input) => sum + (input.downtime_minutes || 0), 0) };
  }
}
