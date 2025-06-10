import { DOMAINS, ENVIRONMENTS, IMS_ENVIRONMENTS, HOST_PATTERNS } from './constants.js';

/**
 * Environment detection and configuration module
 * @module environment
 */

/**
 * @typedef {Object} EnvironmentConfig
 * @property {string} LOCAL - Local development environment
 * @property {string} DEV - Development environment
 * @property {string} DEV02 - Secondary development environment
 * @property {string} STAGE - Staging environment
 * @property {string} STAGE02 - Secondary staging environment
 * @property {string} PROD - Production environment
 */

/**
 * @typedef {Object} ImsEnvironmentConfig
 * @property {string} STAGE - IMS staging environment
 * @property {string} PROD - IMS production environment
 */

/**
 * Gets the current hostname from location
 * @param {Location} [location=window.location]
 * @returns {string} The current hostname
 * @private
 */
function getHostname(location = window.location) {
  if (typeof window === 'undefined' && !location) {
    throw new Error('Environment detection is only available in browser context');
  }
  return location.hostname;
}

/**
 * Gets the current host from location
 * @param {Location} [location=window.location]
 * @returns {string} The current host
 * @private
 */
function getHost(location = window.location) {
  if (typeof window === 'undefined' && !location) {
    throw new Error('Environment detection is only available in browser context');
  }
  return location.host;
}

/**
 * Gets the current search parameters from location
 * @param {Location} [location=window.location]
 * @returns {URLSearchParams} The current search parameters
 * @private
 */
function getSearchParams(location = window.location) {
  if (typeof window === 'undefined' && !location) {
    throw new Error('Environment detection is only available in browser context');
  }
  return new URLSearchParams(location.search);
}

/**
 * Determines the current environment based on the hostname
 * @param {Location} [location=window.location]
 * @returns {string} The current environment
 * @throws {Error} If environment detection is not available
 */
export function getCurrentEnvironment(location = window.location) {
  const host = getHost(location);
  const hostname = getHostname(location);
  const searchParams = getSearchParams(location);
  const localTest = searchParams.get('localTest');

  // Check for local environment first
  if (hostname.includes('localhost') && localTest) {
    return ENVIRONMENTS.LOCAL;
  }

  // Check if we're in AEM or HLX environment
  const SLD = host.includes('.aem.') ? 'aem' : 'hlx';
  if (host.includes(`${SLD}.page`) || host.includes(`${SLD}.live`)) {
    // Check each environment pattern
    const matchedEnv = Object.entries(HOST_PATTERNS)
      .find(([, pattern]) => pattern(host))?.[0];
    return matchedEnv || ENVIRONMENTS.DEV;
  }

  // Fallback to dev environment
  return ENVIRONMENTS.DEV;
}

/**
 * Checks if the current environment matches the specified environment
 * @param {string} environment - The environment to check against
 * @param {Location} [location=window.location]
 * @returns {boolean} True if the current environment matches
 * @throws {Error} If environment detection is not available
 */
export function isEnvironment(environment, location = window.location) {
  if (!Object.values(ENVIRONMENTS).includes(environment)) {
    throw new Error(`Invalid environment: ${environment}`);
  }
  return getCurrentEnvironment(location) === environment;
}

/**
 * Gets the IMS environment based on the current environment
 * @param {Location} [location=window.location]
 * @returns {string} The IMS environment ('stg1' for dev/stage, 'prod' for production)
 * @throws {Error} If environment detection is not available
 */
export function getImsEnvironment(location = window.location) {
  const currentEnv = getCurrentEnvironment(location);
  return currentEnv === ENVIRONMENTS.PROD ? IMS_ENVIRONMENTS.PROD : IMS_ENVIRONMENTS.STAGE;
}

/**
 * Gets the event service host based on the current environment
 * @param {string} [relativeDomain] - Optional relative domain to use
 * @param {Location} [location=window.location]
 * @returns {string} The event service host URL
 * @throws {Error} If environment detection is not available
 */
export function getEventServiceHost(relativeDomain, location = window.location) {
  const currentEnv = getCurrentEnvironment(location);
  const { hostname, href, origin } = location;

  if (href.includes('.hlx.') || href.includes('.aem.')) {
    return origin.replace(
      hostname,
      `${currentEnv}--events-milo--adobecom.aem.page`,
    );
  }

  if (relativeDomain) return relativeDomain;

  if ([
    DOMAINS.STAGE_ADOBE_COM,
    DOMAINS.ADOBE_COM,
  ].includes(hostname)) {
    return origin;
  }

  if (hostname.includes(DOMAINS.LOCALHOST)) {
    return 'https://dev--events-milo--adobecom.hlx.page';
  }

  return `https://${DOMAINS.ADOBE_COM}`;
}
