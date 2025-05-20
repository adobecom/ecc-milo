/* eslint-disable no-use-before-define */

import { EVENT_DATA_FILTER, isValidAttribute, splitLocalizableFields } from '../../scripts/data-utils.js';

const responseCache = { localizations: {} };
const payloadCache = { localizations: {} };
let deleteList = [];

export function setDeleteList(data) {
  deleteList.push(...data);
}

export function runDelete() {
  deleteList.forEach((item) => {
    if (item.path) {
      const path = item.path.split('.');
      const payloadTarget = path.reduce((acc, subKey) => acc[subKey], payloadCache);
      const responseTarget = path.reduce((acc, subKey) => acc[subKey], responseCache);
      delete payloadTarget[item.key];
      delete responseTarget[item.key];
    } else {
      delete payloadCache[item.key];
      delete responseCache[item.key];
    }
  });

  deleteList = [];
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

export function setPropsPayload(props, newData, removeData = []) {
  const { locale } = props;
  const existingPayload = props.payload;

  // Split newData into localizable and non-localizable fields
  const { localizableFields, nonLocalizableFields } = splitLocalizableFields(
    newData,
    EVENT_DATA_FILTER,
    locale,
  );

  // apply nested ref filters
  Object.entries(nonLocalizableFields).forEach(([key, value]) => {
    const attr = EVENT_DATA_FILTER[key];
    if (!attr) return;

    if (attr.ref && attr.type === 'array') {
      const refFilter = attr.ref;
      const refData = value.map((item) => Object.keys(refFilter).reduce((acc, refKey) => {
        if (refFilter[refKey].submittable) {
          acc[refKey] = item[refKey];
        }
        return acc;
      }, {}));
      nonLocalizableFields[key] = refData;
    }

    if (attr.ref && attr.type === 'object') {
      const refFilter = attr.ref;
      const refData = Object.keys(refFilter).reduce((acc, refKey) => {
        if (refFilter[refKey].submittable) {
          acc[refKey] = value[refKey];
        }
        return acc;
      }, {});
      nonLocalizableFields[key] = refData;
    }
  });

  Object.entries(localizableFields).forEach(([key, value]) => {
    const attr = EVENT_DATA_FILTER[key];
    if (!attr) return;

    if (attr.ref && attr.type === 'array') {
      const refFilter = attr.ref;
      const refData = value.map((item) => Object.keys(refFilter).reduce((acc, refKey) => {
        if (refFilter[refKey].submittable) {
          acc[refKey] = item[refKey];
        }
        return acc;
      }, {}));
      localizableFields[key] = refData;
    }
  });

  const payload = {
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

  // Update the payload
  props.payload = payload;
  props.deleteList = removeData;
}

export function setPayloadCache(payload, locale) {
  if (!payload || !locale) return;

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
    ...splitNewPayload.localizableFields[locale],
  };
}

export function setResponseCache(response, locale) {
  if (!response || !locale) return;

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

export function getFilteredCachedPayload() {
  const submittableFields = Object.entries(EVENT_DATA_FILTER)
    .filter(([, attr]) => attr.submittable)
    .map(([key]) => key);

  const filteredPayload = submittableFields.reduce((acc, key) => {
    if (isValidAttribute(payloadCache[key])) {
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
    if (isValidAttribute(responseCache[key])) {
      acc[key] = responseCache[key];
    }
    return acc;
  }, {});

  return filteredResponse;
}

export default function getJoinedData() {
  runDelete();
  
  const filteredResponse = getFilteredCachedResponse();
  const filteredPayload = getFilteredCachedPayload();

  // Combine global and localized data
  const finalPayload = {
    ...filteredResponse,
    ...filteredPayload,
    modificationTime: filteredResponse.modificationTime,
  };

  return finalPayload;
}
