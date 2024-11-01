import { createSeries, deleteSeries, getAllSeries, updateSeries } from '../../scripts/esp-controller.js';
import { LIBS } from '../../scripts/scripts.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

const ATTR_MAP = {
  seriesId: {
    handle: 'series-id',
    label: 'Series ID',
    type: 'string',
    readonly: true,
  },
  seriesName: {
    handle: 'series-name',
    label: 'Series Name',
    type: 'string',
    readonly: false,
  },
  externalThemeId: {
    handle: 'external-theme-id',
    label: 'External Theme ID',
    type: 'string',
    readonly: true,
  },
  cloudType: {
    handle: 'cloud-type',
    label: 'Cloud Type',
    type: 'list',
    readonly: false,
    staticOptions: ['CreativeCloud', 'DX'],
  },
  templateId: {
    handle: 'template-id',
    label: 'Events Template',
    type: 'preview-list',
    readonly: false,
    optionsSource: '/ecc/system/series-templates.json',
  },
  relatedDomain: {
    handle: 'related-domain',
    label: 'Related Domain',
    type: 'string',
    readonly: false,
  },
  emailTemplate: {
    handle: 'email-template',
    label: 'Email Template',
    type: 'string',
    readonly: false,
  },
  modificationTime: {
    handle: 'modification-time',
    label: 'Last Modified',
    type: 'timestamp',
    readonly: true,
  },
  creationTime: {
    handle: 'creation-time',
    label: 'Creation Time',
    type: 'timestamp',
    readonly: true,
  },
};

function buildSeriesInfoWrapper(props) {
  const seriesInfoContainer = createTag('div', { class: 'series-info-container' });
  props.el.append(seriesInfoContainer);
}

function showToast(props, msg, options = {}) {
  const toastArea = props.el.querySelector('sp-theme.toast-area');
  const toast = createTag('sp-toast', { open: true, ...options }, msg, { parent: toastArea });
  toast.addEventListener('close', () => {
    toast.remove();
  });
}

async function buildPreviewListOptionsFromSource(previewList, source, attr) {
  const valueHolder = previewList.closest('.series-info-wrapper').querySelector(`.${attr.handle}-input`);
  const previewListItems = previewList.querySelector('.preview-list-items');
  const previewListOverlay = previewList.querySelector('.preview-list-overlay');

  const jsonResp = await fetch(source).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch series templates');
    return res.json();
  });

  const options = jsonResp.data;
  if (!options) return;

  if (options.length > 3) {
    previewListItems.classList.add('show-3');
  } else {
    previewListItems.classList.remove('show-3');
  }

  options.forEach((option) => {
    const previewListItem = createTag('div', { class: 'preview-list-item' });
    const previewListItemImage = createTag('img', { src: option['template-image'] });
    const previewListItemTitle = createTag('h5', {}, option['template-name']);
    const selectItemBtn = createTag('a', { class: 'con-button blue select-item-btn' }, 'Select', { parent: previewListItem });
    previewListItem.append(previewListItemImage, previewListItemTitle, selectItemBtn);
    previewListItems.append(previewListItem);

    selectItemBtn.addEventListener('click', () => {
      valueHolder.value = option['template-path'];
      previewListOverlay.classList.add('hidden');
    });
  });
}

function buildPreviewList(attrObj) {
  const { optionsSource } = attrObj;

  const previewList = createTag('div', { class: 'preview-list' });
  const previewListTitle = createTag('h4', {}, 'Select a template');
  const previewListItems = createTag('div', { class: 'preview-list-items' });
  const previewListBtn = createTag('a', { class: 'con-button preview-list-btn' }, 'Select');
  const previewListOverlay = createTag('div', { class: 'preview-list-overlay hidden' });
  const previewListModal = createTag('div', { class: 'preview-list-modal' }, '', { parent: previewListOverlay });
  const previewListCloseBtn = createTag('a', { class: 'preview-list-close-btn' }, '✕', { parent: previewListModal });

  previewListBtn.addEventListener('click', () => {
    previewListOverlay.classList.remove('hidden');
    buildPreviewListOptionsFromSource(previewList, optionsSource, attrObj);
  });

  previewListCloseBtn.addEventListener('click', () => {
    previewListOverlay.classList.add('hidden');
  });

  previewListModal.append(previewListTitle, previewListItems);
  previewList.append(previewListBtn, previewListOverlay);
  return previewList;
}

