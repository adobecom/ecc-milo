/* eslint-disable max-len */
// scoring.js
// Deterministic scoring for daily and windowed (1d/3d/7d/… ) health scores.

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

/** --- Per-subscore formulas (0..100), higher is better --- * */
export const scoreSplunkErrorRate = (errorsPer1k, maxBad) => clamp(100 * (1 - errorsPer1k / Math.max(1, maxBad)));

export const scoreProdIncidents = (incidents) => {
  if (incidents <= 0) return 100;
  if (incidents === 1) return 80;
  if (incidents === 2) return 60;
  if (incidents === 3) return 40;
  return 25; // ≥4
};

export const scoreStageToProdRegressions = (count, penaltyPer = 30) => clamp(100 - penaltyPer * count);

export const scoreAutomationFailures = (failCount, penaltyPer = 10) => clamp(100 - penaltyPer * failCount);

export const scoreDowntime = (minutes, maxBad) => clamp(100 * (1 - minutes / Math.max(1, maxBad)));

export const scoreCoverageGently = (coveragePct, targetPct) => {
  if (coveragePct >= targetPct) return 100;
  return clamp(100 * safeDiv(coveragePct, Math.max(1, targetPct)));
};

export const scorePassRate = (pct) => clamp(pct);
export const scoreDeploymentSuccess = (pct) => clamp(pct);

/**
 * Compute per-day subscores and health.
 * @param {object} m raw daily metrics
 * @param {object} bounds { max_error_rate_per_1k, max_downtime_minutes, target_unit_test_coverage, target_regression_pass_rate }
 * @param {object} weightsRaw keys must match returned sub_scores keys
 */
export function computeDayScore(m, bounds, weightsRaw) {
  const w = normalizeWeights(weightsRaw);

  const sub = {
    splunk_error_rate: round1(
      scoreSplunkErrorRate(m.splunk_errors_per_1k_requests, bounds.max_error_rate_per_1k),
    ),
    prod_incidents: round1(scoreProdIncidents(m.prod_incidents)),
    stage_to_prod_regressions: round1(
      scoreStageToProdRegressions(m.stage_to_prod_regressions),
    ),
    automation_failures_api: round1(
      scoreAutomationFailures(m.automation_failures_api),
    ),
    automation_failures_ui: round1(
      scoreAutomationFailures(m.automation_failures_ui),
    ),
    downtime: round1(scoreDowntime(m.downtime_minutes, bounds.max_downtime_minutes)),
    unit_test_coverage: round1(
      scoreCoverageGently(m.unit_test_coverage_percent, bounds.target_unit_test_coverage),
    ),
    regression_pass_rate: round1(
      scoreCoverageGently(m.regression_pass_rate_percent, bounds.target_regression_pass_rate),
    ),
    deployment_success_rate: round1(
      scoreDeploymentSuccess(m.deployment_success_rate_percent),
    ),
  };

  let health = 0;
  Object.keys(sub).forEach((k) => {
    health += sub[k] * w[k];
  });

  return {
    date: m.date,
    sub_scores: sub,
    health_score: round1(health),
  };
}

const emptySubscores = () => ({
  splunk_error_rate: 0,
  prod_incidents: 0,
  stage_to_prod_regressions: 0,
  automation_failures_api: 0,
  automation_failures_ui: 0,
  downtime: 0,
  unit_test_coverage: 0,
  regression_pass_rate: 0,
  deployment_success_rate: 0,
});

/**
 * Aggregate across an inclusive date range.
 * Strategy: average each subscore across days present, then apply weights once.
 */
export function computeAggregateScore(days, startInclusive, endInclusive, bounds, weightsRaw) {
  const w = normalizeWeights(weightsRaw);
  const inRange = days.filter((d) => d.date >= startInclusive && d.date <= endInclusive);
  if (inRange.length === 0) {
    return {
      range_start: startInclusive,
      range_end: endInclusive,
      aggregate_sub_scores: emptySubscores(),
      health_score: 0,
    };
  }

  // Compute day subscores first, then average by key.
  const dayScores = inRange.map((d) => computeDayScore(d, bounds, w).sub_scores);

  const keys = Object.keys(dayScores[0]);
  const agg = {};
  keys.forEach((k) => {
    const avg = dayScores.reduce((s, ds) => s + ds[k], 0) / dayScores.length;
    agg[k] = round1(avg);
  });

  let health = 0;
  keys.forEach((k) => {
    health += agg[k] * w[k];
  });

  return {
    range_start: startInclusive,
    range_end: endInclusive,
    aggregate_sub_scores: agg,
    health_score: round1(health),
  };
}

/**
 * Optional helper: if some metrics are missing for a day,
 * drop those subscores and renormalize weights on the fly.
 * Call like: computeDayScoreFlexible(m, bounds, weightsRaw, ['automation_failures_ui'])
 */
export function computeDayScoreFlexible(m, bounds, weightsRaw, dropKeys = []) {
  const full = computeDayScore(m, bounds, weightsRaw);
  if (!dropKeys.length) return full;

  const sub = { ...full.sub_scores };
  const w = { ...normalizeWeights(weightsRaw) };
  dropKeys.forEach((k) => {
    delete sub[k];
    delete w[k];
  });
  const wRenorm = normalizeWeights(w);

  let health = 0;
  Object.keys(sub).forEach((k) => {
    health += sub[k] * wRenorm[k];
  });

  return {
    date: full.date,
    sub_scores: sub,
    health_score: round1(health),
  };
}
