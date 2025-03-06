/* eslint-disable no-use-before-define */

import { EVENT_DATA_FILTER } from '../../scripts/constants.js';

// FIXME: this whole data handler thing can be done better
const responseCache = { localization: {} };
const payloadCache = { localization: {} };

function isValidAttribute(attr) {
  return attr !== undefined && attr !== null;
}

export function quickFilter(obj) {
  const output = {};

  Object.keys(EVENT_DATA_FILTER).forEach((attr) => {
    const { name, submittable } = EVENT_DATA_FILTER[attr];
    if (isValidAttribute(obj[name]) && submittable) {
      output[name] = obj[name];
    }
  });

  return output;
}

export function setPropsPayload(props, newData, lang = 'en') {
  const existingPayload = props.payload;
  const localePayload = existingPayload.localization?.[lang] || {};

  // Only update localization structure
  props.payload = {
    ...existingPayload,
    localization: {
      ...existingPayload.localization,
      [lang]: {
        ...localePayload,
        ...newData,
      },
    },
  };
}

export function setPayloadCache(payload, lang = 'en') {
  if (!payload) return;

  const localeData = payload.localization?.[lang] || payload;
  payloadCache.localization[lang] = quickFilter(localeData);

  const { pendingTopics } = localeData;
  if (pendingTopics) {
    const jointTopics = Object.values(pendingTopics).reduce((acc, val) => acc.concat(val), []);
    if (jointTopics.length) payloadCache.localization[lang].topics = jointTopics;
  }
}

export function getFilteredCachedPayload(lang = 'en') {
  const localePayload = payloadCache.localization[lang] || payloadCache;

  // Only return localization structure
  return { localization: { [lang]: localePayload } };
}

export function setResponseCache(response, lang = 'en') {
  if (!response) return;

  const localeData = response.localization?.[lang] || response;
  responseCache.localization[lang] = quickFilter(localeData);
}

export function getFilteredCachedResponse(lang = 'en') {
  const localeResponse = responseCache.localization[lang] || responseCache;

  // Only return localization structure
  return { localization: { [lang]: localeResponse } };
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

export default function getJoinedData(lang = 'en') {
  const filteredResponse = getFilteredCachedResponse(lang);
  const filteredPayload = getFilteredCachedPayload(lang);

  const localeResponse = filteredResponse.localization?.[lang] || {};
  const localePayload = filteredPayload.localization?.[lang] || {};

  // Only use localization structure
  const finalPayload = {
    localization: {
      [lang]: {
        ...localeResponse,
        ...localePayload,
      },
    },
  };

  Object.keys(localeResponse).forEach((key) => {
    if (!EVENT_DATA_FILTER[key]?.deletable) return;

    if (EVENT_DATA_FILTER[key].deletable && !localePayload[key]) {
      delete finalPayload.localization[lang][key];
    }
  });

  // Add deprecation warning for accessing data at global level
  return new Proxy(finalPayload, {
    get(target, prop) {
      if (prop !== 'localization') {
        console.warn(`[Deprecation Warning] Accessing data at global level is deprecated. Please use the localization structure instead. Tried to access: ${String(prop)}`);
        return target.localization[lang][prop];
      }
      return target[prop];
    },
  });
}

export function getLocalizedResponseData(props) {
  const response = getFilteredCachedResponse(props.language);
  return response.localization?.[props.language] || {};
}

export function getLocalizedPayloadData(props) {
  const payload = getFilteredCachedPayload(props.language);
  return payload.localization?.[props.language] || {};
}
