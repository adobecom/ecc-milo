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

export function setPayloadCache(cache) {
  payloadCache = cache;
}

export function getFilteredPayload(payload) {
  const output = {};

  wl.forEach((attr) => {
    if (isValidAttribute(payload[attr])) {
      output[attr] = payload[attr];
    }
  });

  setPayloadCache({ ...payloadCache, ...output });
  return payloadCache;
}

export function setResponseCache(cache) {
  responseCache = cache;
}

export function getFilteredResponse(response) {
  if (response.errors) return responseCache;

  const output = {};

  wl.forEach((attr) => {
    if (isValidAttribute(response[attr])) {
      output[attr] = response[attr];
    }
  });

  setResponseCache({ ...responseCache, ...output });
  return responseCache;
}

export default function getJoinedOutput(payload, response) {
  const filteredResponse = getFilteredResponse(response);
  const filteredPayload = getFilteredPayload(payload);

  return deepSpread(filteredResponse, filteredPayload);
}
