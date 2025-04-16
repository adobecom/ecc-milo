import { LINK_REGEX } from '../../scripts/constants.js';
import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

async function decorateFields(row) {
  row.classList.add('text-field-row');
  const cols = row.querySelectorAll(':scope > div');
  if (!cols.length) return null;
  const [checkboxText, placeholderCol] = cols;
  const [title, url] = placeholderCol.textContent.trim().split('\n');

  const inputsWrapper = createTag('div', { class: 'inputs-wrapper' });
  createTag(
    'sp-textfield',
    {
      id: 'secondary-url-title',
      class: 'text-input',
      placeholder: title.trim(),
      size: 'xl',
    },
    '',
    { parent: inputsWrapper },
  );

  createTag(
    'sp-textfield',
    {
      id: 'secondary-url-url',
      class: 'text-input',
      placeholder: url.trim(),
      pattern: LINK_REGEX,
      size: 'xl',
    },
    '',
    { parent: inputsWrapper },
  );

  const cn = checkboxText.textContent.trim();
  const checkbox = createTag('sp-checkbox', {
    id: 'checkbox-secondary-url',
    name: 'checkbox-secondary-url',
    value: cn,
  });

  checkbox.textContent = '';

  const parenthesisMatch = cn.match(/(.*?)(\s*\(.*?\))/);
  if (parenthesisMatch) {
    const [, mainText, parenthesisText] = parenthesisMatch;

    checkbox.appendChild(document.createTextNode(mainText.trim()));
    checkbox.appendChild(document.createElement('br'));
    checkbox.appendChild(document.createTextNode(parenthesisText.trim()));
  } else {
    checkbox.appendChild(document.createTextNode(cn));
  }

  const wrapper = createTag('div', { class: 'field-container' });
  wrapper.append(checkbox, inputsWrapper);

  row.innerHTML = '';
  row.append(wrapper);

  return row;
}

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el);
  const rows = [...el.querySelectorAll(':scope > div')];
  decorateFields(rows[1]);
}
