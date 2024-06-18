import { getLibs } from '../../../scripts/utils.js';
import HtmlSanitizer from '../../../deps/html-sanitizer.js';

const { customFetch } = await import(`${getLibs()}/utils/helpers.js`);
const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function buildTerms(terms) {
  const termsWrapper = createTag('div', { class: 'terms-conditions-preview' });
  const termsTexts = terms.querySelectorAll('p');
  const lis = terms.querySelectorAll('li');
  const checkboxes = [];

  termsTexts.forEach((t) => {
    termsWrapper.append(t);
  });

  lis.forEach((li, i) => {
    const checkboxWrapper = createTag('div', { class: 'checkbox-wrapper' });
    const checkbox = createTag('input', { type: 'checkbox', class: 'checkbox', 'data-field-id': `terms-and-condition-check-${i + 1}`, disabled: true });
    const label = createTag('label', { class: 'checkbox-label', for: 'terms-and-conditions' }, HtmlSanitizer.SanitizeHtml(li.innerHTML));

    checkboxWrapper.append(checkbox, label);
    termsWrapper.append(checkboxWrapper);
    checkboxes.push(checkbox);
  });

  return termsWrapper;
}

async function loadPreview(component, props) {
  const { templateId } = props.payload;
  if (!templateId) return;

  const rsvpFormLocation = `https://main--events-milo--adobecom.hlx.page${templateId.substring(0, templateId.lastIndexOf('/'))}/rsvp-form`;
  const resp = await customFetch({ resource: `${rsvpFormLocation}.plain.html`, withCacheRules: true })
    .catch(() => ({}));

  if (!resp?.ok) {
    window.lana?.log(`Could not get fragment: ${rsvpFormLocation}.plain.html`);
    return;
  }

  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const termsConditionsRow = doc.querySelector('.events-form > div:nth-of-type(3)');

  component.append(buildTerms(termsConditionsRow));
}

export default async function init(component, props) {
  await loadPreview(component, props);
}

export function onSubmit(component, props) {
  // Do nothing
}
