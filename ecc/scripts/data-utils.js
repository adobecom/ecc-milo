import { getSpeaker, getSponsor } from './esp-controller.js';

/**
 * @typedef {Object} AgendaDataRefFilter
 * @property {string} type - The type of the attribute.
 * @property {boolean} submittable - Whether the attribute can be submitted.
 */

export const AGENDA_DATA_REF_FILTER = {
  startTime: { type: 'string', submittable: true },
  description: { type: 'string', submittable: true },
  title: { type: 'string', submittable: true },
};

/**
 * @typedef {Object} VideoDataRefFilter
 * @property {string} type - The type of the attribute.
 * @property {boolean} submittable - Whether the attribute can be submitted.
 */

export const VIDEO_DATA_REF_FILTER = { url: { type: 'string', submittable: true } };

/**
 * @typedef {Object} RegistrationDataRefFilter
 * @property {string} type - The type of the attribute.
 * @property {boolean} submittable - Whether the attribute can be submitted.
 */

export const REGISTRATION_DATA_REF_FILTER = {
  type: { type: 'string', submittable: true },
  formData: { type: 'string', submittable: true },
};

/**
 * @typedef {Object} MarketoIntegrationDataRefFilter
 * @property {string} type - The type of the attribute.
 * @property {boolean} submittable - Whether the attribute can be submitted.
 */

export const MARKETO_INTEGRATION_DATA_REF_FILTER = {
  eventType: { type: 'string', submittable: true },
  salesforceCampaignId: { type: 'string', submittable: true },
  mczProgramName: { type: 'string', submittable: true },
  coMarketingPartner: { type: 'string', submittable: true },
  eventPoi: { type: 'string', submittable: true },
};

/**
 * @typedef {Object} EventDataFilter
 * @property {string} type - The type of the attribute.
 * @property {boolean} localizable - Whether the attr should be in payload or payload.localizations.
 * @property {boolean} cloneable - Whether the attribute can be cloned.
 * @property {boolean} submittable - Whether the attribute can be submitted.
 */

