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
export const EVENT_DATA_FILTER = [
  {
    name: 'agenda',
    type: 'array',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'tags',
    type: 'string',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'topics',
    type: 'array',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'speakers',
    type: 'array',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'sponsors',
    type: 'array',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'eventType',
    type: 'string',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'cloudType',
    type: 'string',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'seriesId',
    type: 'string',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'communityTopicUrl',
    type: 'string',
    required: false,
    cloneable: true,
    deletable: true,
  },
  {
    name: 'title',
    type: 'string',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'description',
    type: 'string',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'localStartDate',
    type: 'string',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'localEndDate',
    type: 'string',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'localStartTime',
    type: 'string',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'localEndTime',
    type: 'string',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'localStartTimeMillis',
    type: 'number',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'localEndTimeMillis',
    type: 'number',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'timezone',
    type: 'string',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'showAgendaPostEvent',
    type: 'boolean',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'showVenuePostEvent',
    type: 'boolean',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'attendeeLimit',
    type: 'number',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'rsvpDescription',
    type: 'string',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'allowWaitlisting',
    type: 'boolean',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'allowGuestRegistration',
    type: 'boolean',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'hostEmail',
    type: 'string',
    required: false,
    cloneable: true,
    deletable: true,
  },
  {
    name: 'rsvpFormFields',
    type: 'array',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'relatedProducts',
    type: 'array',
    required: false,
    cloneable: true,
    deletable: false,
  },
  {
    name: 'venue',
    type: 'object',
    required: false,
    cloneable: true,
    deletable: false,
  },
];
