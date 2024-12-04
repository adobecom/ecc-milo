import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function decorateSWCTextField(row, extraOptions) {
  row.classList.add('text-field-row');

  const cols = row.querySelectorAll(':scope > div');
  if (!cols.length) return;
  const [placeholderCol, maxLengthCol] = cols;
  const text = placeholderCol.textContent.trim();

  let maxCharNum; let
    attrTextEl;
  if (maxLengthCol) {
    attrTextEl = createTag('div', { class: 'attr-text' }, maxLengthCol.textContent.trim());
    maxCharNum = maxLengthCol.querySelector('strong')?.textContent.trim();
  }

  const isRequired = attrTextEl?.textContent.trim().endsWith('*');

  const input = createTag('sp-textfield', { ...extraOptions, class: 'venue-info-text text-input', placeholder: text });

  if (isRequired) input.required = true;

  if (maxCharNum) input.setAttribute('maxlength', maxCharNum);

  const wrapper = createTag('div', { class: 'info-field-wrapper' });
  row.innerHTML = '';
  wrapper.append(input);
  if (attrTextEl) wrapper.append(attrTextEl);
  row.append(wrapper);
}

function buildAdditionalInfo(row) {
  row.classList.add('venue-info-addition');
  const fieldSet = createTag('fieldset', { class: 'checkboxes' });
  const [inputLabel, comment] = [...row.querySelectorAll(':scope  p')];
  const labelText = inputLabel.textContent.trim();
  const checkbox = createTag('sp-checkbox', { id: 'checkbox-venue-info-visible' }, labelText);
  const wrapper = createTag('div', { class: 'checkbox-wrapper' });

  wrapper.append(checkbox);
  fieldSet.append(wrapper);

  const additionComment = createTag('div', { class: 'additional-comment' });
  additionComment.append(comment.textContent.trim());
  row.innerHTML = '';
  fieldSet.append(additionComment);
  row.append(fieldSet);
  row.classList.add('venue-info-addition-wrapper');
}

function buildLocationInputGrid(row) {
  const locationDetailsWrapper = createTag('div', { class: 'location-wrapper' });

  const cityInput = createTag('input', { id: 'location-city', type: 'hidden' });
  const postalCodeInput = createTag('input', { id: 'location-postal-code', type: 'hidden' });
  const countryInput = createTag('input', { id: 'location-country', type: 'hidden' });
  const placeIdInput = createTag('input', { id: 'google-place-id', type: 'hidden' });
  const placeLATInput = createTag('input', { id: 'google-place-lat', type: 'hidden' });
  const placeLNGInput = createTag('input', { id: 'google-place-lng', type: 'hidden' });
  const gmtOffsetInput = createTag('input', { id: 'google-place-gmt-offset', type: 'hidden' });
  const addressComponents = createTag('input', { id: 'google-place-address-components', type: 'hidden' });
  const formattedAddressInput = createTag('input', { id: 'venue-info-venue-address', type: 'hidden' });

  locationDetailsWrapper.append(
    cityInput,
    postalCodeInput,
    countryInput,
    placeIdInput,
    placeLATInput,
    placeLNGInput,
    gmtOffsetInput,
    addressComponents,
    formattedAddressInput,
  );

  row.innerHTML = '';
  row.append(locationDetailsWrapper);
  row.classList.add('venue-info-field-location');
}

export default function init(el) {
  el.classList.add('form-component');

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    switch (i) {
      case 0:
        generateToolTip(r);
        break;
      case 1:
        decorateSWCTextField(r, {
          id: 'venue-info-venue-name',
          quiet: true,
          size: 'xl',
        });
        break;
      case 2:
        decorateSWCTextField(r, {
          id: 'google-place-formatted-address',
          quiet: true,
          size: 'xl',
          readonly: true,
        });
        break;
      case 3:
        buildLocationInputGrid(r);
        break;
      case 4:
        buildAdditionalInfo(r);
        break;
      default:
        break;
    }
  });
}
