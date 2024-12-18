/* eslint-disable no-use-before-define */
// FIXME: Needs better implementation overall

let responseCache = {};
let payloadCache = {};

const submissionFilter = [
  // list attribute keys submittable by this form
];

function isValidAttribute(attr) {
  return attr !== undefined && attr !== null;
}

export function quickFilter(obj) {
  const output = {};

  submissionFilter.forEach((attr) => {
    if (isValidAttribute(obj[attr])) {
      output[attr] = obj[attr];
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

  return {
    ...filteredResponse,
    ...filteredPayload,
    modificationTime: filteredResponse.modificationTime,
  };
}
