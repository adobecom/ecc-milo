import { querySelectorAllDeep } from '../../../utils/utils.js';

function initNewSeriesModal(component) {
  const addSeriesModalBtn = component.querySelector('.add-series-modal-btn');
  const newSeriesModal = component.querySelector('.new-series-modal');
  const modalCtas = newSeriesModal.querySelectorAll('a.con-button');

  addSeriesModalBtn.addEventListener('click', () => {
    newSeriesModal.classList.remove('hidden');
  });

  modalCtas.forEach((cta) => {
    cta.addEventListener('click', () => {
      newSeriesModal.classList.add('hidden');
    });
  });
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
    const allComponents = step.querySelectorAll('.form-component');

    if (Array.from(inputs).every((input) => !!input.value)) {
      allComponents.forEach((c) => {
        if (c !== component) {
          const compInputs = querySelectorAllDeep('input, select, textarea', c);
          compInputs.forEach((input) => {
            input.disabled = false;
          });
        }
      });
    } else {
      allComponents.forEach((c) => {
        if (c !== component) {
          const compInputs = querySelectorAllDeep('input, select, textarea', c);
          compInputs.forEach((input) => {
            input.disabled = true;
          });
        }
      });
    }
  };

  inputs.forEach((input) => {
    input.addEventListener('change', onFormatChange);
  });

  onFormatChange();
}

export default function init(component) {
  initNewSeriesModal(component);
  prepopulateTimeZone(component);
  initStepLock(component);
}

export function onResume(component, eventObj) {
  // TODO: handle form prepopulation on component level
}

export function onSubmit(component) {
  return {};
}
