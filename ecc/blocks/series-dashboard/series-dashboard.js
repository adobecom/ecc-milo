import {
  createSeries,
  getAllSeries,
  publishSeries,
  unpublishSeries,
  archiveSeries,
} from '../../scripts/esp-controller.js';
import { LIBS } from '../../scripts/scripts.js';
import {
  getIcon,
  buildNoAccessScreen,
  getEventPageHost,
  readBlockConfig,
  signIn,
  getEventServiceEnv,
} from '../../scripts/utils.js';
import { initProfileLogicTree } from '../../scripts/event-apis.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function showToast(props, msg, options = {}) {
  const toastArea = props.el.querySelector('sp-theme.toast-area');
  const toast = createTag('sp-toast', { open: true, ...options }, msg, { parent: toastArea });
  toast.addEventListener('close', () => {
    toast.remove();
  });
}

function formatLocaleDate(string) {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  return new Date(string).toLocaleString('en-US', options);
}

function highlightRow(row) {
  if (!row) return;

  row.classList.add('highlight');

  setTimeout(() => {
    row.classList.remove('highlight');
  }, 1000);
}

function updateDashboardData(newPayload, props) {
  if (!newPayload) return;

  props.data = props.data.map((series) => {
    if (series.seriesId === newPayload.seriesId) {
      return newPayload;
    }
    return series;
  });

  props.filteredData = props.data;
  props.paginatedData = props.data;
}

function paginateData(props, config, page) {
  const ps = +config['page-size'];
  if (Number.isNaN(ps) || ps <= 0) {
    window.lana?.log('error', 'Invalid page size');
  }
  const start = (page - 1) * ps;
  const end = Math.min(page * ps, props.filteredData.length);

  props.paginatedData = props.filteredData.slice(start, end);
}

