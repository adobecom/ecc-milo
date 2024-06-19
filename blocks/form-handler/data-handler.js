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

function isValidAttribute(attr) {
  return attr !== undefined && attr !== null;
}

export function setPayloadCache(payload) {
  if (!payload) return;

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
  if (!response || response?.errors) return;
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

  return { ...filteredResponse, ...filteredPayload };
}
