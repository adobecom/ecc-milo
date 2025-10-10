/* eslint-disable no-use-before-define */
// FIXME: this whole data handler thing can be done better
import { filterSeriesData } from '../../scripts/data-utils.js';

let responseCache = {};
let payloadCache = {};
let cachedSeriesId = null;
let deleteList = [];

export function quickFilter(data, mode = 'submission') {
  return filterSeriesData(data, mode);
}

export function setDeleteList(entries = []) {
  if (!Array.isArray(entries) || !entries.length) return;
  deleteList.push(...entries.filter((entry) => entry && typeof entry.key === 'string'));
}

function unsetPath(target, pathArray, key) {
  if (!target || typeof target !== 'object') return;
  if (!Array.isArray(pathArray) || !pathArray.length) {
    delete target[key];
    return;
  }

  const [head, ...rest] = pathArray;
  const nextTarget = target[head];
  if (!nextTarget || typeof nextTarget !== 'object') return;
  unsetPath(nextTarget, rest, key);
}

function runDelete() {
  if (!deleteList.length) return;

  deleteList.forEach(({ key, path = '' }) => {
    if (!key) return;
    const pathSegments = path ? path.split('.').filter(Boolean) : [];
    unsetPath(payloadCache, pathSegments, key);
    unsetPath(responseCache, pathSegments, key);
  });

  deleteList = [];
}

export function setPayloadCache(payload) {
  if (!payload) return;
  runDelete();
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
  runDelete();

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
  runDelete();
  const filteredResponse = getFilteredCachedResponse();
  const filteredPayload = getFilteredCachedPayload();

  return {
    ...filteredResponse,
    ...filteredPayload,
    modificationTime: filteredResponse.modificationTime,
  };
}
