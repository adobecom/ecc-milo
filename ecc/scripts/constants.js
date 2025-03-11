export const LINK_REGEX = '^https:\\/\\/[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,63}(:[0-9]{1,5})?(\\/.*)?$';
export const ALLOWED_ACCOUNT_TYPES = ['type3', 'type2e'];
export const SUPPORTED_CLOUDS = [{ id: 'CreativeCloud', name: 'Creative Cloud' }, { id: 'ExperienceCloud', name: 'Experience Cloud' }];
export const API_CONFIG = {
  esl: {
    dev: { host: 'https://wcms-events-service-layer-deploy-ethos102-stage-va-9c3ecd.stage.cloud.adobe.io' },
    dev02: { host: 'https://wcms-events-service-layer-deploy-ethos102-stage-va-d5dc93.stage.cloud.adobe.io' },
    stage: { host: 'https://events-service-layer-stage.adobe.io' },
    stage02: { host: 'https://wcms-events-service-layer-deploy-ethos105-stage-or-8f7ce1.stage.cloud.adobe.io' },
    prod: { host: 'https://events-service-layer.adobe.io' },
  },
  esp: {
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
 * @property {string} name - The name of the attribute.
 * @property {string} type - The type of the attribute.
 * @property {boolean} cloneable - Whether the attribute can be cloned.
 * @property {boolean} submittable - Whether the attribute can be submitted.
 * @property {boolean} deletable - Whether the attribute can be deleted.
 */

export const EVENT_DATA_FILTER = {
  agenda: { type: 'string', cloneable: true, submittable: true, deletable: false },
  tags: { type: 'array', cloneable: true, submittable: true, deletable: false },
  topics: { type: 'array', cloneable: true, submittable: true, deletable: false },
  speakers: { type: 'array', cloneable: true, submittable: false, deletable: false },
  sponsors: { type: 'array', cloneable: true, submittable: false, deletable: false },
  eventType: { type: 'string', cloneable: true, submittable: true, deletable: false },
  cloudType: { type: 'string', cloneable: true, submittable: true, deletable: false },
  seriesId: { type: 'string', cloneable: true, submittable: true, deletable: false },
  communityTopicUrl: { type: 'string', cloneable: true, submittable: true, deletable: false },
  title: { type: 'string', cloneable: true, submittable: true, deletable: false },
  description: { type: 'string', cloneable: true, submittable: true, deletable: false },
  localStartDate: { type: 'string', cloneable: true, submittable: true, deletable: false },
  localEndDate: { type: 'string', cloneable: true, submittable: true, deletable: false },
  localStartTime: { type: 'string', cloneable: true, submittable: true, deletable: false },
  localEndTime: { type: 'string', cloneable: true, submittable: true, deletable: false },
  timezone: { type: 'string', cloneable: true, submittable: true, deletable: false },
  showAgendaPostEvent: { type: 'boolean', cloneable: true, submittable: true, deletable: false },
  showVenuePostEvent: { type: 'boolean', cloneable: true, submittable: true, deletable: false },
  venue: { type: 'string', cloneable: true, submittable: false, deletable: false },
  showSponsors: { type: 'boolean', cloneable: false, submittable: true, deletable: false },
  rsvpFormFields: { type: 'array', cloneable: true, submittable: true, deletable: false },
  relatedProducts: { type: 'array', cloneable: true, submittable: true, deletable: false },
  rsvpDescription: { type: 'string', cloneable: false, submittable: true, deletable: false },
  attendeeLimit: { type: 'number', cloneable: false, submittable: true, deletable: false },
  allowWaitlisting: { type: 'boolean', cloneable: false, submittable: true, deletable: false },
  allowGuestRegistration: { type: 'boolean', cloneable: false, submittable: true, deletable: false },
  hostEmail: { type: 'string', cloneable: false, submittable: true, deletable: true },
  eventId: { type: 'string', cloneable: false, submittable: true, deletable: false },
  published: { type: 'boolean', cloneable: false, submittable: true, deletable: false },
  creationTime: { type: 'string', cloneable: false, submittable: true, deletable: false },
  modificationTime: { type: 'string', cloneable: false, submittable: true, deletable: false },
};
