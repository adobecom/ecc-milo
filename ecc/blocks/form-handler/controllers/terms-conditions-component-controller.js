/* eslint-disable no-unused-vars */
import { LIBS } from '../../../scripts/scripts.js';
import HtmlSanitizer from '../../../scripts/deps/html-sanitizer.js';
import { fetchThrottledMemoizedText } from '../../../scripts/utils.js';

const { customFetch } = await import(`${LIBS}/utils/helpers.js`);
const { createTag } = await import(`${LIBS}/utils/utils.js`);

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

async function loadPreview(component, templateId) {
  const rsvpFormLocation = `https://main--events-milo--adobecom.hlx.page${templateId.substring(0, templateId.lastIndexOf('/'))}/rsvp-form`;
  const resp = await fetchThrottledMemoizedText(`${rsvpFormLocation}.plain.html`, { headers: { authorization: 'token MM/NpTtq0gAnckOSl96C4SGB67kFjbO6a4N9vYwb0gd5' } }).catch(() => ({}))
    .catch(() => ({}));

  if (!resp?.ok) {
    component.remove();
    return;
  }

  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const termsConditionsRow = doc.querySelector('.events-form > div:nth-of-type(3)');

  component.append(buildTerms(termsConditionsRow));
}

export async function onUpdate(component, props) {
  const { templateId } = props.payload;
  if (!templateId) return;
  await loadPreview(component, templateId);
}

export default async function init(component, props) {
  const { templateId } = props.payload;
  if (!templateId) return;
  await loadPreview(component, templateId);
}

export function onSubmit(_component, _props) {
  // Do nothing
}
