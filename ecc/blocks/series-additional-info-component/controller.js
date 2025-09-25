/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const susiContextId = component.querySelector('#info-field-series-susi');
  const relatedDomain = component.querySelector('#info-field-series-related-domain');
  const contentRoot = component.querySelector('#info-field-series-content-root');
  const externalThemeId = component.querySelector('#info-field-series-ext-id');

  const seriesInfo = {};

  if (susiContextId.value) seriesInfo.susiContextId = susiContextId.value;
  if (relatedDomain.value) seriesInfo.relatedDomain = relatedDomain.value;
  if (contentRoot?.value) seriesInfo.contentRoot = contentRoot.value;
  if (externalThemeId.value) seriesInfo.externalThemeId = externalThemeId.value;

  props.payload = { ...props.payload, ...seriesInfo };
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
    const susiContextId = component.querySelector('#info-field-series-susi');
    const relatedDomain = component.querySelector('#info-field-series-related-domain');
    const contentRoot = component.querySelector('#info-field-series-content-root');
    const externalThemeId = component.querySelector('#info-field-series-ext-id');

    susiContextId.value = data.susiContextId || '';
    relatedDomain.value = data.relatedDomain || '';
    if (contentRoot) contentRoot.value = data.contentRoot || '';
    externalThemeId.value = data.externalThemeId || '';

    component.classList.add('prefilled');
  }
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
