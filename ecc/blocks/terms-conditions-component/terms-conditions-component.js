import { generateToolTip } from '../../scripts/utils.js';

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));
}