function listAllSeries(props) {
  const seriesInfoContainer = props.el.querySelector('.series-info-container');
  if (!seriesInfoContainer) return;
  seriesInfoContainer.innerHTML = '';

  props.data.forEach((series) => {
    const seriesInfoWrapper = createTag('div', { class: 'series-info-wrapper' });

    Object.keys(ATTR_MAP).forEach(async (attr) => {
      const fieldWrapper = createTag('div', { class: 'field-wrapper' });
      const attrValue = series[attr] || '';
      const attrType = ATTR_MAP[attr].type;
      const attrReadonly = ATTR_MAP[attr].readonly;
      const attrHandle = ATTR_MAP[attr].handle;
      const attrSentence = ATTR_MAP[attr].label;

      if (attrType === 'list') {
        const attrOptions = ATTR_MAP[attr].staticOptions || series[attr];
        const attrSelect = createTag('select', { class: `${attrHandle}-select` });
        if (attrReadonly) attrSelect.disabled = true;
        attrOptions.forEach((option) => {
          const opt = createTag('option', { value: option }, option);
          attrSelect.append(opt);
        });

        fieldWrapper.append(createTag('label', {}, `${attrSentence}:`), attrSelect);
      }

      if (attrType === 'timestamp') {
        const attrInput = createTag('input', { class: `${attrHandle}-input`, value: new Date(attrValue).toLocaleString() });
        attrInput.disabled = true;
        fieldWrapper.append(createTag('label', {}, `${attrSentence}:`), attrInput);
      }

      if (attrType === 'preview-list') {
        const label = createTag('label', {}, `${attrSentence}:`);
        const valueHolder = createTag('input', { class: `${attrHandle}-input`, value: attrValue, disabled: true });
        const previewList = buildPreviewList(ATTR_MAP[attr]);
        fieldWrapper.append(label, valueHolder, previewList);
      }

      if (attrType === 'string') {
        const attrInput = createTag('input', { class: `${attrHandle}-input`, value: attrValue });
        if (attrReadonly) attrInput.disabled = true;
        fieldWrapper.append(createTag('label', {}, `${attrSentence}:`), attrInput);
      }

      seriesInfoWrapper.append(fieldWrapper);
    });

    const actionsWrapper = createTag('div', { class: 'actions-wrapper' });
    const updateSeriesBtn = createTag('a', { class: 'con-button fill update-series-btn' }, 'Update Series');
    const deleteSeriesBtn = createTag('a', { class: 'con-button fill delete-series-btn' }, 'Delete Series');
    actionsWrapper.append(updateSeriesBtn, deleteSeriesBtn);
    seriesInfoWrapper.append(actionsWrapper);

    updateSeriesBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const updatedSeries = {};

      Object.keys(ATTR_MAP).forEach((attr) => {
        const readOnly = ATTR_MAP[attr].readonly;

        if (readOnly) return;

        const attrType = ATTR_MAP[attr].type;
        const attrHandle = ATTR_MAP[attr].handle;

        if (attrType === 'list') {
          const attrSelect = seriesInfoWrapper.querySelector(`.${attrHandle}-select`);
          if (attrSelect && attrSelect.value) updatedSeries[attr] = attrSelect.value;
        } else {
          const attrInput = seriesInfoWrapper.querySelector(`.${attrHandle}-input`);
          if (attrInput && attrInput.value) updatedSeries[attr] = attrInput.value;
        }
      });

      props.el.classList.add('loading');
      const resp = await updateSeries(
        { ...updatedSeries, modificationTime: series.modificationTime },
        series.seriesId,
      );

      if (!resp.error) {
        props.data = await getAllSeries();
        showToast(props, 'Series updated', { variant: 'positive', timeout: 6000 });
      } else {
        showToast(props, 'Update failed. Please try again later.', { variant: 'negative', timeout: 6000 });
      }
      props.el.classList.remove('loading');
    });

    deleteSeriesBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      props.el.classList.add('loading');
      const { seriesId } = series;
      const resp = await deleteSeries(seriesId);

      if (!resp.error) {
        props.data = await getAllSeries();
        showToast(props, 'Series deleted', { variant: 'positive', timeout: 6000 });
      } else {
        showToast(props, 'Delete failed. Please try again later.', { variant: 'negative', timeout: 6000 });
      }
      props.el.classList.remove('loading');
    });

    seriesInfoContainer.append(seriesInfoWrapper);
  });
}

function buildNewSeriesForm(props) {
  const newSeriesForm = createTag('div', { class: 'new-series-form' });
  const newSeriesNameInput = createTag('input', { class: 'new-series-name-input', placeholder: 'Enter new series name' }, '', { parent: newSeriesForm });
  const createNewSeriesBtn = createTag('a', { class: 'con-button fill create-new-series-btn' }, 'Create New Series', { parent: newSeriesForm });

  createNewSeriesBtn.addEventListener('click', async () => {
    const newSeriesName = newSeriesNameInput.value;
    if (!newSeriesName) return;

    const newSeries = await createSeries({ seriesName: newSeriesName });
    if (!newSeries) return;

    props.data = await getAllSeries();
  });

  props.el.prepend(newSeriesForm);
}

export default async function init(el) {
  const miloLibs = LIBS;
  await Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/theme.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/toast.js`),
  ]);
  createTag('sp-theme', { color: 'light', scale: 'medium', class: 'toast-area' }, '', { parent: el });

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
  buildNewSeriesForm(proxyProps);
  listAllSeries(proxyProps);
}
