import { getClouds } from '../../scripts/esp-controller.js';
import { getUser, userHasAccessToBU } from '../../scripts/profile.js';
import { LIBS } from '../../scripts/scripts.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const cloudType = component.querySelector('#bu-select-input');
  const targetCms = component.querySelector('#targetcms-select-input');
  const seriesName = component.querySelector('#info-field-series-name');
  const seriesDescription = component.querySelector('#info-field-series-description');

  const seriesInfo = {};

  if (cloudType.value) seriesInfo.cloudType = cloudType.value;
  if (targetCms?.value) {
    const code = targetCms.value;
    const [prefix, ...rest] = code.split('-');
    const instance = rest.join('-');
    const providerMap = { sp: 'sharepoint', da: 'documentAuthoring' };
    const provider = providerMap[prefix] || prefix;
    seriesInfo.targetCms = { provider, instance, code };
  }
  if (seriesName.value) seriesInfo.seriesName = seriesName.value.trim();
  if (seriesDescription.value) seriesInfo.seriesDescription = seriesDescription.value.trim();

  props.payload = { ...props.payload, ...seriesInfo };
}

export async function onPayloadUpdate(_component, _props) {
  // Do nothing
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default async function init(component, props) {
  const cloudTypeEl = component.querySelector('#bu-select-input');
  const targetCmsEl = component.querySelector('#targetcms-select-input');
  const seriesNameEl = component.querySelector('#info-field-series-name');
  const seriesDescriptionEl = component.querySelector('#info-field-series-description');

  const user = await getUser();
  const clouds = await getClouds(user);

  const filteredClouds = clouds.filter(({ cloudType }) => (
    userHasAccessToBU(user, cloudType)
  ));
  filteredClouds.forEach(({ cloudType, cloudName }) => {
    const opt = createTag('sp-menu-item', { value: cloudType }, cloudName);
    cloudTypeEl.append(opt);
  });

  if (cloudTypeEl) cloudTypeEl.removeAttribute('pending');

  // Populate Target CMS picker from clouds list
  if (targetCmsEl) {
    const cmsValues = filteredClouds
      .map(({ targetCms }) => targetCms)
      .filter(Boolean);
    const uniqueCms = Array.from(new Set(cmsValues));
    uniqueCms.forEach((cms) => {
      const opt = createTag('sp-menu-item', { value: cms }, cms);
      targetCmsEl.append(opt);
    });
    targetCmsEl.removeAttribute('pending');
  }

  const data = props.response;

  if (data) {
    const {
      cloudType,
      targetCms,
      seriesName,
      seriesDescription,
    } = data;

    if (cloudType) {
      cloudTypeEl.value = cloudType;
      cloudTypeEl.disabled = true;
      if (targetCmsEl) targetCmsEl.disabled = true;
    }
    if (targetCms && targetCmsEl) {
      const code = typeof targetCms === 'object' ? targetCms.code : targetCms;
      targetCmsEl.value = code || '';
    }
    if (seriesName) seriesNameEl.value = seriesName;
    if (seriesDescription) seriesDescriptionEl.value = seriesDescription;

    component.classList.add('prefilled');
  }
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
