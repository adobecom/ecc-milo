import { getLibs } from '../../scripts/utils.js';
import { getIcon, generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

export default function init(el) {
  el.classList.add('form-component');
  generateToolTip(el);
}