function sortData(props, config, options = {}) {
  const { field, el } = props.currentSort;

  let sortAscending = true;

  if (el?.classList.contains('active')) {
    if (options.resort) {
      sortAscending = !el.classList.contains('desc-sort');
    } else {
      sortAscending = el.classList.contains('desc-sort');
    }
    el.classList.toggle('desc-sort', !sortAscending);
  } else {
    el?.classList.remove('desc-sort');
  }

  if (options.direction) {
    sortAscending = options.direction === 'asc';
    el?.classList.toggle('desc-sort', !sortAscending);
  }

  props.filteredData = props.filteredData.sort((a, b) => {
    let valA;
    let valB;

    if ((field === 'title')) {
      valA = a[field]?.toLowerCase() || '';
      valB = b[field]?.toLowerCase() || '';
      return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    if (field === 'startDate' || field === 'modificationTime') {
      valA = new Date(a[field]);
      valB = new Date(b[field]);
      return sortAscending ? valA - valB : valB - valA;
    }

    if (field === 'venueName') {
      valA = a.venue?.venueName?.toLowerCase() || '';
      valB = b.venue?.venueName?.toLowerCase() || '';
      return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    if (typeof a[field] === typeof b[field] && typeof a[field] === 'number') {
      valA = a[field] || 0;
      valB = b[field] || 0;
      return sortAscending ? valA - valB : valB - valA;
    }

    valA = a[field]?.toString().toLowerCase() || '';
    valB = b[field]?.toString().toLowerCase() || '';
    return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  el?.parentNode.querySelectorAll('th').forEach((header) => {
    if (header !== el) {
      header.classList.remove('active');
      header.classList.remove('desc-sort');
    }
  });

  props.currentPage = 1;
  paginateData(props, config, 1);
  el?.classList.add('active');
}

function buildToastMsgWithEventTitle(seriesTitle, configValue) {
  const msgTemplate = configValue instanceof Array ? configValue.join('<br/>') : configValue;
  return msgTemplate.replace(/\[\[(.*?)\]\]/g, seriesTitle);
}

function initMoreOptions(props, config, seriesObj, row) {
  const moreOptionsCell = row.querySelector('.option-col');
  const moreOptionIcon = moreOptionsCell.querySelector('.icon-more-small-list');

  const buildTool = (parent, text, icon) => {
    const tool = createTag('a', { class: 'dash-tool', href: '#' }, text, { parent });
    tool.prepend(getIcon(icon));
    return tool;
  };

  moreOptionIcon.addEventListener('click', () => {
    const toolBox = createTag('div', { class: 'dashboard-tool-box' });

    if (seriesObj.published) {
      const unpub = buildTool(toolBox, 'Unpublish', 'publish-remove');
      unpub.addEventListener('click', async (e) => {
        e.prseriesDefault();
        toolBox.remove();
        row.classList.add('pending');
        const resp = await unpublishSeries(seriesObj.seriesId, seriesObj);
        updateDashboardData(resp, props);

        sortData(props, config, { resort: true });
        showToast(props, buildToastMsgWithEventTitle(seriesObj.title, config['unpublished-msg']), { variant: 'positive' });
      });
    } else {
      const pub = buildTool(toolBox, 'Publish', 'publish-rocket');
      if (!seriesObj.detailPagePath) pub.classList.add('disabled');
      pub.addEventListener('click', async (e) => {
        e.prseriesDefault();
        toolBox.remove();
        row.classList.add('pending');
        const resp = await publishSeries(seriesObj.seriesId, seriesObj);
        updateDashboardData(resp, props);

        sortData(props, config, { resort: true });

        showToast(props, buildToastMsgWithEventTitle(seriesObj.title, config['published-msg']), { variant: 'positive' });
      });
    }

    const previewPre = buildTool(toolBox, 'Preview pre-series', 'preview-eye');
    const previewPost = buildTool(toolBox, 'Preview post-series', 'preview-eye');
    const edit = buildTool(toolBox, 'Edit', 'edit-pencil');
    const clone = buildTool(toolBox, 'Clone', 'clone');
    const deleteBtn = buildTool(toolBox, 'Delete', 'delete-wire-round');

    if (seriesObj.detailPagePath) {
      previewPre.href = (() => {
        const url = new URL(`${getEventPageHost()}${seriesObj.detailPagePath}`);
        url.searchParams.set('previewMode', 'true');
        url.searchParams.set('cachebuster', Date.now());
        url.searchParams.set('timing', +seriesObj.localEndTimeMillis - 10);
        return url.toString();
      })();
      previewPre.target = '_blank';
      previewPost.href = (() => {
        const url = new URL(`${getEventPageHost()}${seriesObj.detailPagePath}`);
        url.searchParams.set('previewMode', 'true');
        url.searchParams.set('cachebuster', Date.now());
        url.searchParams.set('timing', +seriesObj.localEndTimeMillis + 10);
        return url.toString();
      })();
      previewPost.target = '_blank';
    } else {
      previewPre.classList.add('disabled');
      previewPost.classList.add('disabled');
    }

    // edit
    const url = new URL(`${window.location.origin}${config['create-form-url']}`);
    url.searchParams.set('seriesId', seriesObj.seriesId);
    edit.href = url.toString();

    // clone
    clone.addEventListener('click', async (e) => {
      e.prseriesDefault();
      const payload = { ...seriesObj };
      payload.title = `${seriesObj.title} - copy`;
      toolBox.remove();
      row.classList.add('pending');
      const newEventJSON = await createSeries(payload);

      if (newEventJSON.error) {
        row.classList.remove('pending');
        showToast(props, newEventJSON.error, { variant: 'negative' });
        return;
      }

      const newJson = await getAllSeries();
      props.data = newJson.series;
      props.filteredData = newJson.series;
      props.paginatedData = newJson.series;
      const modTimeHeader = props.el.querySelector('th.sortable.modificationTime');
      if (modTimeHeader) {
        props.currentSort = { field: 'modificationTime', el: modTimeHeader };
        sortData(props, config, { direction: 'desc' });
      }

      const newRow = props.el.querySelector(`tr[data-id="${newEventJSON.seriesId}"]`);
      highlightRow(newRow);
      showToast(props, buildToastMsgWithEventTitle(newEventJSON.title, config['clone-toast-msg']), { variant: 'info' });
    });

    // delete
    deleteBtn.addEventListener('click', async (e) => {
      e.prseriesDefault();

      const spTheme = props.el.querySelector('sp-theme.toast-area');
      if (!spTheme) return;

      const underlay = spTheme.querySelector('sp-underlay');
      const dialog = spTheme.querySelector('sp-dialog');
      createTag('h1', { slot: 'heading' }, 'You are deleting this series.', { parent: dialog });
      createTag('p', {}, 'Are you sure you want to do this? This cannot be undone.', { parent: dialog });
      const buttonContainer = createTag('div', { class: 'button-container' }, '', { parent: dialog });
      const dialogDeleteBtn = createTag('sp-button', { variant: 'secondary', slot: 'button' }, 'Yes, I want to delete this series', { parent: buttonContainer });
      const dialogCancelBtn = createTag('sp-button', { variant: 'cta', slot: 'button' }, 'Do not delete', { parent: buttonContainer });

      underlay.open = true;

      dialogDeleteBtn.addEventListener('click', async () => {
        toolBox.remove();
        underlay.open = false;
        dialog.innerHTML = '';
        row.classList.add('pending');
        const resp = await archiveSeries(seriesObj.seriesId);

        if (resp.error) {
          row.classList.remove('pending');
          showToast(props, resp.error, { variant: 'negative' });
          return;
        }

        const newJson = await getAllSeries();
        props.data = newJson.series;
        props.filteredData = newJson.series;
        props.paginatedData = newJson.series;

        sortData(props, config, { resort: true });
        showToast(props, config['delete-toast-msg']);
      });

      dialogCancelBtn.addEventListener('click', () => {
        toolBox.remove();
        underlay.open = false;
        dialog.innerHTML = '';
      });
    });

    if (!moreOptionsCell.querySelector('.dashboard-tool-box')) {
      moreOptionsCell.append(toolBox);
    }
  });

  document.addEventListener('click', (e) => {
    if (!moreOptionsCell.contains(e.target) || moreOptionsCell === e.target) {
      const toolBox = moreOptionsCell.querySelector('.dashboard-tool-box');
      toolBox?.remove();
    }
  });
}

function getCountryName(seriesObj) {
  if (!seriesObj.venue) return '';

  const { venue } = seriesObj;
  return venue.country || '';
}

function buildStatusTag(series) {
  const dot = series.published ? getIcon('dot-purple') : getIcon('dot-green');
  const text = series.published ? 'Published' : 'Draft';

  const statusTag = createTag('div', { class: 'status' });
  statusTag.append(dot, text);
  return statusTag;
}

function buildEventTitleTag(config, seriesObj) {
  const url = new URL(`${window.location.origin}${config['create-form-url']}`);
  url.searchParams.set('seriesId', seriesObj.seriesId);
  const seriesTitleTag = createTag('a', { class: 'title-link', href: url.toString() }, seriesObj.title);
  return seriesTitleTag;
}

// TODO: to retire
function buildVenueTag(seriesObj) {
  const { venue } = seriesObj;
  if (!venue) return null;

  const venueTag = createTag('span', { class: 'vanue-name' }, venue.venueName);
  return venueTag;
}

function buildRSVPTag(config, seriesObj) {
  const text = `${seriesObj.attendeeCount} / ${seriesObj.attendeeLimit}`;

  const url = new URL(`${window.location.origin}${config['attendee-dashboard-url']}`);
  url.searchParams.set('seriesId', seriesObj.seriesId);

  const rsvpTag = createTag('a', { class: 'rsvp-tag', href: url }, text);
  return rsvpTag;
}

async function populateRow(props, config, index) {
  const series = props.paginatedData[index];
  const tBody = props.el.querySelector('table.dashboard-table tbody');
  const sp = new URLSearchParams(window.location.search);

  // TODO: build each column's element specifically rather than just text
  const row = createTag('tr', { class: 'row', 'data-id': series.seriesId }, '', { parent: tBody });
  const titleCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildEventTitleTag(config, series)));
  const statusCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildStatusTag(series)));
  const startDateCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, formatLocaleDate(series.startDate)));
  const modDateCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, formatLocaleDate(series.modificationTime)));
  const venueCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildVenueTag(series)));
  const geoCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, getCountryName(series)));
  const externalEventId = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildRSVPTag(config, series)));
  const moreOptionsCell = createTag('td', { class: 'option-col' }, createTag('div', { class: 'td-wrapper' }, getIcon('more-small-list')));

  row.append(
    titleCell,
    statusCell,
    startDateCell,
    modDateCell,
    venueCell,
    geoCell,
    externalEventId,
    moreOptionsCell,
  );

  initMoreOptions(props, config, series, row);

  if (series.seriesId === sp.get('newEventId')) {
    if (!props.el.classList.contains('toast-shown')) {
      showToast(props, buildToastMsgWithEventTitle(series.title, config['new-toast-msg']), { variant: 'positive' });

      props.el.classList.add('toast-shown');
    }

    if (props.el.querySelector('.new-confirmation-toast')?.open === true) highlightRow(row);
  }
}

