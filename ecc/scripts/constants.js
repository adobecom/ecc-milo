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

export const EVENT_DATA_FILTER = [
  { name: 'agenda', type: 'string', cloneable: true, submittable: true, deletable: false },
  { name: 'tags', type: 'array', cloneable: true, submittable: true, deletable: false },
  { name: 'topics', type: 'array', cloneable: true, submittable: true, deletable: false },
  { name: 'speakers', type: 'array', cloneable: true, submittable: false, deletable: false },
  { name: 'sponsors', type: 'array', cloneable: true, submittable: false, deletable: false },
  { name: 'eventType', type: 'string', cloneable: true, submittable: true, deletable: false },
  { name: 'cloudType', type: 'string', cloneable: true, submittable: true, deletable: false },
  { name: 'seriesId', type: 'string', cloneable: true, submittable: true, deletable: false },
  { name: 'communityTopicUrl', type: 'string', cloneable: true, submittable: true, deletable: false },
  { name: 'title', type: 'string', cloneable: true, submittable: true, deletable: false },
  { name: 'description', type: 'string', cloneable: true, submittable: true, deletable: false },
  { name: 'localStartDate', type: 'string', cloneable: true, submittable: true, deletable: false },
  { name: 'localEndDate', type: 'string', cloneable: true, submittable: true, deletable: false },
  { name: 'localStartTime', type: 'string', cloneable: true, submittable: true, deletable: false },
  { name: 'localEndTime', type: 'string', cloneable: true, submittable: true, deletable: false },
  { name: 'timezone', type: 'string', cloneable: true, submittable: true, deletable: false },
  { name: 'showAgendaPostEvent', type: 'boolean', cloneable: true, submittable: true, deletable: false },
  { name: 'showVenuePostEvent', type: 'boolean', cloneable: true, submittable: true, deletable: false },
  { name: 'venue', type: 'string', cloneable: true, submittable: false, deletable: false },
  { name: 'showSponsors', type: 'boolean', cloneable: false, submittable: true, deletable: false },
  { name: 'rsvpFormFields', type: 'array', cloneable: true, submittable: true, deletable: false },
  { name: 'relatedProducts', type: 'array', cloneable: true, submittable: true, deletable: false },
  { name: 'rsvpDescription', type: 'string', cloneable: false, submittable: true, deletable: false },
  { name: 'attendeeLimit', type: 'number', cloneable: false, submittable: true, deletable: false },
  { name: 'allowWaitlisting', type: 'boolean', cloneable: false, submittable: true, deletable: false },
  { name: 'allowGuestRegistration', type: 'boolean', cloneable: false, submittable: true, deletable: false },
  { name: 'hostEmail', type: 'string', cloneable: false, submittable: true, deletable: true },
  { name: 'eventId', type: 'string', cloneable: false, submittable: true, deletable: false },
  { name: 'published', type: 'boolean', cloneable: false, submittable: true, deletable: false },
  { name: 'creationTime', type: 'string', cloneable: false, submittable: true, deletable: false },
  { name: 'modificationTime', type: 'string', cloneable: false, submittable: true, deletable: false },
];
