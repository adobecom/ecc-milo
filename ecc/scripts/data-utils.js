/**
 * @typedef {Object} EventDataFilter
 * @property {string} type - The type of the attribute.
 * @property {boolean} localizable - Whether the attr should be in payload or payload.localizations.
 * @property {boolean} cloneable - Whether the attribute can be cloned.
 * @property {boolean} submittable - Whether the attribute can be submitted.
 * @property {boolean} deletable - Whether the attribute can be deleted.
 */

export const EVENT_DATA_FILTER = {
  agenda: { type: 'array', localizable: true, cloneable: true, submittable: true, deletable: false },
  tags: { type: 'string', localizable: false, cloneable: true, submittable: true, deletable: false },
  topics: { type: 'array', localizable: false, cloneable: true, submittable: true, deletable: false },
  speakers: { type: 'array', localizable: false, cloneable: true, submittable: false, deletable: false },
  sponsors: { type: 'array', localizable: false, cloneable: true, submittable: false, deletable: false },
  eventType: { type: 'string', localizable: false, cloneable: true, submittable: true, deletable: false },
  cloudType: { type: 'string', localizable: false, cloneable: true, submittable: true, deletable: false },
  seriesId: { type: 'string', localizable: false, cloneable: true, submittable: true, deletable: false },
  communityTopicUrl: { type: 'string', localizable: false, cloneable: true, submittable: true, deletable: false },
  title: { type: 'string', localizable: true, cloneable: true, submittable: true, deletable: false },
  description: { type: 'string', localizable: true, cloneable: true, submittable: true, deletable: false },
  localStartDate: { type: 'string', localizable: false, cloneable: true, submittable: true, deletable: false },
  localEndDate: { type: 'string', localizable: false, cloneable: true, submittable: true, deletable: false },
  localStartTime: { type: 'string', localizable: false, cloneable: true, submittable: true, deletable: false },
  localEndTime: { type: 'string', localizable: false, cloneable: true, submittable: true, deletable: false },
  localizations: { type: 'object', localizable: false, cloneable: false, submittable: true, deletable: false },
  timezone: { type: 'string', localizable: false, cloneable: true, submittable: true, deletable: false },
  showAgendaPostEvent: { type: 'boolean', localizable: false, cloneable: true, submittable: true, deletable: false },
  showVenuePostEvent: { type: 'boolean', localizable: false, cloneable: true, submittable: true, deletable: false },
  showVenueAdditionalInfoPostEvent: { type: 'boolean', localizable: false, cloneable: true, submittable: true, deletable: false },
  venue: { type: 'object', localizable: false, cloneable: true, submittable: false, deletable: false },
  showSponsors: { type: 'boolean', localizable: false, cloneable: true, submittable: true, deletable: false },
  rsvpFormFields: { type: 'object', localizable: false, cloneable: true, submittable: true, deletable: false },
  relatedProducts: { type: 'array', localizable: false, cloneable: true, submittable: true, deletable: false },
  rsvpDescription: { type: 'string', localizable: true, cloneable: true, submittable: true, deletable: false },
  attendeeLimit: { type: 'number', localizable: false, cloneable: true, submittable: true, deletable: false },
  allowWaitlisting: { type: 'boolean', localizable: false, cloneable: true, submittable: true, deletable: false },
  allowGuestRegistration: { type: 'boolean', localizable: false, cloneable: true, submittable: true, deletable: false },
  hostEmail: { type: 'string', localizable: false, cloneable: true, submittable: true, deletable: true },
  eventId: { type: 'string', localizable: false, cloneable: true, submittable: true, deletable: false },
  published: { type: 'boolean', localizable: false, cloneable: true, submittable: true, deletable: false },
  creationTime: { type: 'string', localizable: false, cloneable: true, submittable: true, deletable: false },
  modificationTime: { type: 'string', localizable: false, cloneable: true, submittable: true, deletable: false },
  isPrivate: { type: 'boolean', localizable: false, cloneable: true, submittable: true, deletable: false },
};

