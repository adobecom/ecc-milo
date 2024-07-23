/* eslint-disable no-useless-escape */
/* eslint-disable import/prefer-default-export */

export const LINK_REGEX = (format) => {
  if (format?.toLowerCase() === 'html') return '^https:\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/[a-z0-9\-\.\_\%]*)?(\?[a-z0-9\-\.\_\%&=]*)?(#[a-z0-9\-\.\_\%]*)?$';
  return '^https:\\/\\/[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/[a-z0-9\\-\\.\\_\\%]*)?(\\?[a-z0-9\\-\\.\\_\\%&=]*)?(#[a-z0-9\\-\\.\\_\\%]*)?$';
};