function updatePaginationControl(pagination, currentPage, totalPages) {
  const input = pagination.querySelector('input');
  input.value = currentPage;
  const leftChevron = pagination.querySelector('.icon-chev-left');
  const rightChevron = pagination.querySelector('.icon-chev-right');
  leftChevron.classList.toggle('disabled', currentPage === 1);
  rightChevron.classList.toggle('disabled', currentPage === totalPages);
}

function decoratePagination(props, config) {
  if (!props.filteredData.length) return;

  const totalPages = Math.ceil(props.filteredData.length / +config['page-size']);
  const paginationContainer = createTag('div', { class: 'pagination-container' });
  const chevLeft = getIcon('chev-left');
  const chevRight = getIcon('chev-right');
  const paginationText = createTag('div', { class: 'pagination-text' }, `of ${totalPages} pages`);
  const pageInput = createTag('input', { type: 'text', class: 'page-input' });

  paginationText.prepend(pageInput);
  paginationContainer.append(chevLeft, paginationText, chevRight);

  pageInput.addEventListener('keypress', (series) => {
    if (series.key === 'Enter') {
      let page = parseInt(pageInput.value, +config['page-size']);
      if (page > totalPages) {
        page = totalPages;
      } else if (page < 1) {
        page = 1;
      }

      updatePaginationControl(paginationContainer, props.currentPage = page, totalPages);
      paginateData(props, config, page);
    }
  });

  chevLeft.addEventListener('click', () => {
    if (props.currentPage > 1) {
      updatePaginationControl(paginationContainer, props.currentPage -= 1, totalPages);
      paginateData(props, config, props.currentPage);
    }
  });

  chevRight.addEventListener('click', () => {
    if (props.currentPage < totalPages) {
      updatePaginationControl(paginationContainer, props.currentPage += 1, totalPages);
      paginateData(props, config, props.currentPage);
    }
  });

  props.el.append(paginationContainer);
  updatePaginationControl(paginationContainer, props.currentPage, totalPages);
}

