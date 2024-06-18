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
  'rsvpData',
  'showAgendaPostEvent',
  'showVenuePostEvent',
  'rsvpFormFields',
  'relatedProducts',
  'published',
];

const attrsFromResponse = [
  ...attrsFromPayload,
  'eventId',
  'speakers',
  'venue',
  'url',
];

function filterPayload(payload) {
  const output = {};

  attrsFromPayload.forEach((attr) => {
    if (payload[attr]) {
      output[attr] = payload[attr];
    }
  });

  return output;
}

function filterResponse(response) {
  const output = {};

  attrsFromResponse.forEach((attr) => {
    if (response[attr]) {
      output[attr] = response[attr];
    }
  });

  return output;
}

export default function getJoinedOutput(payload, response) {
  const filteredPayload = filterPayload(payload);
  const filteredResponse = filterResponse(response);

  return { ...filteredPayload, ...filteredResponse };
}

const payloadLog = {
  showAgendaPostEvent: true,
  agenda: [],
  topics: [],
  eventType: 'InPerson',
  cloudType: 'CreativeCloud',
  seriesId: 'fa64db15-4ad2-4a36-996a-e79cfda4715f',
  rsvpRequired: 0,
  templateId: null,
  communityTopicUrl: null,
  title: 'Harry Potter Day',
  description: 'Test',
  localStartDate: '2024-06-19',
  localEndDate: '2024-06-20',
  localStartTime: '07:00:00',
  localEndTime: '18:00:00',
  localStartTimeMillis: 1718798400000,
  localEndTimeMillis: 1718924400000,
  timezone: 'America/Chicago',
  status: 200,
  serviceName: 'Event Service Layer',
  eventId: '8777ceb0-6e6f-4c0e-9796-f2bb80b0c1d4',
  platform: 'Event Service Platform',
  platformCode: 'esp',
  externalEventId: 'st-459000947',
  startDate: '2024-06-19T12:00:00.000Z',
  endDate: '2024-06-20T23:00:00.000Z',
  gmtOffset: -6,
  duration: 35,
  showVenuePostEvent: true,
  hostEmail: 'eventshost@adobe.com',
  photos: [],
  speakers: [
    {
      socialMedia: [
        { url: 'www.adobe.com/express/' },
      ],
      type: 'Presenter',
      firstName: 'Qiyun',
      lastName: 'Dai',
      title: 'Developer',
      bio: 'test bio',
      id: '18e878e8-fe99-4663-b05f-be7d144bbedf',
    },
  ],
  eventMaterials: [],
  relatedProducts: [
    {
      name: 'adobe-express',
      showProductBlade: true,
    },
    {
      name: 'illustrator',
      showProductBlade: false,
    },
  ],
  published: true,
  rsvpFormFields: {
    visible: [
      'phoneNumber',
      'ageCategory',
      'industry',
      'jobFunction',
      'companySize',
    ],
    required: [
      'phoneNumber',
      'ageCategory',
      'industry',
    ],
  },
  attendeeCount: 0,
  attendeeLimit: 10,
  allowWaitListing: true,
  waitListAttendeeCount: 0,
  waitListAttendeeLimit: 100,
  allowAttendeeResponseUpdate: false,
  attendeeResponseUpdatesUntil: '',
  tags: null,
  creationTime: 1718725286634,
  modificationTime: 1718725286634,
  venueName: 'Adobe - Lehi',
  address: '3900 Adobe Way',
  city: 'Lehi',
  state: 'Utah',
  postalCode: '84043',
  country: 'US',
  placeId: 'ChIJ6-G_3DqAUocRw5ctKLeX2yI',
  mapUrl: 'https://maps.google.com/?cid=2511768030098069443',
  coordinates: {
    lat: 40.434928,
    lon: -111.891964,
  },
  venueId: '61b8c157-47ba-41d0-bca2-772c89d8ac53',
  message: "request/body/relatedProducts/0 must have required property 'url', request/body/relatedProducts/0/name must be equal to one of the allowed values: Acrobat Pro, Acrobat Reader, Adobe Express, Adobe Firefly, Adobe Fonts, Adobe Stock, Aero, After Effects, Animate, Audition, Behance, Bridge, Capture, Character Animator, Color, Creative Cloud Libraries, Dimension, Dreamweaver, Fill & Sign, Frame.io, Fresco, Illustrator, InCopy, InDesign, Lightroom, Lightroom Classic, Media Encoder, Photoshop, Photoshop Express, Portfolio, Premiere Pro, Premiere Rush, Scan, Substance 3D Collection, request/body/relatedProducts/1 must have required property 'url', request/body/relatedProducts/1/name must be equal to one of the allowed values: Acrobat Pro, Acrobat Reader, Adobe Express, Adobe Firefly, Adobe Fonts, Adobe Stock, Aero, After Effects, Animate, Audition, Behance, Bridge, Capture, Character Animator, Color, Creative Cloud Libraries, Dimension, Dreamweaver, Fill & Sign, Frame.io, Fresco, Illustrator, InCopy, InDesign, Lightroom, Lightroom Classic, Media Encoder, Photoshop, Photoshop Express, Portfolio, Premiere Pro, Premiere Rush, Scan, Substance 3D Collection, request/body/attendeeCount is read-only, request/body/waitListAttendeeCount is read-only",
  errors: [
    {
      path: '/body/relatedProducts/0/url',
      message: "must have required property 'url'",
      errorCode: 'required.openapi.validation',
    },
    {
      path: '/body/relatedProducts/0/name',
      message: 'must be equal to one of the allowed values: Acrobat Pro, Acrobat Reader, Adobe Express, Adobe Firefly, Adobe Fonts, Adobe Stock, Aero, After Effects, Animate, Audition, Behance, Bridge, Capture, Character Animator, Color, Creative Cloud Libraries, Dimension, Dreamweaver, Fill & Sign, Frame.io, Fresco, Illustrator, InCopy, InDesign, Lightroom, Lightroom Classic, Media Encoder, Photoshop, Photoshop Express, Portfolio, Premiere Pro, Premiere Rush, Scan, Substance 3D Collection',
      errorCode: 'enum.openapi.validation',
    },
    {
      path: '/body/relatedProducts/1/url',
      message: "must have required property 'url'",
      errorCode: 'required.openapi.validation',
    },
    {
      path: '/body/relatedProducts/1/name',
      message: 'must be equal to one of the allowed values: Acrobat Pro, Acrobat Reader, Adobe Express, Adobe Firefly, Adobe Fonts, Adobe Stock, Aero, After Effects, Animate, Audition, Behance, Bridge, Capture, Character Animator, Color, Creative Cloud Libraries, Dimension, Dreamweaver, Fill & Sign, Frame.io, Fresco, Illustrator, InCopy, InDesign, Lightroom, Lightroom Classic, Media Encoder, Photoshop, Photoshop Express, Portfolio, Premiere Pro, Premiere Rush, Scan, Substance 3D Collection',
      errorCode: 'enum.openapi.validation',
    },
    {
      path: '/body/attendeeCount',
      message: 'is read-only',
      errorCode: 'readOnly.openapi.validation',
    },
    {
      path: '/body/waitListAttendeeCount',
      message: 'is read-only',
      errorCode: 'readOnly.openapi.validation',
    },
  ],
  rsvpData: {
    attendeeLimit: '40',
    allowWaitlist: true,
    contactHost: true,
    hostEmail: 'cod87753@adobe.com',
    title: 'Test RSVP title',
    subtitle: 'test rsvp subtitle',
    description: 'test brief description',
  },
};
