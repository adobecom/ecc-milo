import { EVENT_DATA_FILTER, isValidAttribute } from '../../scripts/data-utils.js';

export function cloneFilter(obj) {
  const output = {};

  Object.entries(EVENT_DATA_FILTER).forEach(([key, attr]) => {
    if (isValidAttribute(obj[key]) && attr.cloneable) {
      output[key] = obj[key];
    }
  });

  const defaultLocale = obj.defaultLocale || 'en-US';
  // keep only localizations[defaultLocale] to avoid cloning every localization row
  output.localizations = { [defaultLocale]: obj.localizations[defaultLocale] };

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
