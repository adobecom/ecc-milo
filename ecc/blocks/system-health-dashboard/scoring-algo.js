/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable max-len */
// scoring.js
// Updated scoring for the new tab-based health dashboard structure

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const safeDiv = (num, den) => (den === 0 ? 0 : num / den);
const round1 = (v) => Math.round(v * 10) / 10;

export const normalizeWeights = (w) => {
  const sum = Object.values(w).reduce((s, x) => s + x, 0);
  if (sum === 0) throw new Error('Weights cannot sum to 0');
  const s = 1 / sum;
  const out = {};
  Object.keys(w).forEach((k) => {
    out[k] = w[k] * s;
  });
  return out;
};

/** --- Per-tab scoring formulas (0..100), higher is better --- * */

// Splunk scoring based on error rates and request volume
export const scoreSplunk = (inputs) => {
  const { requests, _baseline_requests, errors } = inputs;
  const totalErrors = Object.values(errors).reduce((sum, count) => sum + count, 0);
  const errorRate = safeDiv(totalErrors, requests) * 1000; // per 1k requests

  // Penalize high error rates
  if (errorRate > 10) return clamp(100 - (errorRate - 10) * 5);
  if (errorRate > 5) return clamp(90 - (errorRate - 5) * 2);
  if (errorRate > 1) return clamp(95 - (errorRate - 1) * 1);
  return 100;
};

// Core Web Vitals scoring
export const scoreCWV = (inputs) => {
  const { cwv_pass_rate_percent } = inputs;
  return clamp(cwv_pass_rate_percent);
};

// API health scoring based on failure rate and coverage
export const scoreAPI = (inputs) => {
  const { failure_rate, coverage } = inputs;
  const failureScore = clamp(100 - failure_rate * 1000); // Convert to percentage
  const coverageScore = clamp(coverage * 100);
  return round1((failureScore * 0.7) + (coverageScore * 0.3));
};

// Production incidents scoring
export const scoreProd = (inputs) => {
  const { incidents } = inputs;
  if (!incidents || incidents.length === 0) return 100;

  let totalPenalty = 0;
  incidents.forEach((incident) => {
    const severityMultiplier = incident.severity === 'high' ? 30 : incident.severity === 'medium' ? 20 : 10;
    const daysPenalty = Math.min(incident.days_open * 5, 20);
    totalPenalty += severityMultiplier + daysPenalty;
  });

  return clamp(100 - totalPenalty);
};

// Accessibility scoring
export const scoreA11y = (inputs) => {
  const { a11y_score } = inputs;
  return clamp(a11y_score);
};

// Escape velocity scoring
export const scoreEscape = (inputs) => {
  const { count } = inputs;
  if (count === 0) return 100;
  if (count === 1) return 90;
  if (count === 2) return 80;
  if (count === 3) return 70;
  return clamp(100 - count * 15);
};

// End-to-end test scoring
export const scoreE2E = (inputs) => {
  const { failure_rate } = inputs;
  return clamp(100 - failure_rate * 1000); // Convert to percentage
};

// Downtime scoring
export const scoreDown = (inputs) => {
  const { downtime_minutes } = inputs;
  if (downtime_minutes === 0) return 100;
  if (downtime_minutes <= 5) return 95;
  if (downtime_minutes <= 15) return 90;
  if (downtime_minutes <= 30) return 80;
  if (downtime_minutes <= 60) return 70;
  return clamp(100 - downtime_minutes * 0.5);
};

// New Relic multiplier calculation
export const calculateNewRelicMultiplier = (inputs) => {
  const { incident_open, days_since_last_incident } = inputs;

  if (incident_open) return 0.95; // 5% penalty for open incident

  // Bonus for days without incidents
  if (days_since_last_incident >= 30) return 1.02; // 2% bonus
  if (days_since_last_incident >= 14) return 1.01; // 1% bonus

  return 1.0; // No multiplier
};

/**
 * Compute per-day tab scores and overall health.
 * @param {object} dayData raw daily data with tabs
 */
