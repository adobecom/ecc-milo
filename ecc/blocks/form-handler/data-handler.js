/* eslint-disable no-use-before-define */

import { EVENT_DATA_FILTER } from '../../scripts/constants.js';

const responseCache = { localizations: {} };

const payloadCache = { localizations: {} };

function isValidAttribute(attr) {
  return attr !== undefined && attr !== null;
}

export function quickFilter(obj) {
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
  const localizableFields = {};
  const nonLocalizableFields = {};

  Object.entries(newData).forEach(([key, value]) => {
    if (EVENT_DATA_FILTER[key]?.localizable) {
      localizableFields[key] = value;
    } else {
      nonLocalizableFields[key] = value;
    }
  });

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
  const localizableFields = {};
  const nonLocalizableFields = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (EVENT_DATA_FILTER[key]?.localizable) {
      localizableFields[key] = value;
    } else if (isValidAttribute(value)) {
      nonLocalizableFields[key] = value;
    }
  });

  // Update payloadCache
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

export function getFilteredCachedPayload(locale = 'en-US') {
  const localePayload = payloadCache.localizations[locale] || payloadCache;

  // Return both global and localized data
  return {
    eventId: payloadCache.eventId,
    modificationTime: payloadCache.modificationTime,
    creationTime: payloadCache.creationTime,
    localizations: { [locale]: localePayload },
  };
}

export function setResponseCache(response, locale = 'en-US') {
  if (!response) return;

  // Update global fields
  if (response.eventId) responseCache.eventId = response.eventId;
  if (response.modificationTime) responseCache.modificationTime = response.modificationTime;
  if (response.creationTime) responseCache.creationTime = response.creationTime;

  // If response has a localizations object, merge it directly
  if (response.localizations) {
    responseCache.localizations = {
      ...responseCache.localizations,
      ...response.localizations,
    };
  } else {
    const localeData = response;
    responseCache.localizations[locale] = quickFilter(localeData);
  }
}

export function getFilteredCachedResponse(locale = 'en-US') {
  const localeResponse = responseCache.localizations[locale] || responseCache;

  // Return both global and localized data
  return {
    eventId: responseCache.eventId,
    modificationTime: responseCache.modificationTime,
    creationTime: responseCache.creationTime,
    localizations: { [locale]: localeResponse },
  };
}

/**
 * Recursively compares two values to determine if they are different.
 *
 * @param {*} value1 - The first value to compare.
 * @param {*} value2 - The second value to compare.
 * @returns {boolean} - Returns true if the values are different, otherwise false.
 */
export function compareObjects(value1, value2, lengthOnly = false) {
  if (
    typeof value1 === 'object'
    && value1 !== null
    && !Array.isArray(value1)
    && typeof value2 === 'object'
    && value2 !== null
    && !Array.isArray(value2)
  ) {
    if (hasContentChanged(value1, value2)) {
      return true;
    }
  } else if (Array.isArray(value1) && Array.isArray(value2)) {
    if (value1.length !== value2.length) {
      // Change detected due to different array lengths
      return true;
    }

    if (!lengthOnly) {
      for (let i = 0; i < value1.length; i += 1) {
        if (compareObjects(value1[i], value2[i])) {
          return true;
        }
      }
    }
  } else if (value1 !== value2) {
    // Change detected
    return true;
  }
  return false;
}

/**
 * Determines if the content of two objects has changed.
 *
 * @param {Object} oldData - The original object.
 * @param {Object} newData - The updated object.
 * @returns {boolean} - Returns true if content has changed, otherwise false.
 * @throws {TypeError} - Throws error if inputs are not objects.
 */
export function hasContentChanged(oldData, newData) {
  // Ensure both inputs are objects
  if (
    typeof oldData !== 'object'
    || oldData === null
    || typeof newData !== 'object'
    || newData === null
  ) {
    throw new TypeError('Both oldData and newData must be objects');
  }

  const ignoreList = [
    'modificationTime',
    'status',
    'platform',
    'platformCode',
    'liveUpdate',
    'externalProvider',
  ];

  const lengthOnlyList = ['speakers'];

  // Checking keys counts
  const oldDataKeys = Object.keys(oldData).filter((key) => !ignoreList.includes(key));
  const newDataKeys = Object.keys(newData).filter((key) => !ignoreList.includes(key));

  if (oldDataKeys.length !== newDataKeys.length) {
    // Change detected due to different key counts
    return true;
  }

  // Check for differences in the actual values
  return oldDataKeys.some(
    (key) => {
      const lengthOnly = lengthOnlyList.includes(key) && !oldData[key].ordinal;

      return !ignoreList.includes(key) && compareObjects(oldData[key], newData[key], lengthOnly);
    },
  );
}

export function getLocalizedResponseData(props) {
  const response = getFilteredCachedResponse(props.locale);
  return {
    eventId: response.eventId,
    modificationTime: response.modificationTime,
    creationTime: response.creationTime,
    ...response.localizations?.[props.locale] || {},
  };
}

export function getLocalizedPayloadData(props) {
  const payload = getFilteredCachedPayload(props.locale);
  return {
    eventId: payload.eventId,
    modificationTime: payload.modificationTime,
    creationTime: payload.creationTime,
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
    eventId: filteredResponse.eventId || filteredPayload.eventId,
    modificationTime: filteredResponse.modificationTime || filteredPayload.modificationTime,
    creationTime: filteredResponse.creationTime || filteredPayload.creationTime,
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