/**
 * @typedef {Object} SpeakerDataFilter
 * @property {string} type - The type of the attribute.
 * @property {boolean} localizable - Whether the attr should be in payload or payload.localizations.
 * @property {boolean} submittable - Whether the attribute can be submitted.
 */

export const SPEAKER_DATA_FILTER = {
  speakerId: { type: 'string', localizable: false, submittable: true },
  firstName: { type: 'string', localizable: false, submittable: true },
  lastName: { type: 'string', localizable: false, submittable: true },
  title: { type: 'string', localizable: true, submittable: true },
  bio: { type: 'string', localizable: true, submittable: true },
  socialLinks: { type: 'array', localizable: false, submittable: true },
  creationTime: { type: 'string', localizable: false, submittable: false },
  modificationTime: { type: 'string', localizable: false, submittable: false },
};

/**
 * @typedef {Object} SponsorDataFilter
 * @property {string} type - The type of the attribute.
 * @property {boolean} localizable - Whether the attr should be in payload or payload.localizations.
 * @property {boolean} submittable - Whether the attribute can be submitted.
 */

export const SPONSOR_DATA_FILTER = {
  sponsorId: { type: 'string', localizable: false, submittable: true },
  name: { type: 'string', localizable: true, submittable: true },
  info: { type: 'string', localizable: true, submittable: true },
  link: { type: 'string', localizable: false, submittable: true },
  localizations: { type: 'object', localizable: false, submittable: true },
  creationTime: { type: 'string', localizable: false, submittable: false },
  modificationTime: { type: 'string', localizable: false, submittable: false },
};

export function isValidAttribute(attr) {
  return attr !== undefined && attr !== null;
}

export function splitLocalizableFields(data, filter, locale = 'en-US') {
  const localizableFields = {};
  const nonLocalizableFields = {};

  Object.entries(data).forEach(([key, value]) => {
    if (filter[key]?.localizable) {
      if (data.localizations?.[locale]?.[key]) {
        localizableFields[key] = data.localizations[locale][key];
      } else {
        localizableFields[key] = value;
      }
    } else if (isValidAttribute(value)) {
      nonLocalizableFields[key] = value;
    }
  });

  return { localizableFields, nonLocalizableFields };
}

export function getSpeakerPayload(speakerData, locale = 'en-US') {
  if (!speakerData) return speakerData;

  // Split speaker data into localizable and non-localizable fields
  const { localizableFields, nonLocalizableFields } = splitLocalizableFields(
    speakerData,
    SPEAKER_DATA_FILTER,
    locale,
  );

  const filteredGlobalPayload = Object.entries(nonLocalizableFields).reduce((acc, [key, value]) => {
    if (SPEAKER_DATA_FILTER[key]?.submittable) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const filteredLocalePayload = Object.entries(localizableFields).reduce((acc, [key, value]) => {
    if (SPEAKER_DATA_FILTER[key]?.submittable) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return {
    ...filteredGlobalPayload,
    localizations: { [locale]: filteredLocalePayload },
  };
}

export function getSponsorPayload(sponsorData, locale = 'en-US') {
  if (!sponsorData) return sponsorData;

  // Split sponsor data into localizable and non-localizable fields
  const { localizableFields, nonLocalizableFields } = splitLocalizableFields(
    sponsorData,
    SPONSOR_DATA_FILTER,
    locale,
  );

  const filteredGlobalPayload = Object.entries(nonLocalizableFields).reduce((acc, [key, value]) => {
    if (SPONSOR_DATA_FILTER[key]?.submittable) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const filteredLocalePayload = Object.entries(localizableFields).reduce((acc, [key, value]) => {
    if (SPONSOR_DATA_FILTER[key]?.submittable) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return {
    ...filteredGlobalPayload,
    localizations: { [locale]: filteredLocalePayload },
  };
}
