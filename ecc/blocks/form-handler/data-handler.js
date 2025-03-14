/* eslint-disable no-use-before-define */

import { EVENT_DATA_FILTER, SPEAKER_DATA_FILTER, SPONSOR_DATA_FILTER } from '../../scripts/constants.js';

const responseCache = { localizations: {} };
const payloadCache = { localizations: {} };

function isValidAttribute(attr) {
  return attr !== undefined && attr !== null;
}

function splitLocalizableFields(data, filter, locale = 'en-US') {
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

export function submitFilter(obj) {
  const output = {};

  Object.entries(EVENT_DATA_FILTER).forEach(([key, attr]) => {
    if (isValidAttribute(obj[key]) && attr.submittable) {
      output[key] = obj[key];
    }
  });

  return output;
}

export function setPropsPayload(props, newData, locale = 'en-US') {
  const existingPayload = props.payload;

  // Split newData into localizable and non-localizable fields
  const { localizableFields, nonLocalizableFields } = splitLocalizableFields(
    newData,
    EVENT_DATA_FILTER,
    locale,
  );

  // Update the payload
  props.payload = {
    ...existingPayload,
    ...nonLocalizableFields,
    localizations: {
      ...existingPayload.localizations,
      [locale]: {
        ...existingPayload.localizations?.[locale],
        ...localizableFields,
      },
    },
  };
}

export function setPayloadCache(payload, locale = 'en-US') {
  if (!payload) return;

  // Split payload into localizable and non-localizable fields
  const splitNewPayload = splitLocalizableFields(
    payload,
    EVENT_DATA_FILTER,
    locale,
  );

  Object.assign(payloadCache, {
    ...payloadCache,
    ...splitNewPayload.nonLocalizableFields,
  });

  payloadCache.localizations[locale] = {
    ...payloadCache.localizations[locale],
    ...splitNewPayload.localizableFields,
  };

  // Handle special case for pendingTopics
  const { pendingTopics } = payload;
  if (pendingTopics) {
    const jointTopics = Object.values(pendingTopics).reduce((acc, val) => acc.concat(val), []);
    if (jointTopics.length) payloadCache.localizations[locale].topics = jointTopics;
  }
}

export function setResponseCache(response, locale = 'en-US') {
  if (!response) return;

  // Split response into localizable and non-localizable fields
  const splitNewResponse = splitLocalizableFields(
    response,
    EVENT_DATA_FILTER,
    locale,
  );

  Object.assign(responseCache, {
    ...responseCache,
    ...splitNewResponse.nonLocalizableFields,
  });

  responseCache.localizations[locale] = {
    ...responseCache.localizations[locale],
    ...splitNewResponse.localizableFields[locale],
  };
}

export function setSpeakerPayload(speakerData, locale = 'en-US') {
  if (!speakerData) return speakerData;

  // Split speaker data into localizable and non-localizable fields
  const { localizableFields, nonLocalizableFields } = splitLocalizableFields(
    speakerData,
    SPEAKER_DATA_FILTER,
    locale,
  );

  return {
    ...nonLocalizableFields,
    localizations: { [locale]: localizableFields },
  };
}

export function setSponsorPayload(sponsorData, locale = 'en-US') {
  if (!sponsorData) return sponsorData;

  // Split sponsor data into localizable and non-localizable fields
  const { localizableFields, nonLocalizableFields } = splitLocalizableFields(
    sponsorData,
    SPONSOR_DATA_FILTER,
    locale,
  );

  return {
    ...nonLocalizableFields,
    localizations: { [locale]: localizableFields },
  };
}

export function getLocalizedSpeakerData(speakerData, locale = 'en-US') {
  if (!speakerData) return speakerData;

  return {
    ...speakerData,
    ...speakerData.localizations?.[locale],
  };
}

export function getLocalizedSponsorData(sponsorData, locale = 'en-US') {
  if (!sponsorData) return sponsorData;

  return {
    ...sponsorData,
    ...sponsorData.localizations?.[locale],
  };
}

export function getFilteredCachedPayload() {
  const submittableFields = Object.entries(EVENT_DATA_FILTER)
    .filter(([, attr]) => attr.submittable)
    .map(([key]) => key);

  const filteredPayload = submittableFields.reduce((acc, key) => {
    if (payloadCache[key]) {
      acc[key] = payloadCache[key];
    }
    return acc;
  }, {});

  return filteredPayload;
}

export function getFilteredCachedResponse() {
  const submittableFields = Object.entries(EVENT_DATA_FILTER)
    .filter(([, attr]) => attr.submittable)
    .map(([key]) => key);

  const filteredResponse = submittableFields.reduce((acc, key) => {
    if (responseCache[key]) {
      acc[key] = responseCache[key];
    }
    return acc;
  }, {});

  return filteredResponse;
}

export function getLocalizedResponseData(props) {
  const response = getFilteredCachedResponse(props.locale);
  return {
    ...response,
    ...response.localizations?.[props.locale] || {},
  };
}

export function getLocalizedPayloadData(props) {
  const payload = getFilteredCachedPayload(props.locale);
  return {
    ...payload,
    ...payload.localizations?.[props.locale] || {},
  };
}

export default function getJoinedData(locale = 'en-US') {
  const filteredResponse = getFilteredCachedResponse(locale);
  const filteredPayload = getFilteredCachedPayload(locale);
  const localeResponse = getLocalizedResponseData(locale);
  const localePayload = getLocalizedPayloadData(locale);

  // Combine global and localized data
  const finalPayload = {
    ...filteredResponse,
    ...filteredPayload,
  };

  Object.keys(filteredResponse).forEach((key) => {
    if (!EVENT_DATA_FILTER[key]?.deletable) return;

    if (EVENT_DATA_FILTER[key].deletable && !filteredPayload[key]) {
      delete finalPayload[key];
    }
  });

  Object.keys(localeResponse).forEach((key) => {
    if (!EVENT_DATA_FILTER[key]?.deletable) return;

    if (EVENT_DATA_FILTER[key].deletable && !localePayload[key]) {
      delete finalPayload.localizations[locale][key];
    }
  });

  return finalPayload;
}
