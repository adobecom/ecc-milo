import { getLibs } from '../../ecc/scripts/utils.js';
import { generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function buildCheckbox(el) {
  const checkboxCell = el.querySelector(':scope > div:first-of-type > div:last-of-type');
  checkboxCell.classList.add('partners-visible-toggle');
  const fieldSet = createTag('fieldset', { class: 'checkboxes' });
  const [inputLabel, comment] = [checkboxCell.querySelector('li'), checkboxCell.querySelector('p')];
  const labelText = inputLabel.textContent.trim();
  const checkbox = createTag('sp-checkbox', { id: 'partners-visible' }, labelText);
  const wrapper = createTag('div', { class: 'checkbox-wrapper' });

  wrapper.append(checkbox);
  fieldSet.append(wrapper);

  const additionalComment = createTag('div', { class: 'additional-comment' });
  additionalComment.append(comment.textContent.trim());
  checkboxCell.innerHTML = '';
  fieldSet.append(additionalComment);
  checkboxCell.append(fieldSet);
}

async function buildFields(el) {
  const imgLabelRow = el.querySelector(':scope > div:last-of-type');

  const partnerFieldset = createTag('partner-selector-group');

  partnerFieldset.fieldlabels = {
    image: imgLabelRow.querySelector(':scope > div:first-of-type'),
    nameLabelText: imgLabelRow.querySelector('div:last-of-type li:first-of-type')?.textContent.trim() || 'Partner name',
    urlLabelText: imgLabelRow.querySelector('div:last-of-type li:last-of-type')?.textContent.trim() || 'Partner external URL',
  };

  el.appendChild(partnerFieldset);
  imgLabelRow.remove();
}

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));
  buildCheckbox(el);
  await buildFields(el);
}
