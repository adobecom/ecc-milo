// FIXME: this whole data handler thing can be done better
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

export default function getJoinedData(props) {
  const filteredResponse = quickFilter(props.payload);
  const filteredPayload = quickFilter(props.eventDataResp);

  return {
    ...filteredResponse,
    ...filteredPayload,
    modificationTime: filteredResponse.modificationTime,
  };
}
