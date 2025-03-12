import { setPropsPayload } from '../form-handler/data-handler.js';

/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const susiContextId = component.querySelector('#info-field-series-susi');
  const relatedDomain = component.querySelector('#info-field-series-related-domain');
  const externalThemeId = component.querySelector('#info-field-series-ext-id');

  const seriesInfo = {};

  if (susiContextId.value) seriesInfo.susiContextId = susiContextId.value;
  if (relatedDomain.value) seriesInfo.relatedDomain = relatedDomain.value;
  if (externalThemeId.value) seriesInfo.externalThemeId = externalThemeId.value;

  setPropsPayload(props, seriesInfo);
}

export async function onPayloadUpdate(_component, _props) {
  // Do nothing
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  const data = props.response;
  const localeData = data?.localizations?.[props.lang] || data;

  if (data) {
    const susiContextId = component.querySelector('#info-field-series-susi');
    const relatedDomain = component.querySelector('#info-field-series-related-domain');
    const externalThemeId = component.querySelector('#info-field-series-ext-id');

    susiContextId.value = localeData.susiContextId || '';
    relatedDomain.value = localeData.relatedDomain || '';
    externalThemeId.value = localeData.externalThemeId || '';

    component.classList.add('prefilled');
  }
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
