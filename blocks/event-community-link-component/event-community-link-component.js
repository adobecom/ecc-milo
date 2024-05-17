import { getLibs } from '../../scripts/utils.js';
import { generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

async function decorateField(row, type = 'text') {
  row.classList.add('text-field-row');
  const cols = row.querySelectorAll(':scope > div');
  if (!cols.length) return null;
  const [checkboxText, placeholderCol] = cols;
  const text = placeholderCol.textContent.trim();

  let input;

  if (type === 'text') {
    input = createTag('sp-textfield', {
      id: 'community-url-details',
      class: 'text-input',
      placeholder: text,
      size: 'xl',
    });
  }

  const cn = checkboxText.textContent.trim();
  const checkbox = createTag('sp-checkbox', {
    id: 'checkbox-community',
    name: 'checkbox-community',
    value: cn,
  });

  checkbox.textContent = '';

  const parenthesisMatch = cn.match(/(.*?)(\s*\(.*?\))/);
  if (parenthesisMatch) {
    const [_, mainText, parenthesisText] = parenthesisMatch;

    checkbox.appendChild(document.createTextNode(mainText.trim()));
    checkbox.appendChild(document.createElement('br'));
    checkbox.appendChild(document.createTextNode(parenthesisText.trim()));
  } else {
    checkbox.appendChild(document.createTextNode(cn));
  }

  const wrapper = createTag('div', { class: 'field-container' });
  wrapper.append(checkbox, input);

  row.innerHTML = '';
  row.append(wrapper);

  return row;
}

export default async function init(el) {
  const miloLibs = getLibs();

  await Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/textfield.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/checkbox.js`),
  ]);

  el.classList.add('form-component');
  generateToolTip(el);
  const rows = [...el.querySelectorAll(':scope > div')];
  await decorateField(rows[1], 'text');
}
