/* eslint-disable no-unused-vars */
import { getAttribute } from '../../scripts/data-utils.js';
import { changeInputValue } from '../../scripts/utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';

export function onSubmit(component, props) {
  if (!component || !props) return;
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const checkbox = component.querySelector('#checkbox-secondary-url');
  const urlInput = component.querySelector('#secondary-cta-url');
  const labelInput = component.querySelector('#secondary-cta-label');

  if (!checkbox || !urlInput || !labelInput) return;

  let cta = [];

  if (checkbox.checked) {
    const url = urlInput?.value?.trim();
    const label = labelInput?.value?.trim();

    if (!url) return;

    cta = [{ url, label }];
  } else {
    cta = [];
  }

  setPropsPayload(props, { cta });
}

function prefillInputs(component, props) {
  const eventData = props.eventDataResp;

  if (!eventData || !props.locale) return;
  const [
    communityTopicUrl,
    cta,
    cloudType,
  ] = [
    getAttribute(eventData, 'communityTopicUrl', props.locale),
    getAttribute(eventData, 'ctas', props.locale),
    getAttribute(eventData, 'cloudType', props.locale),
  ];

  if (cloudType) {
    component.dataset.cloudType = cloudType;
  }

  const checkbox = component.querySelector('#checkbox-secondary-url');
  const labelInput = component.querySelector('#secondary-cta-label');
  const urlInput = component.querySelector('#secondary-cta-url');

  if (!checkbox || !labelInput || !urlInput) return;

  if (cta && cta.length > 0) {
    const firstAdditionalCta = cta[0];

    changeInputValue(checkbox, 'checked', true);
    changeInputValue(labelInput, 'value', firstAdditionalCta.label);
    changeInputValue(urlInput, 'value', firstAdditionalCta.url);
    component.classList.add('prefilled');
  } else if (communityTopicUrl) {
    changeInputValue(checkbox, 'checked', !!communityTopicUrl);
    changeInputValue(urlInput, 'value', communityTopicUrl);
    component.classList.add('prefilled');
  }
}

function setupCleanup(component, callbacks = {}) {
  const checkbox = component.querySelector('#checkbox-secondary-url');
  const labelInput = component.querySelector('#secondary-cta-label');
  const urlInput = component.querySelector('#secondary-cta-url');

  if (!checkbox || !labelInput || !urlInput) return;

  component.cleanup = () => {
    checkbox.removeEventListener('change', callbacks.updateInputState);
    labelInput.removeEventListener('input', callbacks.handleInputChange);
    urlInput.removeEventListener('input', callbacks.handleInputChange);
    labelInput.removeEventListener('change', callbacks.handleInputChange);
    urlInput.removeEventListener('change', callbacks.handleInputChange);
  };
}

function initializeInputs(component, props) {
  const checkbox = component.querySelector('#checkbox-secondary-url');
  const labelInput = component.querySelector('#secondary-cta-label');
  const urlInput = component.querySelector('#secondary-cta-url');

  if (!checkbox || !labelInput || !urlInput) return;

  const updateInputState = () => {
    labelInput.disabled = !checkbox.checked;
    urlInput.disabled = !checkbox.checked;

    if (!checkbox.checked) {
      labelInput.value = '';
      urlInput.value = '';
    }
  };

  const handleInputChange = () => {
    if (checkbox.checked && !urlInput.value.trim() && !labelInput.value.trim()) {
      changeInputValue(checkbox, 'checked', false);
      updateInputState();
    }
  };

  checkbox.addEventListener('change', updateInputState);
  labelInput.addEventListener('input', updateInputState);
  urlInput.addEventListener('input', updateInputState);
  labelInput.addEventListener('change', handleInputChange);
  urlInput.addEventListener('change', handleInputChange);

  updateInputState();

  setupCleanup(component, {
    updateInputState,
    handleInputChange,
  });
}

export async function onPayloadUpdate(component, props) {
  // Do nothing
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  if (!component || !props) return;

  initializeInputs(component, props);
  prefillInputs(component, props);
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
