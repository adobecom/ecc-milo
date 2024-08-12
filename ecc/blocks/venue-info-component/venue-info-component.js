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
          pattern: '^(?:Alabama|AL|Alaska|AK|Arizona|AZ|Arkansas|AR|California|CA|Colorado|CO|Connecticut|CT|Delaware|DE|Florida|FL|Georgia|GA|Hawaii|HI|Idaho|ID|Illinois|IL|Indiana|IN|Iowa|IA|Kansas|KS|Kentucky|KY|Louisiana|LA|Maine|ME|Maryland|MD|Massachusetts|MA|Michigan|MI|Minnesota|MN|Mississippi|MS|Missouri|MO|Montana|MT|Nevada|NV|New\\s+Hampshire|NH|New\\s+Jersey|NJ|New\\s+Mexico|NM|New\\s+York|NY|North\\s+Carolina|NC|North\\s+Dakota|ND|Ohio|OH|Oklahoma|OK|Oregon|OR|Pennsylvania|PA|Rhode\\s+Island|RI|South\\s+Carolina|SC|South\\s+Dakota|SD|Tennessee|TN|Texas|TX|Utah|UT|Vermont|VT|Virginia|VA|Washington|WA|West\\s+Virginia|WV|Wisconsin|WI|Wyoming|WY|Nebraska|NE)$',
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
          pattern: '^[0-9]{5}(?:-[0-9]{4})?$',
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
          pattern: '^(AF|AX|AL|DZ|AS|AD|AO|AI|AQ|AG|AR|AM|AW|AU|AT|AZ|BS|BH|BD|BB|BY|BE|BZ|BJ|BM|BT|BO|BQ|BA|BW|BV|BR|IO|BN|BG|BF|BI|KH|CM|CA|CV|KY|CF|TD|CL|CN|CX|CC|CO|KM|CG|CD|CK|CR|CI|HR|CU|CW|CY|CZ|DK|DJ|DM|DO|EC|EG|SV|GQ|ER|EE|ET|EU|FK|FO|FJ|FI|FR|GF|PF|TF|GA|GM|GE|DE|GH|GI|GR|GL|GD|GP|GU|GT|GG|GN|GW|GY|HT|HM|VA|HN|HK|HU|IS|IN|ID|IR|IQ|IE|IM|IL|IT|JM|JP|JE|JO|KZ|KE|KI|KP|KR|KW|KG|LA|LV|LB|LS|LR|LY|LI|LT|LU|MO|MK|MG|MW|MY|MV|ML|MT|MH|MQ|MR|MU|YT|MX|FM|MD|MC|MN|ME|MS|MA|MZ|MM|NA|NR|NP|NL|NC|NZ|NI|NE|NG|NU|NF|MP|NO|OM|PK|PW|PS|PA|PG|PY|PE|PH|PN|PL|PT|PR|QA|RE|RO|RU|RW|BL|SH|KN|LC|MF|PM|VC|WS|SM|ST|SA|SN|RS|SC|SL|SG|SX|SK|SI|SB|SO|ZA|GS|SS|ES|LK|SD|SR|SJ|SZ|SE|CH|SY|TW|TJ|TZ|TH|TL|TG|TK|TO|TT|TN|TR|TM|TC|TV|UG|UA|AE|GB|US|UM|UY|UZ|VU|VE|VN|VG|VI|WF|EH|YE|ZM|ZW)$',
        }));
        break;
      default:
        break;
    }
  });
  const stateCodeInput = createTag('input', { id: 'location-state-code', type: 'hidden' });
  const placeIdInput = createTag('input', { id: 'google-place-id', type: 'hidden' });
  const mapUrlInput = createTag('input', { id: 'google-map-url', type: 'hidden' });
  const placeLATInput = createTag('input', { id: 'google-place-lat', type: 'hidden' });
  const placeLNGInput = createTag('input', { id: 'google-place-lng', type: 'hidden' });
  const gmtOffsetInput = createTag('input', { id: 'google-place-gmt-offset', type: 'hidden' });
  locationDetailsWrapper.append(
    stateCodeInput,
    placeIdInput,
    mapUrlInput,
    placeLATInput,
    placeLNGInput,
    gmtOffsetInput,
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
