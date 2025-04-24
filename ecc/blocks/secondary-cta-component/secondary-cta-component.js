import { LINK_REGEX } from '../../scripts/constants.js';
import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

async function decorateFields(row) {
  row.classList.add('text-field-row');
  const cols = row.querySelectorAll(':scope > div');
  if (!cols.length) return null;
  const [checkboxText, placeholderCol] = cols;

  const placeholderText = placeholderCol.textContent.trim();
  if (!placeholderText) {
    window.lana?.log('Missing placeholder text for secondary CTA fields');
    return null;
  }

  const [label, url] = placeholderText.split('\n');
  if (!label || !url) {
    window.lana?.log('Invalid format for secondary CTA fields. Expected label and URL separated by newline');
    return null;
  }

  const inputsWrapper = createTag('div', { class: 'inputs-wrapper' });
  createTag(
    'sp-textfield',
    {
      id: 'secondary-cta-label',
      class: 'text-input',
      placeholder: label.trim(),
      size: 'xl',
      'aria-label': 'Secondary CTA Label',
    },
    '',
    { parent: inputsWrapper },
  );

  createTag(
    'sp-textfield',
    {
      id: 'secondary-cta-url',
      class: 'text-input',
      placeholder: url.trim(),
      pattern: LINK_REGEX,
      size: 'xl',
      'aria-label': 'Secondary CTA URL',
      'aria-describedby': 'url-error-message',
    },
    '',
    { parent: inputsWrapper },
  );

  // Add error message element for URL validation
  createTag(
    'div',
    {
      id: 'url-error-message',
      class: 'error-message',
      'aria-live': 'polite',
    },
    'Please enter a valid URL',
    { parent: inputsWrapper },
  );

  const cn = checkboxText.textContent.trim();
  const checkbox = createTag('sp-checkbox', {
    id: 'checkbox-secondary-url',
    name: 'checkbox-secondary-url',
    value: cn,
    'aria-label': 'Enable Secondary CTA',
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
  if (rows.length < 2) {
    window.lana?.log('Secondary CTA component requires at least 2 rows');
    return;
  }
  decorateFields(rows[1]);
}
