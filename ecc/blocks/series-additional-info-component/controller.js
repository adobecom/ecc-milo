import { getAttribute } from '../../scripts/data-utils.js';
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

  if (data) {
    const [
      susiContextId,
      relatedDomain,
      externalThemeId,
    ] = [
      getAttribute(data, 'susiContextId', props.locale),
      getAttribute(data, 'relatedDomain', props.locale),
      getAttribute(data, 'externalThemeId', props.locale),
    ];

    susiContextId.value = susiContextId || '';
    relatedDomain.value = relatedDomain || '';
    externalThemeId.value = externalThemeId || '';

    component.classList.add('prefilled');
  }
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
