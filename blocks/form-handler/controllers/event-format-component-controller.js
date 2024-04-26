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

export default function init(component) {
  initNewSeriesModal(component);
  return component;
}

export function onSubmit(component) {
  console.log(component);
  return {};
}