export const EVENT_DATA_FILTER = {
  agenda: { type: 'array', localizable: true, cloneable: true, submittable: true, ref: AGENDA_DATA_REF_FILTER, editable: true },
  tags: { type: 'string', localizable: false, cloneable: true, submittable: true, editable: true },
  topics: { type: 'array', localizable: false, cloneable: true, submittable: true, editable: true },
  speakers: { type: 'array', localizable: false, cloneable: false, submittable: false, editable: false },
  sponsors: { type: 'array', localizable: false, cloneable: false, submittable: false, editable: false },
  eventType: { type: 'string', localizable: false, cloneable: true, submittable: true, editable: true },
  cloudType: { type: 'string', localizable: false, cloneable: true, submittable: true, editable: true },
  seriesId: { type: 'string', localizable: false, cloneable: true, submittable: true, editable: true },
  communityTopicUrl: { type: 'string', localizable: false, cloneable: true, submittable: true, editable: true },
  cta: { type: 'array', localizable: true, cloneable: true, submittable: true, editable: true },
  externalEventId: { type: 'string', localizable: false, cloneable: false, submittable: true, editable: false },
  title: { type: 'string', localizable: true, cloneable: true, submittable: true, editable: true },
  enTitle: { type: 'string', localizable: false, cloneable: true, submittable: true, editable: true },
  defaultLocale: { type: 'string', localizable: false, cloneable: true, submittable: true, editable: true },
  description: { type: 'string', localizable: true, cloneable: true, submittable: true, editable: true },
  eventDetails: { type: 'string', localizable: true, cloneable: true, submittable: true, editable: true },
  localStartDate: { type: 'string', localizable: false, cloneable: true, submittable: true, editable: true },
  localEndDate: { type: 'string', localizable: false, cloneable: true, submittable: true, editable: true },
  localStartTime: { type: 'string', localizable: false, cloneable: true, submittable: true, editable: true },
  localEndTime: { type: 'string', localizable: false, cloneable: true, submittable: true, editable: true },
  localizations: { type: 'object', localizable: false, cloneable: true, submittable: true, editable: true },
  localizationOverrides: { type: 'object', localizable: false, cloneable: true, submittable: true, editable: true },
  timezone: { type: 'string', localizable: false, cloneable: true, submittable: true, editable: true },
  showAgendaPostEvent: { type: 'boolean', localizable: false, cloneable: true, submittable: true, editable: true },
  showVenuePostEvent: { type: 'boolean', localizable: false, cloneable: true, submittable: true, editable: true },
  showVenueAdditionalInfoPostEvent: { type: 'boolean', localizable: false, cloneable: true, submittable: true, editable: true },
  venue: { type: 'object', localizable: false, cloneable: false, submittable: false, editable: false },
  showSponsors: { type: 'boolean', localizable: false, cloneable: true, submittable: true, editable: true },
  relatedProducts: { type: 'array', localizable: false, cloneable: true, submittable: true, editable: true },
  rsvpDescription: { type: 'string', localizable: true, cloneable: true, submittable: true, editable: true },
  attendeeLimit: { type: 'number', localizable: false, cloneable: true, submittable: true, editable: true },
  allowWaitlisting: { type: 'boolean', localizable: false, cloneable: true, submittable: true, editable: true },
  allowGuestRegistration: { type: 'boolean', localizable: false, cloneable: true, submittable: true, editable: true },
  hostEmail: { type: 'string', localizable: false, cloneable: true, submittable: true, editable: true },
  eventId: { type: 'string', localizable: false, cloneable: false, submittable: true, editable: true },
  published: { type: 'boolean', localizable: false, cloneable: false, submittable: true, editable: true },
  creationTime: { type: 'string', localizable: false, cloneable: false, submittable: true, editable: true },
  modificationTime: { type: 'string', localizable: false, cloneable: false, submittable: true, editable: true },
  isPrivate: { type: 'boolean', localizable: false, cloneable: true, submittable: true, editable: true },
  useLegacyDetailPagePath: { type: 'boolean', localizable: false, cloneable: false, submittable: true, editable: false },
  video: { type: 'object', localizable: false, cloneable: true, submittable: true, ref: VIDEO_DATA_REF_FILTER, editable: true },
  registration: { type: 'object', localizable: false, cloneable: true, submittable: true, ref: REGISTRATION_DATA_REF_FILTER, editable: true },
  marketoIntegration: { type: 'object', localizable: false, cloneable: false, submittable: true, ref: MARKETO_INTEGRATION_DATA_REF_FILTER, editable: true },
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
  localizations: { type: 'object', localizable: false, submittable: true },
  creationTime: { type: 'string', localizable: false, submittable: false },
  modificationTime: { type: 'string', localizable: false, submittable: true },
};

/**
 * @typedef {Object} SponsorDataFilter
 * @property {string} type - The type of the attribute.
 * @property {boolean} localizable - Whether the attr should be in payload or payload.localizations.
 * @property {boolean} submittable - Whether the attribute can be submitted.
 */

export const SPONSOR_DATA_FILTER = {
  sponsorId: { type: 'string', localizable: false, submittable: true },
  name: { type: 'string', localizable: false, submittable: true },
  info: { type: 'string', localizable: true, submittable: true },
  link: { type: 'string', localizable: false, submittable: true },
  localizations: { type: 'object', localizable: false, submittable: true },
  creationTime: { type: 'string', localizable: false, submittable: false },
  modificationTime: { type: 'string', localizable: false, submittable: true },
};

/**
 * @typedef {Object} VenueDataFilter
 * @property {string} type - The type of the attribute.
 * @property {boolean} localizable - Whether the attr should be in payload or payload.localizations.
 * @property {boolean} submittable - Whether the attribute can be submitted.
 */

