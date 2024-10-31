import { createSeries, getAllSeries } from '../../scripts/esp-controller.js';
import { LIBS } from '../../scripts/scripts.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function buildSeriesInfoWrapper(props) {
  const seriesInfoContainer = createTag('div', { class: 'series-info-container' });
  props.el.append(seriesInfoContainer);
}

function listAllSeries(props) {
  const seriesInfoContainer = props.el.querySelector('.series-info-container');
  if (!seriesInfoContainer) return;
  seriesInfoContainer.innerHTML = '';

  props.data.forEach((series) => {
    const seriesInfoWrapper = createTag('div', { class: 'series-info-wrapper' });

    Object.keys(series).forEach((key) => {
      const seriesInfo = createTag('div', { class: 'series-info' });
      seriesInfo.textContent = `${key}: ${series[key]}`;
      seriesInfoWrapper.append(seriesInfo);
    });

    seriesInfoContainer.append(seriesInfoWrapper, createTag('br'));
  });
}

function buildNewSeriesForm(props) {
  const newSeriesNameInput = createTag('input', { class: 'new-series-name-input', placeholder: 'Enter new series name' }, '', { parent: props.el });
  const createNewSeriesBtn = createTag('button', { class: 'con-button blue create-new-series-btn' }, 'Create New Series', { parent: props.el });

  createNewSeriesBtn.addEventListener('click', async () => {
    const newSeriesName = newSeriesNameInput.value;
    if (!newSeriesName) return;

    const newSeries = await createSeries({ seriesName: newSeriesName });
    if (!newSeries) return;

    props.data = await getAllSeries();
  });
}

export default async function init(el) {
  const allSeries = await getAllSeries();
  const props = {
    el,
    data: allSeries,
  };

  buildSeriesInfoWrapper(props);

  const dataHandler = {
    set(target, prop, value, receiver) {
      target[prop] = value;
      listAllSeries(receiver);
      return true;
    },
  };

  const proxyProps = new Proxy(props, dataHandler);

  listAllSeries(proxyProps);
  buildNewSeriesForm(proxyProps);
}
