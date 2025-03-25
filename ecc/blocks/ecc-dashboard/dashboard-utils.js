import { EVENT_DATA_FILTER } from '../../scripts/data-utils.js';

export function cloneFilter(obj) {
  const output = {};

  Object.entries(EVENT_DATA_FILTER).forEach(([key, attr]) => {
    if (attr.cloneable) {
      output[key] = obj[key];
    }
  });

  return output;
}

export function eventObjFilter(obj) {
  const output = {};

  Object.entries(EVENT_DATA_FILTER).forEach(([key, attr]) => {
    if (obj[key] !== undefined && obj[key] !== null && attr.submittable) {
      output[key] = obj[key];
    }
  });

  return output;
}
