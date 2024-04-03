import { getLibs } from '../../scripts/utils.js';
import { handlize } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function decorateHeading(el) {
  const h2 = el.querySelector(':scope > div:first-of-type h2');

  if (h2) {
    const em = el.querySelector('p > em');

    if (em) {
      const tooltipText = em.textContent.trim();
      const toolTipIcon = createTag('span', { class: 'event-heading-tooltip-icon' }, 'i');
      const toolTipBox = createTag('div', { class: 'event-heading-tooltip-box' }, tooltipText);
      const toolTipWrapper = createTag('div', { class: 'event-heading-tooltip-wrapper' });

      toolTipWrapper.append(toolTipIcon, toolTipBox);
      h2.parentElement?.append(toolTipWrapper);
      em.parentElement?.remove();
    }
  }
}

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
  decorateHeading(el);
  decorateCheckboxes(el);
}
