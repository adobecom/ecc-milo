/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const susiContextId = component.querySelector('#info-field-series-susi');
  const relatedDomain = component.querySelector('#info-field-series-related-domain');
  const contentRoot = component.querySelector('#info-field-series-content-root');
  const externalThemeId = component.querySelector('#info-field-series-ext-id');

  const prevPayload = props.payload || {};
  const prevResponse = props.response || {};
  const nextPayload = { ...prevPayload };
  const removeData = [];

  const markForRemoval = (key) => {
    delete nextPayload[key];
    removeData.push({ key, path: '' });
  };

  const assignField = (key, input) => {
    if (!input) return;

    const rawValue = typeof input.value === 'string' ? input.value.trim() : input.value;
    const hasValue = rawValue !== undefined && rawValue !== null && rawValue !== '';
    const prevValue = prevPayload?.[key] ?? prevResponse?.[key];
    const hadValue = prevValue !== undefined && prevValue !== null && prevValue !== '';

    if (hasValue) {
      nextPayload[key] = rawValue;
    } else if (hadValue) {
      markForRemoval(key);
    } else {
      delete nextPayload[key];
    }
  };

  assignField('susiContextId', susiContextId);
  assignField('relatedDomain', relatedDomain);
  assignField('contentRoot', contentRoot);
  assignField('externalThemeId', externalThemeId);

  props.payload = nextPayload;
  props.deleteList = removeData;
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
