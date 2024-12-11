/* eslint-disable no-unused-vars */
// import { LIBS } from '../../scripts/scripts.js';
// import { handlize, generateToolTip } from '../../scripts/utils.js';

// const { createTag } = await import(`${LIBS}/utils/utils.js`);

export default function init(el) {
  el.classList.add('form-component');
  // generateToolTip(el);

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((_r, _i) => {
    // perform decoration based on the index of the row
  });
}
