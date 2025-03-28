/* eslint-disable no-use-before-define */

import { EVENT_DATA_FILTER } from '../../scripts/constants.js';

// FIXME: this whole data handler thing can be done better
let responseCache = {};
let payloadCache = {};

function isValidAttribute(attr) {
  return attr !== undefined && attr !== null;
}

export function quickFilter(obj) {
  const output = {};

  Object.entries(EVENT_DATA_FILTER).forEach(([key, attr]) => {
    if (isValidAttribute(obj[key]) && attr.submittable) {
      output[key] = obj[key];
    }
  });

  return output;
}

export function setPayloadCache(payload) {
  if (!payload) return;

  payloadCache = quickFilter(payload);
}

export function getFilteredCachedPayload() {
  return payloadCache;
}

export function setResponseCache(response) {
  if (!response) return;
  responseCache = quickFilter(response);
}

export function getFilteredCachedResponse() {
  return responseCache;
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

export default function getJoinedData() {
  const filteredResponse = getFilteredCachedResponse();
  const filteredPayload = getFilteredCachedPayload();

  const finalPayload = {
    ...filteredResponse,
    ...filteredPayload,
    modificationTime: filteredResponse.modificationTime,
  };

  return finalPayload;
}
