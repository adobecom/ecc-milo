let responseCache = {};
let payloadCache = {};

const wl = [
  // from payload and response
  'agenda',
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
  'sponsors',
  'showAgendaPostEvent',
  'showVenuePostEvent',
  'showVenueImage',
  'rsvpFormFields',
  'relatedProducts',
  'rsvpDescription',
  'attendeeLimit',
  'allowWaitlisting',
  'hostEmail',
  // only in response
  'eventId',
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

export function quickFilter(obj) {
  const output = {};

  wl.forEach((attr) => {
    if (isValidAttribute(obj[attr])) {
      output[attr] = obj[attr];
    }
  });

  return output;
}

export function setPayloadCache(payload) {
  if (!payload) return;
  const output = quickFilter(payload);
  payloadCache = { ...payloadCache, ...output };
}

export function getFilteredCachedPayload() {
  return payloadCache;
}

export function setResponseCache(response) {
  if (!response || response?.errors) return;
  const output = quickFilter(response);
  responseCache = { ...responseCache, ...output };
}

export function getFilteredCachedResponse() {
  return responseCache;
}

export default function getJoinedData() {
  const filteredResponse = getFilteredCachedResponse();
  const filteredPayload = getFilteredCachedPayload();

  return { ...filteredResponse, ...filteredPayload };
}
