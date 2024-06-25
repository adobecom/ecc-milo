import { getLibs } from '../../ecc/scripts/utils.js';
import { handlize, generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function decorateCheckboxes(el) {
  const minReg = el.className.match(/min-(.*?)( |$)/);
  const isRequired = !!minReg;
  const lis = el.querySelectorAll('ul > li');
  const checkboxes = [];
  const fieldSet = createTag('fieldset', { class: 'checkboxes' });
  lis.forEach((cb) => {
    const cn = cb.textContent.trim();
    const handle = handlize(cn);
    const input = createTag('input', {
      id: `checkbox-${handle}`,
      name: `checkbox-${handle}`,
      type: 'checkbox',
      class: 'checkbox-input',
      value: handle,
      required: isRequired,
    });
    const label = createTag('label', { class: 'checkbox-label', for: `checkbox-${handle}` }, cn);
    const wrapper = createTag('div', { class: 'checkbox-wrapper' });

    wrapper.append(input, label);
    fieldSet.append(wrapper);
    checkboxes.push(input);
  });

  el.append(fieldSet);

  const oldCheckboxDiv = el.querySelector(':scope > div:last-of-type');
  if (oldCheckboxDiv?.querySelector('ul')) {
    oldCheckboxDiv.remove();
  }
}

export default function init(el) {
  el.classList.add('form-component');
  generateToolTip(el);
  decorateCheckboxes(el);
}
