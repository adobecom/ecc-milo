/* eslint-disable no-unused-vars */
import { MILO_CONFIG, LIBS } from '../../../scripts/scripts.js';
import { changeInputValue } from '../../../scripts/utils.js';

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
  const { search } = window.location;
  const urlParams = new URLSearchParams(search);
  const skipValidation = urlParams.get('skipValidation');

  if (skipValidation === 'true' && ['stage', 'local'].includes(MILO_CONFIG.env.name)) {
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

export async function onUpdate(component, props) {
  const { seriesId } = props.payload;
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

export default function init(component, props) {
  const eventData = props.eventDataResp;
  prepopulateTimeZone(component);
  initStepLock(component);

  const {
    cloudType,
    seriesId,
    rsvpRequired,
  } = eventData;

  if (cloudType && seriesId) {
    changeInputValue(component.querySelector('#bu-select-input'), 'value', cloudType);
    changeInputValue(component.querySelector('#series-select-input'), 'value', seriesId);
    changeInputValue(component.querySelector('#rsvp-required-check'), 'checked', rsvpRequired || 0);
    component.classList.add('prefilled');
  }

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
