/* eslint-disable no-use-before-define */

import { EVENT_DATA_FILTER, SPEAKER_DATA_FILTER, SPONSOR_DATA_FILTER } from '../../scripts/constants.js';

const responseCache = { localizations: {} };
const payloadCache = { localizations: {} };

function isValidAttribute(attr) {
  return attr !== undefined && attr !== null;
}

function splitLocalizableFields(data, filter) {
  const localizableFields = {};
  const nonLocalizableFields = {};

  Object.entries(data).forEach(([key, value]) => {
    if (filter[key]?.localizable) {
      localizableFields[key] = value;
    } else if (isValidAttribute(value)) {
      nonLocalizableFields[key] = value;
    }
  });

  return { localizableFields, nonLocalizableFields };
}

export function submitFilter(obj) {
  const output = {
    eventId: obj.eventId,
    modificationTime: obj.modificationTime,
    creationTime: obj.creationTime,
  };

  Object.entries(EVENT_DATA_FILTER).forEach(([key, attr]) => {
    if (isValidAttribute(obj[key]) && attr.submittable) {
      output[key] = obj[key];
    }
  });

  return output;
}

export function setPropsPayload(props, newData, locale = 'en-US') {
  const existingPayload = props.payload;

  // If newData has a localizations object, merge it directly
  if (newData.localizations) {
    props.payload = {
      ...existingPayload,
      localizations: {
        ...existingPayload.localizations,
        ...newData.localizations,
      },
    };
    return;
  }

  // Split newData into localizable and non-localizable fields
  const { localizableFields, nonLocalizableFields } = splitLocalizableFields(
    newData,
    EVENT_DATA_FILTER,
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

  // If payload has a localizations object, merge it directly
  if (payload.localizations) {
    payloadCache.localizations = {
      ...payloadCache.localizations,
      ...payload.localizations,
    };
    return;
  }

  // Split payload into localizable and non-localizable fields
  const { localizableFields, nonLocalizableFields } = splitLocalizableFields(
    payload,
    EVENT_DATA_FILTER,
  );

  // Update payloadCache with non-localizable fields
  Object.assign(payloadCache, nonLocalizableFields);
  payloadCache.localizations[locale] = {
    ...payloadCache.localizations[locale],
    ...localizableFields,
  };

  // Handle special case for pendingTopics
  const { pendingTopics } = payload;
  if (pendingTopics) {
    const jointTopics = Object.values(pendingTopics).reduce((acc, val) => acc.concat(val), []);
    if (jointTopics.length) payloadCache.localizations[locale].topics = jointTopics;
  }
}

export function setSpeakerPayload(speakerData, locale = 'en-US') {
  if (!speakerData) return speakerData;

  // Split speaker data into localizable and non-localizable fields
  const { localizableFields, nonLocalizableFields } = splitLocalizableFields(
    speakerData,
    SPEAKER_DATA_FILTER,
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

export function getFilteredCachedPayload(locale = 'en-US') {
  const localePayload = payloadCache.localizations[locale] || payloadCache;

  // Return both global and localized data
  return {
    ...payloadCache,
    localizations: { [locale]: localePayload },
  };
}

export function setResponseCache(response, locale = 'en-US') {
  if (!response) return;

  // If response has a localizations object, merge it directly
  if (response.localizations) {
    responseCache.localizations = {
      ...responseCache.localizations,
      ...response.localizations,
    };
    return;
  }

  // Split response into localizable and non-localizable fields
  const { localizableFields, nonLocalizableFields } = splitLocalizableFields(
    response,
    EVENT_DATA_FILTER,
  );

  // Update responseCache with non-localizable fields
  Object.assign(responseCache, nonLocalizableFields);
  responseCache.localizations[locale] = submitFilter(localizableFields);
}

export function getFilteredCachedResponse(locale = 'en-US') {
  const localeResponse = responseCache.localizations[locale] || responseCache;

  // Return both global and localized data
  return {
    ...responseCache,
    localizations: { [locale]: localeResponse },
  };
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

  const localeResponse = filteredResponse.localizations?.[locale] || {};
  const localePayload = filteredPayload.localizations?.[locale] || {};

  // Combine global and localized data
  const finalPayload = {
    ...filteredResponse,
    ...filteredPayload,
    localizations: {
      [locale]: {
        ...localeResponse,
        ...localePayload,
      },
    },
  };

  Object.keys(localeResponse).forEach((key) => {
    if (!EVENT_DATA_FILTER[key]?.deletable) return;

    if (EVENT_DATA_FILTER[key].deletable && !localePayload[key]) {
      delete finalPayload.localizations[locale][key];
    }
  });

  // Add deprecation warning for accessing data at global level
  return new Proxy(finalPayload, {
    get(target, prop) {
      if (prop !== 'localizations' && prop !== 'eventId' && prop !== 'modificationTime' && prop !== 'creationTime') {
        console.warn(`[Deprecation Warning] Accessing data at global level is deprecated. Please use the localizations structure instead. Tried to access: ${String(prop)}`);
        return target.localizations[locale][prop];
      }
      return target[prop];
    },
  });
}
