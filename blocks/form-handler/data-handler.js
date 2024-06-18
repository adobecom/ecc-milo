let responseCache = {};
let payloadCache = {};

const payloadWhitelist = [
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
];

const responseWhitelist = [
  'eventId',
  'venue',
  'url',
  'published',
  'startDate',
  'endDate',
  'duration',
  'creationTime',
  'modifiaitonTime',
];

function isValidAttribute(attr) {
  return attr !== undefined && attr !== null;
}

export function getFilteredPayload(payload) {
  const output = {};

  payloadWhitelist.forEach((attr) => {
    if (isValidAttribute(payload[attr])) {
      output[attr] = payload[attr];
    }
  });

  payloadCache = { ...payloadCache, ...output };
  return payloadCache;
}

export function getFilteredResponse(response) {
  if (response.errors) return responseCache;

  const output = {};

  responseWhitelist.forEach((attr) => {
    if (isValidAttribute(response[attr])) {
      output[attr] = response[attr];
    }
  });

  responseCache = { ...responseCache, ...output };
  return responseCache;
}

export default function getJoinedOutput(payload, response) {
  const filteredPayload = getFilteredPayload(payload);
  const filteredResponse = getFilteredResponse(response);

  return {
    ...filteredResponse,
    ...filteredPayload,
  };
}
