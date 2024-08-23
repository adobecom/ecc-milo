/* eslint-disable no-unused-vars */
import { ECC_ENV, LIBS } from '../../../scripts/scripts.js';
import HtmlSanitizer from '../../../scripts/deps/html-sanitizer.js';
import { fetchThrottledMemoizedText, getEventPageHost } from '../../../scripts/utils.js';
import { getFilteredCachedResponse } from '../data-handler.js';

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
  const existingPreview = component.querySelector('.terms-conditions-preview');

  if (existingPreview) return;

  let host;
  if (window.location.href.includes('.hlx.')) {
    host = window.location.origin.replace(window.location.hostname, `${ECC_ENV}--events-milo--adobecom.hlx.page`);
  } else {
    host = window.location.origin;
  }

  const rsvpFormLocation = `${host}${templateId.substring(0, templateId.lastIndexOf('/'))}/rsvp-form`;
  const resp = await fetchThrottledMemoizedText(`${rsvpFormLocation}.plain.html`);

  if (!resp) {
    component.remove();
    return;
  }

  if (typeof resp === 'string') {
    const doc = new DOMParser().parseFromString(resp, 'text/html');
    const termsConditionsRow = doc.querySelector('.events-form > div:nth-of-type(3)');

    if (!termsConditionsRow) {
      component.remove();
      return;
    }

    component.append(buildTerms(termsConditionsRow));
  }
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
