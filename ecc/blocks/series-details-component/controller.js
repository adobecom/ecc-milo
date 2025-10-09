import { getClouds } from '../../scripts/esp-controller.js';
import { getUser, userHasAccessToBU } from '../../scripts/profile.js';
import { LIBS } from '../../scripts/scripts.js';
import { TARGET_CMS_ENDPOINT } from '../../scripts/constants.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);
let targetCmsMapCache = null;

function toTrimmedString(value) {
  return value == null ? '' : String(value).trim();
}

function normalizeTargetCmsRow(row) {
  if (!row || typeof row !== 'object') return null;

  const code = toTrimmedString(row.Code ?? row.code ?? row.CODE);
  if (!code) return null;

  const provider = toTrimmedString(row.Provider ?? row.provider ?? row.PROVIDER);
  const instance = toTrimmedString(row.Instance ?? row.instance ?? row.INSTANCE);
  const labelSource = toTrimmedString(row.Label ?? row.label ?? row.LABEL);
  const label = labelSource || `${code}${instance ? ` - ${instance}` : ''}`;

  return {
    code,
    provider,
    instance,
    label,
  };
}

async function loadTargetCmsMap() {
  if (targetCmsMapCache) return targetCmsMapCache;

  const map = new Map();

  try {
    const resp = await fetch(TARGET_CMS_ENDPOINT);
    if (!resp.ok) {
      throw new Error(`Failed to fetch Target CMS map: ${resp.status}`);
    }

    const json = await resp.json();
    const rows = Array.isArray(json?.data) ? json.data : [];

    rows.forEach((row) => {
      const entry = normalizeTargetCmsRow(row);
      if (entry?.code) {
        map.set(entry.code, entry);
      }
    });
  } catch (error) {
    window.lana?.log?.(`Unable to load Target CMS map:\n${JSON.stringify(error)}`);
  }

  targetCmsMapCache = map;
  return targetCmsMapCache;
}

function getTargetCmsEntry(code) {
  return targetCmsMapCache ? targetCmsMapCache.get(code) : null;
}

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
    const entry = getTargetCmsEntry(targetCms.value);
    if (entry) {
      seriesInfo.targetCms = {
        code: entry.code,
        provider: entry.provider,
        instance: entry.instance,
      };
    } else {
      seriesInfo.targetCms = { code: targetCms.value };
    }
  }
  if (seriesName.value) seriesInfo.seriesName = seriesName.value.trim();
  if (seriesDescription.value) seriesInfo.seriesDescription = seriesDescription.value.trim();

  props.payload = { ...props.payload, ...seriesInfo };
}

export async function onPayloadUpdate(_component, _props) {
  // Do nothing
}

export async function onRespUpdate(component, props) {
  const { response } = props;
  if (!response) return;
  const cloudTypeEl = component.querySelector('#bu-select-input');
  const targetCmsEl = component.querySelector('#targetcms-select-input');
  const seriesNameEl = component.querySelector('#info-field-series-name');
  const seriesDescriptionEl = component.querySelector('#info-field-series-description');

  const setPickerValueWhenReady = (pickerEl, value, disable) => {
    if (!pickerEl) return;
    const apply = () => {
      pickerEl.value = value || '';
      pickerEl.disabled = Boolean(disable);
    };

    if (!value) {
      apply();
      return;
    }

    const hasOption = !!pickerEl.querySelector(`sp-menu-item[value="${value}"]`);
    const isPending = pickerEl.hasAttribute('pending');
    if (!isPending && hasOption) {
      apply();
      return;
    }

    const observer = new MutationObserver(() => {
      const ready = !pickerEl.hasAttribute('pending')
        && !!pickerEl.querySelector(`sp-menu-item[value="${value}"]`);
      if (ready) {
        observer.disconnect();
        apply();
      }
    });
    observer.observe(pickerEl, { attributes: true, childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 3000);
  };

  setPickerValueWhenReady(cloudTypeEl, response?.cloudType, response?.seriesId);

  if (targetCmsEl) {
    const targetCms = response?.targetCms;
    const code = typeof targetCms === 'object' ? targetCms?.code : targetCms;
    setPickerValueWhenReady(targetCmsEl, code || '', response?.seriesId);
    if (code) {
      const entry = getTargetCmsEntry(code);
      if (!entry && typeof targetCms === 'object') {
        targetCmsMapCache = targetCmsMapCache || new Map();
        targetCmsMapCache.set(code, {
          code,
          provider: targetCms?.provider,
          instance: targetCms?.instance,
          label: targetCms?.label || code,
        });
      }
    }
  }

  if (seriesNameEl) seriesNameEl.value = response?.seriesName || '';
  if (seriesDescriptionEl) seriesDescriptionEl.value = response?.seriesDescription || '';

  component.classList.toggle('prefilled', Boolean(response));
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

  if (targetCmsEl) {
    targetCmsEl.setAttribute('pending', true);

    const map = await loadTargetCmsMap();

    const entries = Array.from(map.values())
      .filter(({ code }) => Boolean(code))
      .sort((a, b) => a.code.localeCompare(b.code));

    entries.forEach(({ code }) => {
      const opt = createTag('sp-menu-item', { value: code }, code);
      targetCmsEl.append(opt);
    });

    targetCmsEl.removeAttribute('pending');
  }
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
