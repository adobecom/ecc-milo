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
  const options = timeZoneInput.querySelectorAll('option');

  options.forEach((opt) => {
    if (opt.value === currentTimeZone) {
      options[0].removeAttribute('selected');
      opt.selected = true;
    }
  });
}

export default function init(component) {
  initNewSeriesModal(component);
  prepopulateTimeZone(component);
}

export function onSubmit(component, inputMap) {
  console.log(inputMap);
  return {};
}
