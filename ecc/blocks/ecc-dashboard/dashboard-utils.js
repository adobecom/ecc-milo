import { EVENT_DATA_FILTER, isValidAttribute } from '../../scripts/data-utils.js';

export function cloneFilter(obj) {
  const output = {};

  Object.entries(EVENT_DATA_FILTER).forEach(([key, attr]) => {
    if (isValidAttribute(obj[key]) && attr.cloneable) {
      output[key] = obj[key];
    }
  });

  return output;
}

export function eventObjFilter(obj) {
  const output = {};

  Object.entries(EVENT_DATA_FILTER).forEach(([key, attr]) => {
    if (isValidAttribute(obj[key]) && attr.submittable) {
      output[key] = obj[key];
    }
  });

  return output;
}
