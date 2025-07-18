/* eslint-disable no-unused-vars */
import { getSeriesForUser } from '../../scripts/esp-controller.js';
import BlockMediator from '../../scripts/deps/block-mediator.min.js';
import { LIBS } from '../../scripts/scripts.js';
import { changeInputValue } from '../../scripts/utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';
import { getAttribute } from '../../scripts/data-utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function filterSeries(series, currentCloud) {
  return Object.values(series).filter((s) => {
    const hasRequiredVals = s.seriesId && s.seriesName;
    const isPublished = s.seriesStatus?.toLowerCase() === 'published';
    const isInCurrentCloud = s.cloudType === currentCloud;
    return hasRequiredVals && isPublished && isInCurrentCloud;
  });
}

async function getTemplates() {
  return fetch('/ecc/system/series-templates.json')
    .then((res) => res.json())
    .then((data) => data.data);
}

function prepopulateTimeZone(component) {
  const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!currentTimeZone) return;

  const timeZoneInput = component.querySelector('#time-zone-select-input');

  if (!timeZoneInput) return;

  const options = timeZoneInput.querySelectorAll('option');

  options.forEach((opt) => {
    if (opt.value === currentTimeZone) {
      options[0].removeAttribute('selected');
      opt.selected = true;
    }
  });
}

function initStepLock(component) {
  const step = component.closest('.fragment');
  const inputs = component.querySelectorAll('#bu-select-input, #series-select-input, #format-select-input');

  const onFormatChange = () => {
    const componentSections = step.querySelectorAll('.section:not(:first-of-type)');
    const topicsComponent = step.querySelector('.event-topics-component');

    const inputsFilled = Array.from(inputs).every((input) => !!input.value);

    componentSections.forEach((s) => {
      if (s !== component.closest('.section')) {
        s.classList.toggle('disabled', !inputsFilled);
      }
      topicsComponent?.classList.toggle('disabled', !inputsFilled);
    });
  };

  inputs.forEach((input) => {
    input.addEventListener('change', onFormatChange);
  });

  onFormatChange();
}

async function populateSeriesOptions(props, component) {
  const currentEventType = props.payload.eventType;
  const seriesSelect = component.querySelector('#series-select-input');
  if (!seriesSelect) return;

  seriesSelect.pending = true;
  seriesSelect.disabled = false;
  changeInputValue(seriesSelect, 'value', null);

  const [series, templates] = await Promise.all([getSeriesForUser(), getTemplates()]);
  if (series.error) {
    seriesSelect.pending = false;
    seriesSelect.disabled = true;
    return;
  }

  const existingOptions = seriesSelect.querySelectorAll('sp-menu-item');
  existingOptions.forEach((opt) => opt.remove());

  const filteredSeries = filterSeries(series, component.dataset.cloudType);
  filteredSeries.forEach((val) => {
    if (!val.seriesId || !val.seriesName) return;
    if (val.seriesStatus?.toLowerCase() !== 'published') return;

    const seriesTemplate = templates.find((t) => t['template-path'] === val.templateId);
    if (!seriesTemplate) return;

    const supportedEventType = seriesTemplate['supported-event-type'];
    if (supportedEventType !== currentEventType) return;

    const opt = createTag('sp-menu-item', { value: val.seriesId }, val.seriesName);
    seriesSelect.append(opt);
  });

  seriesSelect.pending = false;
  seriesSelect.disabled = filteredSeries.length === 0 || props.eventDataResp.seriesId;
}

export async function onPayloadUpdate(component, props) {
  const { cloudType, seriesId } = props.payload;
  if (cloudType && cloudType !== component.dataset.cloudType) {
    component.dataset.cloudType = cloudType;
    await populateSeriesOptions(props, component);
  }

  if (seriesId) {
    const partnerSelectorGroups = document.querySelectorAll('partner-selector-group');
    if (partnerSelectorGroups.length) {
      partnerSelectorGroups.forEach((group) => {
        if (group.seriesId !== seriesId) {
          group.seriesId = seriesId;
          group.requestUpdate();
        }
      });
    }
  }
}

export async function onRespUpdate(component, props) {
  // lock series selector on seriesId given

  if (props.eventDataResp) {
    const { seriesId, cloudType } = props.eventDataResp;

    const seriesSelect = component.querySelector('#series-select-input');
    const buSelect = component.querySelector('#bu-select-input');

    if (seriesSelect && !seriesSelect.disabled) seriesSelect.disabled = !!seriesId;
    if (buSelect && !buSelect.disbaled) buSelect.disabled = !!cloudType;
  }
}

function initCloudTypeSelect(props, component) {
  const cloudTypeSelect = component.querySelector('#bu-select-input');
  if (!cloudTypeSelect) return;

  cloudTypeSelect.addEventListener('change', async () => {
    props.payload = { ...props.payload, cloudType: cloudTypeSelect.value };
  });
}

async function initDupCheck(props, component) {
  const currentCloudType = component.dataset.cloudType;
  const seriesSelect = component.querySelector('#series-select-input');

  const series = await getSeriesForUser();

  if (!series) {
    seriesSelect.pending = false;
    seriesSelect.disabled = true;
    return;
  }

  const filteredSeries = filterSeries(series, currentCloudType);

  filteredSeries.forEach((val) => {
    if (!val.seriesId || !val.seriesName) return;
    if (val.seriesStatus?.toLowerCase() !== 'published') return;

    const opt = createTag('sp-menu-item', { value: val.seriesId }, val.seriesName);
    seriesSelect.append(opt);
  });

  seriesSelect.pending = false;
  seriesSelect.disabled = filteredSeries.length === 0 || props.eventDataResp.seriesId;

  seriesSelect.addEventListener('change', () => {
    props.payload = { ...props.payload, seriesId: seriesSelect.value };

    const seriesId = seriesSelect.value;
    const selectedSeries = seriesSelect.querySelector(`[value="${seriesId}"]`);

    if (!selectedSeries) return;

    const seriesName = selectedSeries.textContent;

    BlockMediator.set('eventDupMetrics', {
      ...BlockMediator.get('eventDupMetrics'),
      ...{
        seriesId,
        seriesName,
      },
    });
  });
}

export default async function init(component, props) {
  const eventData = props.eventDataResp;
  const [
    cloudType,
    seriesId,
  ] = [
    getAttribute(eventData, 'cloudType', props.locale),
    getAttribute(eventData, 'seriesId', props.locale),
  ];

  component.dataset.cloudType = cloudType;
  initCloudTypeSelect(props, component);
  prepopulateTimeZone(component);
  await initDupCheck(props, component);
  initStepLock(component);

  const cloudTypeSelect = component.querySelector('#bu-select-input');
  const seriesSelect = component.querySelector('#series-select-input');

  if (cloudType && seriesId) {
    changeInputValue(cloudTypeSelect, 'value', cloudType);
    changeInputValue(seriesSelect, 'value', seriesId);
    component.classList.add('prefilled');
  }
}

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const cloudType = component.querySelector('#bu-select-input').value;
  const seriesId = component.querySelector('#series-select-input')?.value;

  const eventFormat = {
    cloudType,
    seriesId,
  };

  setPropsPayload(props, eventFormat);
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
