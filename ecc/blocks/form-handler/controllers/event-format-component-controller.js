/* eslint-disable no-unused-vars */
import { getSeries } from '../../../scripts/esp-controller.js';
import BlockMediator from '../../../scripts/deps/block-mediator.min.js';
import { LIBS } from '../../../scripts/scripts.js';
import { changeInputValue } from '../../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

// FIXME: mocking with complete list
function filterSeriesBasedOnCloudType(series, cloudType) {
  if (!cloudType) return [];
  // return Object.values(series).filter((s) => s.cloudType === cloudType);
  return Object.values(series);
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
  const inputs = component.querySelectorAll('#bu-select-input, #series-select-input');

  const onFormatChange = () => {
    const componentSections = step.querySelectorAll('.section:not(:first-of-type)');
    const topicsComponent = step.querySelector('.event-topics-component');

    const inputsFilled = Array.from(inputs).every((input) => !!input.value);

    componentSections.forEach((s) => {
      if (s !== component.closest('.section')) {
        s.classList.toggle('hidden', !inputsFilled);
      }
      topicsComponent.classList.toggle('hidden', !inputsFilled);
    });
  };

  inputs.forEach((input) => {
    input.addEventListener('change', onFormatChange);
  });

  onFormatChange();
}

export async function onPayloadUpdate(component, props) {
  const { seriesId, cloudType } = props.payload;
  if (cloudType && cloudType !== component.dataset.cloudType) {
    const series = await getSeries();
    const filteredSeries = filterSeriesBasedOnCloudType(series, cloudType);
    const seriesSelect = component.querySelector('#series-select-input');

    if (seriesSelect) {
      const seriesOptions = seriesSelect.querySelectorAll('sp-menu-item');
      Array.from(seriesOptions).forEach((opt) => {
        if (!filteredSeries.find((s) => s.seriesId === opt.value)) {
          opt.remove();
        }
      });

      filteredSeries.forEach((s) => {
        const seriesOption = Array.from(seriesOptions).find((opt) => opt.value === s.seriesId);
        if (!seriesOption) {
          const opt = createTag('sp-menu-item', { value: s.seriesId }, s.seriesName);
          seriesSelect.append(opt);
        }
      });
    }

    const formatSelect = component.querySelector('.format-picker-wrapper');

    formatSelect.classList.toggle('hidden', cloudType !== 'DX');
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

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

async function populateSeriesOptions(props, component) {
  const seriesSelect = component.querySelector('#series-select-input');
  if (!seriesSelect) return;

  const series = await getSeries();
  if (!series) {
    seriesSelect.pending = false;
    seriesSelect.disabled = true;
    return;
  }

  const filteredSeries = filterSeriesBasedOnCloudType(series, props.payload.cloudType);

  filteredSeries.forEach((s) => {
    const opt = createTag('sp-menu-item', { value: s.seriesId }, s.seriesName);
    seriesSelect.append(opt);
  });

  seriesSelect.pending = false;

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
}

function initCloudTypeSelect(props, component) {
  const cloudTypeSelect = component.querySelector('#bu-select-input');
  if (!cloudTypeSelect) return;

  cloudTypeSelect.addEventListener('change', async () => {
    props.payload = { ...props.payload, cloudType: cloudTypeSelect.value };
  });
}

export default async function init(component, props) {
  component.dataset.cloudType = props.payload.cloudType;
  setTimeout(() => {
    const seriesSelect = component.querySelector('#series-select-input');

    if (seriesSelect.pending || seriesSelect.disabled) {
      const toastArea = props.el.querySelector('.toast-area');
      if (!toastArea) return;

      const toast = createTag('sp-toast', { open: true, timeout: 8000 }, 'Series ID is taking longer than usual to load. Please check if the Adobe corp. VPN is connected.', { parent: toastArea });
      toast.addEventListener('close', () => {
        toast.remove();
      });
    }
  }, 5000);

  const eventData = props.eventDataResp;
  prepopulateTimeZone(component);
  initStepLock(component);
  await populateSeriesOptions(props, component);
  initCloudTypeSelect(props, component);

  const {
    cloudType,
    seriesId,
  } = eventData;

  if (cloudType && seriesId) {
    changeInputValue(component.querySelector('#bu-select-input'), 'value', cloudType);
    changeInputValue(component.querySelector('#series-select-input'), 'value', seriesId);
    component.classList.add('prefilled');
  }
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
  const format = component.querySelector('#format-select-input')?.value;
  const templateId = getTemplateId(cloudType);

  const eventFormat = {
    eventType,
    cloudType,
    seriesId,
    templateId,
  };

  if (cloudType === 'DX') {
    eventFormat.format = format;
  } else {
    delete eventFormat.format;
  }

  props.payload = { ...props.payload, ...eventFormat };
}

export function onEventUpdate(component, props) {
  // Do nothing
}
