/* eslint-disable no-unused-vars */
import { getSeriesForUser } from '../../scripts/esp-controller.js';
import BlockMediator from '../../scripts/deps/block-mediator.min.js';
import { LIBS } from '../../scripts/scripts.js';
import { changeInputValue } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

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
  const inputs = component.querySelectorAll('#bu-select-input, #series-select-input');

  const onFormatChange = () => {
    const componentSections = step.querySelectorAll('.section:not(:first-of-type)');

    if (Array.from(inputs).every((input) => !!input.value)) {
      componentSections.forEach((s) => {
        if (s !== component.closest('.section')) {
          s.classList.remove('hidden');
        }
      });
    } else {
      componentSections.forEach((s) => {
        if (s !== component.closest('.section')) {
          s.classList.add('hidden');
        }
      });
    }
  };

  inputs.forEach((input) => {
    input.addEventListener('change', onFormatChange);
  });

  onFormatChange();
}

async function populateSeriesOptions(props, component, cloud = null) {
  const seriesSelect = component.querySelector('#series-select-input');
  if (!seriesSelect) return;

  const series = await getSeriesForUser();

  if (!series) {
    seriesSelect.pending = false;
    seriesSelect.disabled = true;
    return;
  }

  const filteredSeries = Object.values(series).filter((s) => {
    const hasRequiredVals = s.seriesId && s.seriesName;
    const isPublished = s.seriesStatus?.toLowerCase() === 'published';

    const currentCloud = cloud || props.eventDataResp.cloudType || props.payload.cloudType;
    const isInCurrentCloud = s.cloudType === currentCloud;

    return hasRequiredVals && isPublished && isInCurrentCloud;
  });

  console.log('filteredSeries', filteredSeries);
  filteredSeries.forEach((val) => {
    if (!val.seriesId || !val.seriesName) return;
    if (val.seriesStatus?.toLowerCase() !== 'published') return;

    const opt = createTag('sp-menu-item', { value: val.seriesId }, val.seriesName);
    seriesSelect.append(opt);
  });

  seriesSelect.pending = false;
  seriesSelect.disabled = filteredSeries.length === 0;
}

export async function onPayloadUpdate(component, props) {
  const { cloudType, seriesId } = props.payload;
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

export default async function init(component, props) {
  const buSelect = component.querySelector('#bu-select-input');
  const seriesSelect = component.querySelector('#series-select-input');

  const eventData = props.eventDataResp;
  prepopulateTimeZone(component);
  initStepLock(component);
  await populateSeriesOptions(props, component);

  seriesSelect.addEventListener('change', () => {
    const seriesId = seriesSelect.value;
    const seriesName = seriesSelect.querySelector(`[value="${seriesId}"]`).textContent;

    BlockMediator.set('eventDupMetrics', {
      ...BlockMediator.get('eventDupMetrics'),
      ...{
        seriesId,
        seriesName,
      },
    });
  });

  const {
    cloudType,
    seriesId,
  } = eventData;

  if (cloudType && seriesId) {
    changeInputValue(buSelect, 'value', cloudType);
    changeInputValue(seriesSelect, 'value', seriesId);
    component.classList.add('prefilled');
  }

  buSelect.addEventListener('change', () => {
    const cloudTypeVal = buSelect.value;

    if (cloudTypeVal) {
      seriesSelect.pending = true;
      seriesSelect.innerHTML = '';
      populateSeriesOptions(props, component, cloudTypeVal);
    }
  });
}

function getTemplateId(bu) {
  switch (bu) {
    case 'DX':
      return '/events/fragments/event-templates/dx/simple';
    case 'CreativeCloud':
    default:
      return '/events/fragments/event-templates/dme/simple';
  }
}

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const eventType = 'InPerson';
  const cloudType = component.querySelector('#bu-select-input').value;
  const seriesId = component.querySelector('#series-select-input')?.value;
  const templateId = getTemplateId(cloudType);

  const eventFormat = {
    eventType,
    cloudType,
    seriesId,
    templateId,
  };

  props.payload = { ...props.payload, ...eventFormat };
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
