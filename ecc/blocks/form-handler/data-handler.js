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
