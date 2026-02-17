/**
 * Stage/Prod domain prediction module.
 *
 * Provides bidirectional origin mapping between stage and production environments.
 * Used for event preview page navigation to ensure URLs point to the correct
 * environment across the dashboard and event creation form.
 *
 * @module domain-mapping
 */

/**
 * Domain mapping pairs between stage and production.
 *
 * To add a new mapping, add an entry to this array:
 * - Exact hostnames: { prod: 'example.com', stage: 'stage.example.com' }
 * - Suffix patterns (values starting with '.'):
 *   { prod: '.cdn.com', stage: '.cdn-stage.com' }
 *
 * Entries are matched top-to-bottom. First match wins.
 */
export const DOMAIN_MAP = [
  { prod: 'www.adobe.com', stage: 'www.stage.adobe.com' },
  { prod: 'business.adobe.com', stage: 'business.stage.adobe.com' },
  { prod: '.aem.live', stage: '.aem.page' },
];

function isSuffixEntry(value) {
  return value.startsWith('.');
}

/**
 * Finds a matching map entry and returns the mapped hostname.
 * @param {string} hostname - The hostname to look up
 * @param {'prod'|'stage'} fromKey - The source direction
 * @param {'prod'|'stage'} toKey - The target direction
 * @returns {string|null} The mapped hostname, or null if no match
 */
function mapHostname(hostname, fromKey, toKey) {
  return DOMAIN_MAP.reduce((matched, entry) => {
    if (matched) return matched;
    const from = entry[fromKey];
    const to = entry[toKey];

    if (isSuffixEntry(from) && hostname.endsWith(from)) {
      return hostname.slice(0, -from.length) + to;
    }
    if (hostname === from) return to;
    return null;
  }, null);
}

/**
 * Transforms a URL, origin, or hostname between environments.
 * Returns the input unchanged if no mapping matches.
 * @param {string} input - A full URL, origin, or bare hostname
 * @param {'prod'|'stage'} fromKey - The source direction
 * @param {'prod'|'stage'} toKey - The target direction
 * @returns {string} The transformed input
 */
function transformUrl(input, fromKey, toKey) {
  if (!input) return input;

  try {
    const url = new URL(input);
    const mapped = mapHostname(url.hostname, fromKey, toKey);
    if (!mapped) return input;
    return input.replace(url.hostname, mapped);
  } catch {
    const mapped = mapHostname(input, fromKey, toKey);
    return mapped || input;
  }
}

/**
 * Transforms a URL, origin, or hostname to its stage equivalent.
 * If the input is already a stage origin or doesn't match any mapping,
 * it is returned unchanged.
 *
 * @param {string} input - A full URL, origin, or bare hostname
 * @returns {string} The stage-equivalent input
 *
 * @example
 * toStageOrigin('https://www.adobe.com')
 * // => 'https://www.stage.adobe.com'
 *
 * toStageOrigin('https://main--site--org.aem.live/events/my-event')
 * // => 'https://main--site--org.aem.page/events/my-event'
 *
 * toStageOrigin('www.adobe.com')
 * // => 'www.stage.adobe.com'
 */
export function toStageOrigin(input) {
  return transformUrl(input, 'prod', 'stage');
}

/**
 * Transforms a URL, origin, or hostname to its production equivalent.
 * If the input is already a production origin or doesn't match any mapping,
 * it is returned unchanged.
 *
 * @param {string} input - A full URL, origin, or bare hostname
 * @returns {string} The production-equivalent input
 *
 * @example
 * toProdOrigin('https://www.stage.adobe.com')
 * // => 'https://www.adobe.com'
 *
 * toProdOrigin('https://main--site--org.aem.page/events/my-event')
 * // => 'https://main--site--org.aem.live/events/my-event'
 *
 * toProdOrigin('www.stage.adobe.com')
 * // => 'www.adobe.com'
 */
export function toProdOrigin(input) {
  return transformUrl(input, 'stage', 'prod');
}