function initSorting(props, config) {
  const thead = props.el.querySelector('thead');
  const thRow = thead.querySelector('tr');

  const headers = {
    thumbnail: '',
    title: 'EVENT NAME',
    published: 'PUBLISH STATUS',
    startDate: 'DATE RUN',
    modificationTime: 'LAST MODIFIED',
    venueName: 'VENUE NAME',
    timezone: 'GEO',
    attendeeCount: 'RSVP DATA',
    manage: 'MANAGE',
  };

  Object.entries(headers).forEach(([key, val]) => {
    const thText = createTag('span', {}, val);
    const th = createTag('th', {}, thText, { parent: thRow });

    if (['thumbnail', 'manage'].includes(key)) return;

    th.append(getIcon('chev-down'), getIcon('chev-up'));
    th.classList.add('sortable', key);
    th.addEventListener('click', () => {
      if (!props.filteredData.length) return;

      thead.querySelectorAll('th').forEach((h) => {
        if (th !== h) {
          h.classList.remove('active');
        }
      });
      th.classList.add('active');
      props.currentSort = {
        el: th,
        field: key,
      };
      sortData(props, config);
    });
  });
}

function buildNoSearchResultsScreen(el, config) {
  const noSearchResultsRow = createTag('tr', { class: 'no-search-results-row' });
  const noSearchResultsCol = createTag('td', { colspan: '100%' }, getIcon('empty-dashboard'), { parent: noSearchResultsRow });
  createTag('h2', {}, config['no-search-results-heading'], { parent: noSearchResultsCol });
  createTag('p', {}, config['no-search-results-text'], { parent: noSearchResultsCol });

  el.append(noSearchResultsRow);
}

function populateTable(props, config) {
  const tBody = props.el.querySelector('table.dashboard-table tbody');
  tBody.innerHTML = '';

  if (!props.paginatedData.length) {
    buildNoSearchResultsScreen(tBody, config);
  } else {
    const endOfPage = Math.min(+config['page-size'], props.paginatedData.length);

    for (let i = 0; i < endOfPage; i += 1) {
      populateRow(props, config, i);
    }

    props.el.querySelector('.pagination-container')?.remove();
    decoratePagination(props, config);
  }
}

function filterData(props, config, query) {
  const q = query.toLowerCase();
  props.filteredData = props.data.filter((e) => e.title.toLowerCase().includes(q));
  props.currentPage = 1;
  paginateData(props, config, 1);
  sortData(props, config, { resort: true });
}

