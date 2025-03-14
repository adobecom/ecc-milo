import { SPEAKER_DATA_FILTER, SPONSOR_DATA_FILTER } from './constants.js';

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
