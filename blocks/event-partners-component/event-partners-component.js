import { getLibs } from '../../scripts/utils.js';
import { addRepeater, generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function buildCheckbox(el) {
  const checkboxCell = el.querySelector(':scope > div:first-of-type > div:last-of-type');
  checkboxCell.classList.add('partners-visible-toggle');
  const fieldSet = createTag('fieldset', { class: 'checkboxes' });
  const [inputLabel, comment] = [checkboxCell.querySelector('li'), checkboxCell.querySelector('p')];
  const labelText = inputLabel.textContent.trim();
  const checkbox = createTag('sp-checkbox', { id: 'checkbox-venue-info-visible' }, labelText);
  const wrapper = createTag('div', { class: 'checkbox-wrapper' });

  wrapper.append(checkbox);
  fieldSet.append(wrapper);

  const additionalComment = createTag('div', { class: 'additional-comment' });
  additionalComment.append(comment.textContent.trim());
  checkboxCell.innerHTML = '';
  fieldSet.append(additionalComment);
  checkboxCell.append(fieldSet);
}

function buildFieldSelector(row, partners) {
  const fieldset = createTag('fieldset', { class: 'rsvp-field-wrapper' });

  const select = createTag('sp-picker', { class: 'partner-select-input', label: 'Select a partner' });
  const imgHolder = createTag('img', { class: 'partner-img' });
  const partnerCheckbox = createTag('sp-checkbox', { class: 'checkbox-partner-link' }, 'Link to [Partner name]');

  partners.forEach((p) => {
    const opt = createTag('sp-menu-item', { value: p.name }, p.name);
    select.append(opt);
  });

  fieldset.append(select, imgHolder, partnerCheckbox);
  row.append(fieldset);
  addRepeater(fieldset, 'Add Partners');
}

async function buildFields(el) {
  const configRow = el.querySelector(':scope > div:last-of-type');
  const configSheetLocation = configRow.querySelector('a')?.textContent.trim();
  if (!configSheetLocation) return;

  el.dataset.configUrl = configSheetLocation;
  const partners = await fetch(configSheetLocation).then((resp) => resp.json()).catch((err) => window.lana?.log(`Failed to load RSVP fields config: ${err}`));
  if (!partners) return;

  configRow.innerHTML = '';
  buildFieldSelector(configRow, partners.data);
}

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));
  buildCheckbox(el);
  await buildFields(el);
}