function buildDashboardHeader(props, config) {
  const dashboardHeader = createTag('div', { class: 'dashboard-header' });
  const textContainer = createTag('div', { class: 'dashboard-header-text' });
  const actionsContainer = createTag('div', { class: 'dashboard-actions-container' });

  createTag('h1', { class: 'dashboard-header-heading' }, 'All Events', { parent: textContainer });
  createTag('p', { class: 'dashboard-header-series-count' }, `(${props.data.length} series)`, { parent: textContainer });

  const searchInputWrapper = createTag('div', { class: 'search-input-wrapper' }, '', { parent: actionsContainer });
  const searchInput = createTag('input', { type: 'text', placeholder: 'Search' }, '', { parent: searchInputWrapper });
  searchInputWrapper.append(getIcon('search'));
  createTag('a', { class: 'con-button blue', href: config['create-form-url'] }, config['create-cta-text'], { parent: actionsContainer });
  searchInput.addEventListener('input', () => filterData(props, config, searchInput.value));

  dashboardHeader.append(textContainer, actionsContainer);
  props.el.prepend(dashboardHeader);
}

function updateEventsCount(props) {
  const seriesCount = props.el.querySelector('.dashboard-header-series-count');
  seriesCount.textContent = `(${props.data.length} series)`;
}

function buildDashboardTable(props, config) {
  const tableContainer = createTag('div', { class: 'dashboard-table-container' }, '', { parent: props.el });
  const table = createTag('table', { class: 'dashboard-table' }, '', { parent: tableContainer });
  const thead = createTag('thead', {}, '', { parent: table });
  createTag('tbody', {}, '', { parent: table });
  createTag('tr', { class: 'table-header-row' }, '', { parent: thead });
  initSorting(props, config);
  populateTable(props, config);

  const usp = new URLSearchParams(window.location.search);
  if (usp.get('newEventId')) {
    const modTimeHeader = props.el.querySelector('th.sortable.modificationTime');
    if (modTimeHeader) {
      props.currentSort = { field: 'modificationTime', el: modTimeHeader };
      sortData(props, config, { direction: 'desc' });
    }
  }
}

async function getSeriesArray() {
  const resp = await getAllSeries();

  if (resp.error) {
    return [];
  }

  return resp.series;
}

function buildNoEventScreen(el, config) {
  el.classList.add('no-data');

  const h1 = createTag('h1', {}, 'All Events');
  const area = createTag('div', { class: 'no-data-area' });
  const noEventHeading = createTag('h2', {}, config['no-heading']);
  const noEventDescription = createTag('p', {}, config['no-description']);
  const cta = createTag('a', { class: 'con-button blue', href: config['create-form-url'] }, config['create-cta-text']);

  el.append(h1, area);
  area.append(getIcon('empty-dashboard'), noEventHeading, noEventDescription, cta);
}

async function buildDashboard(el, config) {
  const spTheme = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'toast-area' }, '', { parent: el });
  createTag('sp-underlay', {}, '', { parent: spTheme });
  createTag('sp-dialog', { size: 's' }, '', { parent: spTheme });

  const props = {
    el,
    currentPage: 1,
    currentSort: {},
  };

  const data = await getSeriesArray();

  if (!data?.length) {
    buildNoEventScreen(el, config);
  } else {
    props.data = data;
    props.filteredData = [...data];
    props.paginatedData = [...data];

    const dataHandler = {
      set(target, prop, value, receiver) {
        target[prop] = value;
        populateTable(receiver, config);
        updateEventsCount(receiver);
        return true;
      },
    };
    const proxyProps = new Proxy(props, dataHandler);
    buildDashboardHeader(proxyProps, config);
    buildDashboardTable(proxyProps, config);
  }

  setTimeout(() => {
    el.classList.remove('loading');
  }, 10);
}

function buildLoadingScreen(el) {
  el.classList.add('loading');
  const loadingScreen = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'loading-screen' });
  createTag('sp-progress-circle', { size: 'l', indeterminate: true }, '', { parent: loadingScreen });
  createTag('sp-field-label', {}, 'Loading Adobe Event Creation Console dashboard...', { parent: loadingScreen });

  el.prepend(loadingScreen);
}

export default async function init(el) {
  const miloLibs = LIBS;
  await Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/theme.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/toast.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/button.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/dialog.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/underlay.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/progress-circle.js`),
  ]);

  const config = readBlockConfig(el);
  el.innerHTML = '';
  buildLoadingScreen(el);

  const sp = new URLSearchParams(window.location.search);
  const devToken = sp.get('devToken');
  if (devToken && getEventServiceEnv() === 'local') {
    buildDashboard(el, config);
    return;
  }

  initProfileLogicTree({
    noProfile: () => {
      signIn();
    },
    noAccessProfile: () => {
      buildNoAccessScreen(el);
    },
    validProfile: () => {
      buildDashboard(el, config);
    },
  });
}
