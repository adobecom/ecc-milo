let responseCache = {};
let payloadCache = {};

const wl = [
  // from payload and response
  'agenda',
  'speakers',
  'topics',
  'eventType',
  'cloudType',
  'seriesId',
  'rsvpRequired',
  'templateId',
  'communityTopicUrl',
  'title',
  'description',
  'localStartDate',
  'localEndDate',
  'localStartTime',
  'localEndTime',
  'localStartTimeMillis',
  'localEndTimeMillis',
  'timezone',
  'partners',
  'rsvpData',
  'showAgendaPostEvent',
  'showVenuePostEvent',
  'rsvpFormFields',
  'relatedProducts',
  // only in response
  'eventId',
  'venue',
  'url',
  'published',
  'startDate',
  'endDate',
  'duration',
  'creationTime',
  'modificationTime',
  'detailPagePath',
];

function deepSpread(target, ...sources) {
  sources.forEach((source) => {
    if (typeof source !== 'object' || source === null) return;

    Object.keys(source).forEach((key) => {
      const value = source[key];

      if (Array.isArray(value)) {
        target[key] = deepSpread([], value);
      } else if (typeof value === 'object' && value !== null) {
        target[key] = deepSpread(target[key] || {}, value);
      } else {
        target[key] = value;
      }
    });
  });

  return target;
}

function isValidAttribute(attr) {
  return attr !== undefined && attr !== null;
}

export function setPayloadCache(payload) {
  const output = {};

  wl.forEach((attr) => {
    if (isValidAttribute(payload[attr])) {
      output[attr] = payload[attr];
    }
  });

  payloadCache = { ...payloadCache, ...output };
}

export function getFilteredPayload() {
  return payloadCache;
}

export function setResponseCache(response) {
  if (response.errors) return;
  const output = {};

  wl.forEach((attr) => {
    if (isValidAttribute(response[attr])) {
      output[attr] = response[attr];
    }
  });

  responseCache = { ...responseCache, ...output };
}

export function getFilteredResponse() {
  return responseCache;
}

export default function getJoinedData() {
  const filteredResponse = getFilteredResponse();
  const filteredPayload = getFilteredPayload();

  return deepSpread(filteredResponse, filteredPayload);
}
