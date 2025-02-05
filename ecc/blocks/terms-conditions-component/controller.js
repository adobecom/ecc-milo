/* eslint-disable no-unused-vars */
import { LIBS } from '../../scripts/scripts.js';
import HtmlSanitizer from '../../scripts/deps/html-sanitizer.js';
import { fetchThrottledMemoizedText, getEventServiceEnv } from '../../scripts/utils.js';

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
  if (window.location.hostname.includes('.hlx.') || window.location.hostname.includes('.aem.')) {
    host = window.location.origin.replace(window.location.hostname, `${getEventServiceEnv()}--events-milo--adobecom.aem.page`);
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

export async function onPayloadUpdate(component, props) {
  const { templateId } = props.payload;
  if (!templateId) return;
  await loadPreview(component, templateId);
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default async function init(component, props) {
  const { templateId } = props.payload;
  if (!templateId) return;
  await loadPreview(component, templateId);
}

export function onSubmit(_component, _props) {
  // Do nothing
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
