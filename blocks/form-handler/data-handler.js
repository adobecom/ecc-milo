let responseCache = {};
let payloadCache = {};

const attributeWhitelist = [
  'eventId',
  'speakers',
  'venue',
  'url',
  'published',
  'startDate',
  'endDate',
  'duration',
  'creationTime',
  'modificationTime',
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
  'partners',
  'rsvpData',
  'showAgendaPostEvent',
  'showVenuePostEvent',
  'rsvpFormFields',
  'relatedProducts',
];

export function getFilteredPayload(payload) {
  const output = {};

  attributeWhitelist.forEach((attr) => {
    if (payload[attr]) {
      output[attr] = payload[attr];
    }
  });

  payloadCache = { ...payloadCache, ...output };
  return output;
}

export function getFilteredResponse(response) {
  if (response.errors) return responseCache;

  const output = {};

  attributeWhitelist.forEach((attr) => {
    if (response[attr]) {
      output[attr] = response[attr];
    }
  });

  responseCache = { ...responseCache, ...output };
  return output;
}

export default function getJoinedOutput(payload, response) {
  const filteredPayload = getFilteredPayload(payload);
  const filteredResponse = getFilteredResponse(response);

  return { ...filteredResponse, ...filteredPayload };
}
