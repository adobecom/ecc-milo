export const LINK_REGEX = '^https:\\/\\/[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,63}(:[0-9]{1,5})?(\\/.*)?$';
export const ALLOWED_ACCOUNT_TYPES = ['type3', 'type2e'];
export const SUPPORTED_CLOUDS = [{ id: 'CreativeCloud', name: 'Creative Cloud' }, { id: 'ExperienceCloud', name: 'Experience Cloud' }];
export const API_CONFIG = {
  esl: {
    local: { host: 'http://localhost:8499' },
    dev: { host: 'https://wcms-events-service-layer-deploy-ethos102-stage-va-9c3ecd.stage.cloud.adobe.io' },
    dev02: { host: 'https://wcms-events-service-layer-deploy-ethos102-stage-va-d5dc93.stage.cloud.adobe.io' },
    stage: { host: 'https://events-service-layer-stage.adobe.io' },
    stage02: { host: 'https://wcms-events-service-layer-deploy-ethos105-stage-or-8f7ce1.stage.cloud.adobe.io' },
    prod: { host: 'https://events-service-layer.adobe.io' },
  },
  esp: {
    local: { host: 'http://localhost:8500' },
    dev: { host: 'https://wcms-events-service-platform-deploy-ethos102-stage-caff5f.stage.cloud.adobe.io' },
    dev02: { host: 'https://wcms-events-service-platform-deploy-ethos102-stage-c81eb6.stage.cloud.adobe.io' },
    stage: { host: 'https://events-service-platform-stage-or2.adobe.io' },
    stage02: { host: 'https://wcms-events-service-platform-deploy-ethos105-stage-9a5fdc.stage.cloud.adobe.io' },
    prod: { host: 'https://events-service-platform.adobe.io' },
  },
};
export const ALLOWED_HOSTS = {
  'events-service-layer.adobe.io': true,
  'events-service-layer-stage.adobe.io': true,
  'events-service-platform.adobe.io': true,
  'events-service-platform-stage-or2.adobe.io': true,
  'www.adobe.com': true,
  'www.stage.adobe.com': true,

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

/**
 * @typedef {Object} EventDataFilter
 * @property {string} type - The type of the attribute.
 * @property {boolean} cloneable - Whether the attribute can be cloned.
 * @property {boolean} submittable - Whether the attribute can be submitted.
 */

export const EVENT_DATA_FILTER = {
  agenda: { type: 'array', cloneable: true, submittable: true },
  tags: { type: 'string', cloneable: true, submittable: true },
  topics: { type: 'array', cloneable: true, submittable: true },
  speakers: { type: 'array', cloneable: false, submittable: false },
  sponsors: { type: 'array', cloneable: false, submittable: false },
  eventType: { type: 'string', cloneable: true, submittable: true },
  cloudType: { type: 'string', cloneable: true, submittable: true },
  seriesId: { type: 'string', cloneable: true, submittable: true },
  communityTopicUrl: { type: 'string', cloneable: true, submittable: true },
  title: { type: 'string', cloneable: true, submittable: true },
  description: { type: 'string', cloneable: true, submittable: true },
  localStartDate: { type: 'string', cloneable: true, submittable: true },
  localEndDate: { type: 'string', cloneable: true, submittable: true },
  localStartTime: { type: 'string', cloneable: true, submittable: true },
  localEndTime: { type: 'string', cloneable: true, submittable: true },
  timezone: { type: 'string', cloneable: true, submittable: true },
  showAgendaPostEvent: { type: 'boolean', cloneable: true, submittable: true },
  showVenuePostEvent: { type: 'boolean', cloneable: true, submittable: true },
  showVenueAdditionalInfoPostEvent: { type: 'boolean', cloneable: true, submittable: true },
  venue: { type: 'object', cloneable: false, submittable: false },
  showSponsors: { type: 'boolean', cloneable: false, submittable: true },
  rsvpFormFields: { type: 'object', cloneable: true, submittable: true },
  relatedProducts: { type: 'array', cloneable: true, submittable: true },
  rsvpDescription: { type: 'string', cloneable: false, submittable: true },
  attendeeLimit: { type: 'number', cloneable: false, submittable: true },
  allowWaitlisting: { type: 'boolean', cloneable: false, submittable: true },
  allowGuestRegistration: { type: 'boolean', cloneable: false, submittable: true },
  hostEmail: { type: 'string', cloneable: true, submittable: true },
  eventId: { type: 'string', cloneable: false, submittable: true },
  published: { type: 'boolean', cloneable: false, submittable: true },
  creationTime: { type: 'string', cloneable: false, submittable: true },
  modificationTime: { type: 'string', cloneable: false, submittable: true },
  isPrivate: { type: 'boolean', cloneable: true, submittable: true },
};
