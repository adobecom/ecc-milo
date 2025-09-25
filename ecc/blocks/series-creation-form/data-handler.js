/* eslint-disable no-use-before-define */
// FIXME: this whole data handler thing can be done better
import { filterSeriesData } from '../../scripts/data-utils.js';

let responseCache = {};
let payloadCache = {};
let cachedSeriesId = null;

export function quickFilter(data, mode = 'submission') {
  return filterSeriesData(data, mode);
}

export function setPayloadCache(payload) {
  if (!payload) return;
  if (cachedSeriesId) {
    payloadCache = filterSeriesData(payload, 'update', { excludeKeys: ['targetCms'] });
  } else {
    payloadCache = quickFilter(payload, 'submission');
  }
}

export function getFilteredCachedPayload() {
  return payloadCache;
}

export function setResponseCache(response) {
  if (!response) return;
  cachedSeriesId = response.seriesId ?? cachedSeriesId;

  if (cachedSeriesId) {
    responseCache = filterSeriesData(response, 'update', { excludeKeys: ['targetCms'] });
  } else {
    responseCache = quickFilter(response, 'submission');
  }
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
