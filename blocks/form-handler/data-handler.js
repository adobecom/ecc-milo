function filterPayload(payload) {
  const output = {};
  const attrsFromPayload = [
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
  ];

  attrsFromPayload.forEach((attr) => {
    if (payload[attr]) {
      output[attr] = payload[attr];
    }
  });

  return output;
}

function filterResponse(response) {
  const output = {};
  const attrsFromResponse = [
    'eventId',
    'speakers',
    'venue',
  ];

  attrsFromResponse.forEach((attr) => {
    if (response[attr]) {
      output[attr] = response[attr];
    }
  });

  return output;
}

export default function getJoinedOutput(payload, response) {
  const output = {};

  // TODO: join payload and response and return the output for ESP API call.
}
