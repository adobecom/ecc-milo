import { getLibs } from '../../scripts/utils.js';
import { generateToolTip } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

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

  const additionComment = createTag('div', { class: 'addition-comment' });
  additionComment.append(comment.textContent.trim());
  row.innerHTML = '';
  fieldSet.append(additionComment);
  row.append(fieldSet);
  row.classList.add('venue-info-addition-wrapper');
}

function buildLocationInputGrid(row) {
  const subs = row.querySelectorAll('li');
  const locationDetailsWrapper = createTag('div', { class: 'location-wrapper' });

  subs.forEach((sub, i) => {
    const placeholder = sub.textContent.trim();
    switch (i) {
      case 0:
        locationDetailsWrapper.append(createTag('sp-textfield', {
          id: 'location-city',
          class: 'location-input venue-info-text text-input',
          placeholder,
          required: true,
          type: 'text',
          quiet: true,
          size: 'l',
        }));
        break;
      case 1:
        locationDetailsWrapper.append(createTag('sp-textfield', {
          id: 'location-state',
          class: 'location-input venue-info-text text-input',
          placeholder,
          required: true,
          type: 'text',
          quiet: true,
          size: 'l',
        }));
        break;
      case 2:
        locationDetailsWrapper.append(createTag('sp-textfield', {
          id: 'location-zip-code',
          class: 'location-input venue-info-text text-input',
          placeholder,
          required: true,
          type: 'text',
          quiet: true,
          size: 'l',
        }));
        break;
      case 3:
        locationDetailsWrapper.append(createTag('sp-textfield', {
          id: 'location-country',
          class: 'location-input venue-info-text text-input',
          placeholder,
          required: true,
          type: 'text',
          quiet: true,
          size: 'l',
        }));
        break;
      default:
        break;
    }
  });
  const placeIdInput = createTag('input', { id: 'google-place-id', type: 'hidden' });
  const placeLATInput = createTag('input', { id: 'google-place-lat', type: 'hidden' });
  const placeLNGInput = createTag('input', { id: 'google-place-lng', type: 'hidden' });
  const gmtOffsetInput = createTag('input', { id: 'google-place-gmt-offset', type: 'hidden' });
  locationDetailsWrapper.append(placeIdInput, placeLATInput, placeLNGInput, gmtOffsetInput);

  row.innerHTML = '';
  row.append(locationDetailsWrapper);
  row.classList.add('venue-info-field-location');
}

export default function init(el) {
  el.classList.add('form-component');
  generateToolTip(el);
  const miloLibs = getLibs();
  Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/textfield.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/checkbox.js`),
  ]);

  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    switch (i) {
      case 1:
        decorateSWCTextField(r, {
          id: 'venue-info-venue-name',
          quiet: true,
          size: 'xl',
        });
        break;
      case 2:
        decorateSWCTextField(r, {
          id: 'venue-info-venue-address',
          quiet: true,
          size: 'xl',
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