export const VENUE_DATA_FILTER = {
  venueName: { type: 'string', localizable: false, submittable: true },
  placeId: { type: 'string', localizable: false, submittable: true },
  coordinates: { type: 'object', localizable: false, submittable: true },
  gmtOffset: { type: 'number', localizable: false, submittable: true },
  addressComponents: { type: 'array', localizable: false, submittable: true },
  formattedAddress: { type: 'string', localizable: false, submittable: true },
  localizations: { type: 'object', localizable: false, submittable: true },
  additionalInformation: { type: 'string', localizable: true, submittable: true },
  creationTime: { type: 'string', localizable: false, submittable: false },
  modificationTime: { type: 'string', localizable: false, submittable: true },
};

export function isValidAttribute(attr) {
  return (attr !== undefined && attr !== null && attr !== '') || attr === false;
}

export function setEventAttribute(data, key, value, locale) {
  if (EVENT_DATA_FILTER[key]?.localizable) {
    data.localizations[locale][key] = value;
  } else {
    data[key] = value;
  }
}

export function getAttribute(data, key, locale) {
  if (data.localizations?.[locale]?.[key]) {
    return data.localizations[locale][key];
  }
  return data[key];
}

export function getProfileAttr(data, key, locale) {
  if (SPEAKER_DATA_FILTER[key]?.localizable) {
    const localizedData = data.localizations?.[locale];
    if (localizedData?.[key]) {
      return localizedData[key];
    }

    return data[key];
  }

  return data[key];
}

export function setProfileAttr(data, key, value, locale) {
  if (SPEAKER_DATA_FILTER[key]?.localizable) {
    data.localizations[locale][key] = value;
  } else {
    data[key] = value;
  }
}

export function splitLocalizableFields(data, filter, locale) {
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

export async function getSpeakerPayload(speakerData, locale, seriesId) {
  if (!speakerData) return speakerData;

  // Remove empty social links
  speakerData.socialLinks = speakerData.socialLinks.filter((sm) => sm.link !== '');

  let existingSpeakerPayload = {};
  if (speakerData.speakerId) {
    existingSpeakerPayload = await getSpeaker(seriesId, speakerData.speakerId);
  }

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
    localizations: { ...existingSpeakerPayload.localizations, [locale]: filteredLocalePayload },
  };
}

export async function getSponsorPayload(sponsorData, locale, seriesId) {
  if (!sponsorData) return sponsorData;

  let existingSponsorPayload = {};
  if (sponsorData.sponsorId) {
    existingSponsorPayload = await getSponsor(seriesId, sponsorData.sponsorId);
  }

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
    localizations: { ...existingSponsorPayload.localizations, [locale]: filteredLocalePayload },
  };
}

export function getVenuePayload(venueData, locale) {
  if (!venueData) return venueData;

  // Split venue data into localizable and non-localizable fields
  const { localizableFields, nonLocalizableFields } = splitLocalizableFields(
    venueData,
    VENUE_DATA_FILTER,
    locale,
  );

  const filteredGlobalPayload = Object.entries(nonLocalizableFields).reduce((acc, [key, value]) => {
    if (VENUE_DATA_FILTER[key]?.submittable) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const filteredLocalePayload = Object.entries(localizableFields).reduce((acc, [key, value]) => {
    if (VENUE_DATA_FILTER[key]?.submittable) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const payload = { ...filteredGlobalPayload };

  if (Object.keys(filteredLocalePayload).length > 0) {
    payload.localizations = { [locale]: filteredLocalePayload };
  }

  return payload;
}

export function getEventPayload(eventData, locale) {
  if (!eventData) return eventData;

  const { localizableFields, nonLocalizableFields } = splitLocalizableFields(
    eventData,
    EVENT_DATA_FILTER,
    locale,
  );

  const filteredGlobalPayload = Object.entries(nonLocalizableFields).reduce((acc, [key, value]) => {
    if (EVENT_DATA_FILTER[key]?.submittable) {
      acc[key] = value;
    }

    return acc;
  }, {});

  const filteredLocalePayload = Object.entries(localizableFields).reduce((acc, [key, value]) => {
    if (EVENT_DATA_FILTER[key]?.submittable) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const payload = { ...filteredGlobalPayload };

  if (Object.keys(filteredLocalePayload).length > 0) {
    payload.localizations = { [locale]: filteredLocalePayload };
  }

  return payload;
}
