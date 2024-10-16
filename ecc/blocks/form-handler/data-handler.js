// FIXME: this whole data handler thing can be done better
let responseDataCache = {};
let payloadCache = {};

const submissionFilter = [
  // from payload and response
  'agenda',
  'topics',
  'eventType',
  'cloudType',
  'seriesId',
  'templateId',
  'communityTopicUrl',
  'title',
  'description',
  'localStartDate',
  'localEndDate',
  'localStartTime',
  'localEndTime',
  'timezone',
  'showAgendaPostEvent',
  'showVenuePostEvent',
  'showVenueImage',
  'showSponsors',
  'rsvpFormFields',
  'relatedProducts',
  'rsvpDescription',
  'attendeeLimit',
  'allowWaitlisting',
  'hostEmail',
  'eventId',
  'published',
  'creationTime',
  'modificationTime',
];

function isValidAttribute(attr) {
  return attr !== undefined && attr !== null;
}

export function quickFilter(obj) {
  const output = {};

  submissionFilter.forEach((attr) => {
    if (isValidAttribute(obj[attr])) {
      output[attr] = obj[attr];
    }
  });

  return output;
}

export function setPayloadCache(payload) {
  if (!payload) return;
  payloadCache = quickFilter(payload);
}

export function getFilteredCachedPayload() {
  return payloadCache;
}

export function setResponseCache(response) {
  if (!response.ok) return;
  responseDataCache = quickFilter(response.data);
}

export function getFilteredCachedResponseData() {
  return responseDataCache;
}

export default function getJoinedData() {
  const filteredResponse = getFilteredCachedResponseData();
  const filteredPayload = getFilteredCachedPayload();

  return {
    ...filteredResponse,
    ...filteredPayload,
    modificationTime: filteredResponse.modificationTime,
  };
}
