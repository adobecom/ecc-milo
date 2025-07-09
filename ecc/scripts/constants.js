/**
 * Environment and domain constants used across the application
 */

/**
 * Available application environments
 */
export const ENVIRONMENTS = Object.freeze({
  LOCAL: 'local',
  DEV: 'dev',
  DEV02: 'dev02',
  STAGE: 'stage',
  STAGE02: 'stage02',
  PROD: 'prod',
});

/**
 * Available IMS environments
 */
export const IMS_ENVIRONMENTS = Object.freeze({
  STAGE: 'stg1',
  PROD: 'prod',
});

/**
 * Domain constants used across the application
 */
export const DOMAINS = Object.freeze({
  ADOBE_COM: 'www.adobe.com',
  INTERNAL_ADOBE_COM: 'events-internal.adobe.com',
  STAGE_ADOBE_COM: 'www.stage.adobe.com',
  STAGE_INTERNAL_ADOBE_COM: 'events-internal.stage.adobe.com',
  LOCALHOST: 'localhost',
  DEV_ADOBE_COM: 'dev.adobe.com',
  DEV_INTERNAL_ADOBE_COM: 'events-internal.dev.adobe.com',
  DEV02_ADOBE_COM: 'dev02.adobe.com',
  STAGE02_ADOBE_COM: 'stage02.adobe.com',
  CORP_ADOBE_COM: 'corp.adobe.com',
  GRAYBOX_ADOBE_COM: 'graybox.adobe.com',
});

/**
 * Environment detection patterns
 */
export const HOST_PATTERNS = Object.freeze({
  [ENVIRONMENTS.LOCAL]: (host) => host.includes(DOMAINS.LOCALHOST),
  [ENVIRONMENTS.DEV02]: (host) => host.startsWith('dev02--') || host.includes(DOMAINS.DEV02_ADOBE_COM),
  [ENVIRONMENTS.DEV]: (host) => host.startsWith('dev--')
    || host.includes(DOMAINS.DEV_ADOBE_COM)
    || host.includes(DOMAINS.DEV_INTERNAL_ADOBE_COM),
  [ENVIRONMENTS.STAGE]: (host) => host.startsWith('stage--')
    || host.includes(DOMAINS.STAGE_ADOBE_COM)
    || host.includes(DOMAINS.STAGE_INTERNAL_ADOBE_COM)
    || host.includes(DOMAINS.CORP_ADOBE_COM)
    || host.includes(DOMAINS.GRAYBOX_ADOBE_COM),
  [ENVIRONMENTS.STAGE02]: (host) => host.startsWith('stage02--') || host.includes(DOMAINS.STAGE02_ADOBE_COM),
  [ENVIRONMENTS.PROD]: (host) => host.startsWith('main--')
    || host.endsWith('adobe.com')
    || host.includes(DOMAINS.INTERNAL_ADOBE_COM),
});

export const LINK_REGEX = '^https:\\/\\/[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,63}(:[0-9]{1,5})?(\\/.*)?$';
export const ALLOWED_ACCOUNT_TYPES = ['type3', 'type2e'];
export const SUPPORTED_CLOUDS = [{ id: 'CreativeCloud', name: 'Creative Cloud' }, { id: 'ExperienceCloud', name: 'Experience Cloud' }];

export const API_CONFIG = {
  esl: {
    [ENVIRONMENTS.LOCAL]: { host: 'https://wcms-events-service-layer-deploy-ethos102-stage-va-9c3ecd.stage.cloud.adobe.io' },
    [ENVIRONMENTS.DEV]: { host: 'https://wcms-events-service-layer-deploy-ethos102-stage-va-9c3ecd.stage.cloud.adobe.io' },
    [ENVIRONMENTS.DEV02]: { host: 'https://wcms-events-service-layer-deploy-ethos102-stage-va-d5dc93.stage.cloud.adobe.io' },
    [ENVIRONMENTS.STAGE]: { host: 'https://events-service-layer-stage.adobe.io' },
    [ENVIRONMENTS.STAGE02]: { host: 'https://wcms-events-service-layer-deploy-ethos105-stage-or-8f7ce1.stage.cloud.adobe.io' },
    [ENVIRONMENTS.PROD]: { host: 'https://events-service-layer.adobe.io' },
  },
  esp: {
    [ENVIRONMENTS.LOCAL]: { host: 'https://wcms-events-service-platform-deploy-ethos102-stage-caff5f.stage.cloud.adobe.io' },
    [ENVIRONMENTS.DEV]: { host: 'https://wcms-events-service-platform-deploy-ethos102-stage-caff5f.stage.cloud.adobe.io' },
    [ENVIRONMENTS.DEV02]: { host: 'https://wcms-events-service-platform-deploy-ethos102-stage-c81eb6.stage.cloud.adobe.io' },
    [ENVIRONMENTS.STAGE]: { host: 'https://events-service-platform-stage-or2.adobe.io' },
    [ENVIRONMENTS.STAGE02]: { host: 'https://wcms-events-service-platform-deploy-ethos105-stage-9a5fdc.stage.cloud.adobe.io' },
    [ENVIRONMENTS.PROD]: { host: 'https://events-service-platform.adobe.io' },
  },
};

// Derive allowed hosts from API_CONFIG and add core domains
export const ALLOWED_HOSTS = {
  [DOMAINS.ADOBE_COM]: true,
  [DOMAINS.STAGE_ADOBE_COM]: true,
  [DOMAINS.LOCALHOST]: true,
  ...Object.values(API_CONFIG.esl).reduce((acc, env) => {
    const url = new URL(env.host);
    acc[url.hostname] = true;
    return acc;
  }, {}),
  ...Object.values(API_CONFIG.esp).reduce((acc, env) => {
    const url = new URL(env.host);
    acc[url.hostname] = true;
    return acc;
  }, {}),
};

export const EVENT_TYPES = {
  IN_PERSON: 'InPerson',
  WEBINAR: 'Webinar',
  HYBRID: 'Hybrid',
};

export const CONTENT_TYPE_TAGS = {
  [EVENT_TYPES.WEBINAR]: {
    title: 'Webinar',
    caasId: 'caas:content-type/webinar',
  },
  [EVENT_TYPES.IN_PERSON]: {
    title: 'In-Person Event',
    caasId: 'caas:content-type/in-person-event',
  },
};
