/* eslint-disable no-use-before-define */
// FIXME: this whole data handler thing can be done better
let responseCache = {};
let payloadCache = {};

const filters = {
  submission: [
    'seriesName',
    'seriesDescription',
    'seriesStatus',
    'susiContextId',
    'externalThemeId',
    'cloudType',
    'templateId',
    'relatedDomain',
    'modificationTime',
  ],
  clone: [
    'seriesName',
    'seriesDescription',
    'seriesStatus',
    'susiContextId',
    'externalThemeId',
    'cloudType',
    'templateId',
    'relatedDomain',
  ],
};

function isValidAttribute(attr) {
  return attr !== undefined && attr !== null;
}

export function quickFilter(obj, filter = 'submission') {
  const output = {};

  filters[filter].forEach((attr) => {
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
