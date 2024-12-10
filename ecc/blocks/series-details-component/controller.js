/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const cloudType = component.querySelector('#bu-select-input');
  const seriesName = component.querySelector('#info-field-series-name');
  const seriesDescription = component.querySelector('#info-field-series-description');

  const seriesInfo = {};

  if (cloudType.value) seriesInfo.cloudType = cloudType.value;
  if (seriesName.value) seriesInfo.seriesName = seriesName.value;
  if (seriesDescription.value) seriesInfo.seriesDescription = seriesDescription.value;

  props.payload = { ...props.payload, ...seriesInfo };
}

export async function onPayloadUpdate(_component, _props) {
  // Do nothing
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  const data = props.resp;

  if (data) {
    const cloudType = component.querySelector('#bu-select-input');
    const seriesName = component.querySelector('#info-field-series-name');
    const seriesDescription = component.querySelector('#info-field-series-description');

    cloudType.value = data.cloudType;
    seriesName.value = data.seriesName;
    seriesDescription.value = data.seriesDescription;

    component.classList.add('prefilled');
  }
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