export function computeDayScores(dayData) {
  const { tabs } = dayData;
  const computedTabs = {};

  // Compute scores for each tab
  Object.keys(tabs).forEach((tabKey) => {
    if (tabKey === 'new_relic') {
      computedTabs[tabKey] = {
        ...tabs[tabKey],
        multiplier: calculateNewRelicMultiplier(tabs[tabKey].inputs),
      };
    } else {
      const { inputs } = tabs[tabKey];
      let score = 0;

      switch (tabKey) {
        case 'splunk':
          score = scoreSplunk(inputs);
          break;
        case 'cwv':
          score = scoreCWV(inputs);
          break;
        case 'api':
          score = scoreAPI(inputs);
          break;
        case 'prod':
          score = scoreProd(inputs);
          break;
        case 'a11y':
          score = scoreA11y(inputs);
          break;
        case 'escape':
          score = scoreEscape(inputs);
          break;
        case 'e2e':
          score = scoreE2E(inputs);
          break;
        case 'down':
          score = scoreDown(inputs);
          break;
        default:
          score = tabs[tabKey].score; // Use existing score if no formula
      }

      computedTabs[tabKey] = {
        ...tabs[tabKey],
        score: round1(score),
        weighted_contribution: round1(score * tabs[tabKey].weight),
      };
    }
  });

  // Calculate overall health score
  const rawWeightedSum = Object.values(computedTabs)
    .filter((tab) => tab.weighted_contribution !== undefined)
    .reduce((sum, tab) => sum + tab.weighted_contribution, 0);

  const newRelicMultiplier = computedTabs.new_relic.multiplier;
  const healthScore = round1(rawWeightedSum * newRelicMultiplier);

  return {
    timestamp: dayData.timestamp,
    overall: {
      raw_weighted_sum: round1(rawWeightedSum),
      new_relic_multiplier: round1(newRelicMultiplier * 10000) / 10000,
      health_score: healthScore,
    },
    tabs: computedTabs,
  };
}

/**
 * Aggregate scores across multiple days.
 * @param {array} days array of day data
 */
export function aggregateScores(days) {
  if (days.length === 0) return null;

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

  // Aggregate scores
  tabKeys.forEach((tabKey) => {
    if (tabKey === 'new_relic') return;

    const scores = days.map((day) => day.tabs[tabKey].score);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    aggregatedTabs[tabKey].score = round1(avgScore);
    aggregatedTabs[tabKey].weighted_contribution = round1(avgScore * aggregatedTabs[tabKey].weight);
  });

  // Calculate overall aggregated score
  const rawWeightedSum = Object.values(aggregatedTabs)
    .reduce((sum, tab) => sum + tab.weighted_contribution, 0);

  const newRelicMultipliers = days.map((day) => day.tabs.new_relic.multiplier);
  const avgMultiplier = newRelicMultipliers.reduce((sum, mult) => sum + mult, 0) / newRelicMultipliers.length;

  const healthScore = round1(rawWeightedSum * avgMultiplier);

  return {
    timestamp: days[days.length - 1].timestamp,
    overall: {
      raw_weighted_sum: round1(rawWeightedSum),
      new_relic_multiplier: round1(avgMultiplier * 10000) / 10000,
      health_score: healthScore,
    },
    tabs: aggregatedTabs,
  };
}

/**
 * Validate that computed scores match the provided scores.
 * @param {object} dayData day data with existing scores
 * @returns {object} validation results
 */
export function validateScores(dayData) {
  const computed = computeDayScores(dayData);
  const original = dayData;

  const validation = {
    overall: {
      health_score_match: Math.abs(computed.overall.health_score - original.overall.health_score) < 0.1,
      raw_weighted_sum_match: Math.abs(computed.overall.raw_weighted_sum - original.overall.raw_weighted_sum) < 0.1,
      multiplier_match: Math.abs(computed.overall.new_relic_multiplier - original.overall.new_relic_multiplier) < 0.0001,
    },
    tabs: {},
  };

  Object.keys(computed.tabs).forEach((tabKey) => {
    if (tabKey !== 'new_relic') {
      validation.tabs[tabKey] = {
        score_match: Math.abs(computed.tabs[tabKey].score - original.tabs[tabKey].score) < 0.1,
        weighted_contribution_match: Math.abs(computed.tabs[tabKey].weighted_contribution - original.tabs[tabKey].weighted_contribution) < 0.1,
      };
    }
  });

  return validation;
}
