import { changeInputValue } from '../../../utils/utils.js';
import getJoinedData from '../data-handler.js';

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
  const { search } = window.location;
  const urlParams = new URLSearchParams(search);
  const skipValidation = urlParams.get('skipValidation');

  if (skipValidation === 'true' && ['stage', 'local'].includes(window.miloConfig.env.name)) {
    return;
  }

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

export default function init(component, props) {
  const eventData = getJoinedData();
  prepopulateTimeZone(component);
  initStepLock(component);

  const {
    cloudType,
    seriesId,
    rsvpRequired,
  } = eventData;

  changeInputValue(component.querySelector('#bu-select-input'), 'value', cloudType || '');
  changeInputValue(component.querySelector('#series-select-input'), 'value', seriesId || '');
  changeInputValue(component.querySelector('#rsvp-required-check'), 'checked', rsvpRequired || 0);
}

function getTemplateId(bu) {
  switch (bu) {
    case 'DX':
      return '/fragments/event-templates/dx/simple';
    case 'CreativeCloud':
    default:
      return '/fragments/event-templates/dme/simple';
  }
}

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const eventType = 'InPerson';
  const cloudType = component.querySelector('#bu-select-input').value;
  const seriesId = component.querySelector('#series-select-input')?.value;
  const rsvpRequired = component.querySelector('#rsvp-required-check').checked;
  const templateId = getTemplateId(cloudType);

  const eventFormat = {
    // TODO: add the other text field values
    eventType,
    cloudType,
    seriesId,
    rsvpRequired,
    templateId,
  };

  props.payload = { ...props.payload, ...eventFormat };
}
