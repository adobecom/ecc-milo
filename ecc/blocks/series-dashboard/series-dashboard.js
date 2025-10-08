import {
  createSeries,
  getAllSeries,
  publishSeries,
  unpublishSeries,
  archiveSeries,
  getSeriesForUser,
  getEventsForUser,
  getSeriesHistory,
} from '../../scripts/esp-controller.js';
import { LIBS } from '../../scripts/scripts.js';
import {
  getIcon,
  buildNoAccessScreen,
  readBlockConfig,
  signIn,
} from '../../scripts/utils.js';
import { initProfileLogicTree } from '../../scripts/profile.js';
import { quickFilter } from '../series-creation-form/data-handler.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function filterSeriesForUpdate(series) {
  if (!series) return {};
  return quickFilter(series, 'update');
}

const apiCache = (() => {
  const cache = new Map();
  const pendingRequests = new Map();
  const cacheTimeout = 10000; // 10 seconds

  const generateKey = (apiFunction, ...args) => `${apiFunction.name}_${JSON.stringify(args)}`;
  const isExpired = (timestamp) => Date.now() - timestamp > cacheTimeout;

  return {
    async get(apiFunction, ...args) {
      const key = generateKey(apiFunction, ...args);

      // Return cached result if valid
      if (cache.has(key)) {
        const { data, timestamp } = cache.get(key);
        if (!isExpired(timestamp)) {
          return data;
        }
        cache.delete(key);
      }

      // Return pending request if exists
      if (pendingRequests.has(key)) {
        return pendingRequests.get(key);
      }

      // Make new request
      const request = apiFunction(...args)
        .then((data) => {
          cache.set(key, { data, timestamp: Date.now() });
          pendingRequests.delete(key);
          return data;
        })
        .catch((error) => {
          pendingRequests.delete(key);
          throw error;
        });

      pendingRequests.set(key, request);
      return request;
    },

    clear() {
      cache.clear();
      pendingRequests.clear();
    },

    invalidate(pattern) {
      const keysToDelete = [];
      cache.forEach((value, key) => {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => cache.delete(key));
    },
  };
})();

// Throttling utility
function throttle(func, delay) {
  let timeoutId;
  let lastExecTime = 0;

  return function throttledFunction(...args) {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

// Debouncing utility
function debounce(func, delay) {
  let timeoutId;

  return function debouncedFunction(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

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

function createSwipingLoader(extraClass = '') {
  const loader = createTag('div', { class: `swiping-loader ${extraClass}` });

  requestAnimationFrame(() => {
    loader.classList.add('animate');
  });

  return loader;
}

function updateDashboardData(newPayload, props) {
  if (!newPayload) return;

  // Invalidate cache for this specific series
  apiCache.invalidate(newPayload.seriesId);

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
    window.lana?.log('Invalid page size');
  }
  const start = (page - 1) * ps;
  const end = Math.min(page * ps, props.filteredData.length);

  props.paginatedData = props.filteredData.slice(start, end);
}

function getSeriesEvents(seriesId, events) {
  return events.filter((e) => e.seriesId === seriesId);
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

    if ((field === 'seriesName')) {
      valA = a[field]?.toLowerCase() || '';
      valB = b[field]?.toLowerCase() || '';
      return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    if (field === 'modificationTime') {
      valA = new Date(a[field]);
      valB = new Date(b[field]);
      return sortAscending ? valA - valB : valB - valA;
    }

    if (field === 'eventsCount') {
      valA = getSeriesEvents(a.seriesId, props.events).length;
      valB = getSeriesEvents(b.seriesId, props.events).length;
      return sortAscending ? valA - valB : valB - valA;
    }

    if ((!Number.isNaN(+a[field]) && !Number.isNaN(+b[field]))) {
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

    const { seriesStatus } = seriesObj;

    if (seriesStatus && seriesStatus !== 'archived') {
      if (seriesStatus === 'published') {
        const unpub = buildTool(toolBox, 'Unpublish', 'publish-remove');
        if (seriesObj.seriesStatus === 'archived') unpub.classList.add('disabled');
        unpub.addEventListener('click', async (e) => {
          e.preventDefault();
          toolBox.remove();
          row.classList.add('pending');
          const resp = await unpublishSeries(
            seriesObj.seriesId,
            filterSeriesForUpdate(seriesObj),
          );
          updateDashboardData(resp, props);

          sortData(props, config, { resort: true });
          showToast(props, buildToastMsgWithEventTitle(seriesObj.seriesName, config['unpublished-msg']), { variant: 'positive' });
        });
      } else {
        const pub = buildTool(toolBox, 'Publish', 'publish-rocket');
        if (seriesObj.seriesStatus === 'archived') pub.classList.add('disabled');
        pub.addEventListener('click', async (e) => {
          e.preventDefault();
          toolBox.remove();
          row.classList.add('pending');
          const resp = await publishSeries(
            seriesObj.seriesId,
            filterSeriesForUpdate(seriesObj),
          );
          updateDashboardData(resp, props);

          sortData(props, config, { resort: true });

          showToast(props, buildToastMsgWithEventTitle(seriesObj.seriesName, config['published-msg']), { variant: 'positive' });
        });
      }
    }

    // const viewTemplate = buildTool(toolBox, 'View Template', 'preview-eye');

    const clone = buildTool(toolBox, 'Clone', 'clone');

    if (seriesStatus && seriesStatus !== 'archived') {
      const edit = buildTool(toolBox, 'Edit', 'edit-pencil');

      const url = new URL(`${window.location.origin}${config['create-form-url']}`);
      url.searchParams.set('seriesId', seriesObj.seriesId);
      edit.href = url.toString();

      const archive = buildTool(toolBox, 'Archive', 'archive');

      archive.addEventListener('click', async (e) => {
        e.preventDefault();

        const spTheme = props.el.querySelector('sp-theme.toast-area');
        if (!spTheme) return;

        const underlay = spTheme.querySelector('sp-underlay');
        const dialog = spTheme.querySelector('sp-dialog');
        createTag('h1', { slot: 'heading' }, 'You are archiving this series.', { parent: dialog });
        createTag('p', {}, 'Are you sure you want to do this? This cannot be undone.', { parent: dialog });
        const buttonContainer = createTag('div', { class: 'button-container' }, '', { parent: dialog });
        const dialogArchiveBtn = createTag('sp-button', { variant: 'secondary', slot: 'button' }, 'Yes, I want to archive this series', { parent: buttonContainer });
        const dialogCancelBtn = createTag('sp-button', { variant: 'cta', slot: 'button' }, 'Do not archive', { parent: buttonContainer });

        underlay.open = true;

        dialogArchiveBtn.addEventListener('click', async () => {
          toolBox.remove();
          underlay.open = false;
          dialog.innerHTML = '';
          row.classList.add('pending');
          const resp = await archiveSeries(
            seriesObj.seriesId,
            filterSeriesForUpdate(seriesObj),
          );

          if (resp.error) {
            row.classList.remove('pending');
            showToast(props, resp.error.message || 'Unknown error while archiving the series.', { variant: 'negative' });
            return;
          }

          // Invalidate cache for archived series
          apiCache.invalidate(seriesObj.seriesId);

          const newJson = await getAllSeries();
          props.data = newJson.series;
          props.filteredData = newJson.series;
          props.paginatedData = newJson.series;

          sortData(props, config, { resort: true });
          showToast(props, config['archive-msg']);
        });

        dialogCancelBtn.addEventListener('click', () => {
          toolBox.remove();
          underlay.open = false;
          dialog.innerHTML = '';
        });
      });
    }
    // const verHistory = buildTool(toolBox, 'Version History', 'version-history');

    // clone
    clone.addEventListener('click', async (e) => {
      e.preventDefault();
      const payload = { ...quickFilter(seriesObj, 'clone'), seriesStatus: 'draft' };
      payload.seriesName = `${seriesObj.seriesName} - copy`;
      toolBox.remove();
      row.classList.add('pending');
      const newSeriesObj = await createSeries(payload);

      if (newSeriesObj.error) {
        row.classList.remove('pending');
        showToast(props, newSeriesObj.error.message || 'Unknown error while cloning the series.', { variant: 'negative' });
        return;
      }

      // Invalidate cache for cloned series
      apiCache.invalidate(seriesObj.seriesId);

      const newJson = await getAllSeries();
      props.data = newJson.series;
      props.filteredData = newJson.series;
      props.paginatedData = newJson.series;
      const modTimeHeader = props.el.querySelector('th.sortable.modificationTime');
      if (modTimeHeader) {
        props.currentSort = { field: 'modificationTime', el: modTimeHeader };
        sortData(props, config, { direction: 'desc' });
      }

      const newRow = props.el.querySelector(`tr[data-id="${newSeriesObj.seriesId}"]`);
      highlightRow(newRow);
      showToast(props, buildToastMsgWithEventTitle(newSeriesObj.seriesName, config['clone-toast-msg']), { variant: 'info' });
    });

    if (!moreOptionsCell.querySelector('.dashboard-tool-box')) {
      moreOptionsCell.append(toolBox);
    }
  });

  // version history

  // close tool box
  document.addEventListener('click', (e) => {
    if (!moreOptionsCell.contains(e.target) || moreOptionsCell === e.target) {
      const toolBox = moreOptionsCell.querySelector('.dashboard-tool-box');
      toolBox?.remove();
    }
  });
}

function buildStatusTag(series) {
  let dot;

  switch (series.seriesStatus) {
    case 'published':
      dot = getIcon('dot-purple');
      break;
    case 'draft':
      dot = getIcon('dot-green');
      break;
    case 'archived':
    default:
      dot = getIcon('dot-gray');
      break;
  }

  const statusTag = createTag('div', { class: 'status' });
  statusTag.append(dot, series.seriesStatus || 'unknown');
  return statusTag;
}

function buildSeriesNameTag(config, seriesObj) {
  const url = new URL(`${window.location.origin}${config['create-form-url']}`);
  url.searchParams.set('seriesId', seriesObj.seriesId);
  const nameTag = createTag('a', { class: 'name-link' }, seriesObj.seriesName);
  if (['published', 'draft'].includes(seriesObj.seriesStatus)) nameTag.href = url.toString();
  return nameTag;
}

function buildEventsCountTag(series, events) {
  if (!events) {
    const eventsCountTag = createTag('span', { class: 'events-count' }, 'N/A');
    return eventsCountTag;
  }

  const seriesEvents = getSeriesEvents(series.seriesId, events);

  const eventsCountTag = createTag('span', { class: 'events-count' }, seriesEvents.length);
  return eventsCountTag;
}

function createLazyRow(props, config, series) {
  const tBody = props.el.querySelector('table.dashboard-table tbody');
  const sp = new URLSearchParams(window.location.search);

  const row = createTag('tr', { class: 'row', 'data-id': series.seriesId }, '', { parent: tBody });
  const nameCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildSeriesNameTag(config, series)));
  const statusCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildStatusTag(series)));
  const modificationTimeCall = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, formatLocaleDate(series.modificationTime)));
  const createdByCell = createTag('td', { class: 'creator-container' }, createTag('div', { class: 'td-wrapper' }, createSwipingLoader('single-line-loader')));
  const modifiedByCell = createTag('td', { class: 'modifier-container' }, createTag('div', { class: 'td-wrapper' }, createSwipingLoader('single-line-loader')));
  const eventsCountCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildEventsCountTag(series, props.events)));
  const moreOptionsCell = createTag('td', { class: 'option-col' }, createTag('div', { class: 'td-wrapper' }, getIcon('more-small-list')));

  row.append(
    nameCell,
    statusCell,
    modificationTimeCall,
    createdByCell,
    modifiedByCell,
    eventsCountCell,
    moreOptionsCell,
  );

  initMoreOptions(props, config, series, row);

  if (series.seriesId === sp.get('newEventId')) {
    if (!props.el.classList.contains('toast-shown')) {
      showToast(props, buildToastMsgWithEventTitle(series.seriesName, config['new-creation-msg']), { variant: 'positive' });

      props.el.classList.add('toast-shown');
    }

    if (props.el.querySelector('.new-confirmation-toast')?.open === true) highlightRow(row);
  }

  return row;
}

// Load data for a specific row
async function loadRowData(row, series) {
  const createdByCell = row.querySelector('.creator-container .td-wrapper');
  const modifiedByCell = row.querySelector('.modifier-container .td-wrapper');

  // Load history data for creator and modifier
  const historyPromises = [
    { cell: createdByCell, type: 'creator' },
    { cell: modifiedByCell, type: 'modifier' },
  ];

  historyPromises.forEach(({ cell, type }) => {
    apiCache.get(getSeriesHistory, series.seriesId).then((response) => {
      if (response.error || !response.history || !response.history.length) {
        cell.innerHTML = 'N/A';
        return;
      }

      const { history } = response;
      if (!Array.isArray(history) || history.length === 0) {
        cell.innerHTML = 'N/A';
        return;
      }

      const historyMap = {
        creator: {
          target: history[0],
          getValue: (target) => target?.user?.name || 'Unknown',
        },
        modifier: {
          target: history[history.length - 1],
          getValue: (target) => target?.user?.name || 'Unknown',
        },
      };

      const { target, getValue } = historyMap[type];
      if (!target || !getValue) {
        cell.innerHTML = 'N/A';
        return;
      }

      try {
        const value = getValue(target);
        const historyUserNameTag = createTag('span', { class: 'creator-tag' }, value || 'N/A');
        cell.innerHTML = '';
        cell.append(historyUserNameTag);
      } catch (error) {
        window.lana?.log(`Error processing history data for series ${series.seriesId}, type ${type}: ${error.message}`);
        cell.innerHTML = 'N/A';
      }
    });
  });
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

function initHeaderRow(props, config) {
  const thead = props.el.querySelector('thead');
  const thRow = thead.querySelector('tr');

  const headers = {
    seriesName: 'SERIES NAME',
    seriesStatus: 'STATUS',
    modificationTime: 'LAST MODIFIED',
    createdBy: 'CREATED BY',
    modifiedBy: 'MODIFIED BY',
    eventsCount: 'NUMBER OF EVENTS IN SERIES',
    manage: 'MANAGE',
  };

  Object.entries(headers).forEach(([key, val]) => {
    const thText = createTag('span', {}, val);
    const th = createTag('th', {}, thText, { parent: thRow });

    if (['manage'].includes(key)) return;

    th.append(getIcon('chev-down'), getIcon('chev-up'));
    th.classList.add('sortable', key);
    // Throttled sorting to prevent rapid API calls
    const throttledSort = throttle(() => {
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
    }, 300); // Throttle sorting to max once per 300ms

    th.addEventListener('click', throttledSort);
  });
}

function buildNoSearchResultsScreen(el, config) {
  const noSearchResultsRow = createTag('tr', { class: 'no-search-results-row' });
  const noSearchResultsCol = createTag('td', { colspan: '100%' }, getIcon('empty-dashboard'), { parent: noSearchResultsRow });
  createTag('h2', {}, config['no-search-results-heading'], { parent: noSearchResultsCol });
  createTag('p', {}, config['no-search-results-text'], { parent: noSearchResultsCol });

  el.append(noSearchResultsRow);
}

// Batch loading for better performance
async function populateTable(props, config) {
  const tBody = props.el.querySelector('table.dashboard-table tbody');
  tBody.innerHTML = '';

  if (!props.paginatedData.length) {
    buildNoSearchResultsScreen(tBody, config);
  } else {
    const endOfPage = Math.min(+config['page-size'], props.paginatedData.length);
    const batchSize = 5; // Load 5 rows at a time

    // Create all rows first (with loaders)
    for (let i = 0; i < endOfPage; i += 1) {
      createLazyRow(props, config, props.paginatedData[i]);
    }

    // Load data in batches to prevent overwhelming the API
    const loadBatches = async () => {
      const batches = [];
      for (let i = 0; i < endOfPage; i += batchSize) {
        const batchEnd = Math.min(i + batchSize, endOfPage);
        const batchPromises = [];

        for (let j = i; j < batchEnd; j += 1) {
          const row = tBody.children[j];
          const series = props.paginatedData[j];
          batchPromises.push(loadRowData(row, series));
        }

        batches.push(batchPromises);
      }

      // Process batches sequentially with delays
      const processBatches = async () => {
        let currentBatch = 0;
        const processNextBatch = async () => {
          if (currentBatch >= batches.length) return;

          await Promise.allSettled(batches[currentBatch]);
          currentBatch += 1;

          // Small delay between batches to prevent overwhelming the server
          if (currentBatch < batches.length) {
            setTimeout(processNextBatch, 100);
          }
        };

        await processNextBatch();
      };

      await processBatches();
    };

    // Start batch loading asynchronously
    loadBatches().catch((error) => {
      window.lana?.log(`Error in batch loading: ${error.message}`);
    });

    props.el.querySelector('.pagination-container')?.remove();
    decoratePagination(props, config);
  }
}

function filterData(props, config, query) {
  const q = query.toLowerCase();
  props.filteredData = props.data.filter((s) => s.seriesName.toLowerCase().includes(q));
  props.currentPage = 1;
  paginateData(props, config, 1);
  sortData(props, config, { resort: true });
}

function buildDashboardHeader(props, config) {
  const dashboardHeader = createTag('div', { class: 'dashboard-header' });
  const textContainer = createTag('div', { class: 'dashboard-header-text' });
  const actionsContainer = createTag('div', { class: 'dashboard-actions-container' });

  createTag('h1', { class: 'dashboard-header-heading' }, 'All Event series', { parent: textContainer });
  createTag('p', { class: 'dashboard-header-series-count' }, `(${props.data.length} series)`, { parent: textContainer });

  const searchInputWrapper = createTag('div', { class: 'search-input-wrapper' }, '', { parent: actionsContainer });
  const searchInput = createTag('input', { type: 'text', placeholder: 'Search' }, '', { parent: searchInputWrapper });
  searchInputWrapper.append(getIcon('search'));
  createTag('a', { class: 'con-button blue', href: config['create-form-url'] }, config['create-cta-text'], { parent: actionsContainer });
  // Improved debouncing for search
  const debouncedSearch = debounce((query) => {
    filterData(props, config, query);
  }, 500); // Reduced from 1000ms to 500ms for better UX

  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });

  dashboardHeader.append(textContainer, actionsContainer);
  props.el.prepend(dashboardHeader);
}

function updateDataCount(props) {
  const seriesCount = props.el.querySelector('.dashboard-header-series-count');
  seriesCount.textContent = `(${props.data.length} series)`;
}

async function buildDashboardTable(props, config) {
  const tableContainer = createTag('div', { class: 'dashboard-table-container' }, '', { parent: props.el });
  const table = createTag('table', { class: 'dashboard-table' }, '', { parent: tableContainer });
  const thead = createTag('thead', {}, '', { parent: table });
  createTag('tbody', {}, '', { parent: table });
  createTag('tr', { class: 'table-header-row' }, '', { parent: thead });
  initHeaderRow(props, config);

  // Populate table asynchronously
  await populateTable(props, config);

  const usp = new URLSearchParams(window.location.search);
  if (usp.get('newEventId')) {
    const modTimeHeader = props.el.querySelector('th.sortable.modificationTime');
    if (modTimeHeader) {
      props.currentSort = { field: 'modificationTime', el: modTimeHeader };
      sortData(props, config, { direction: 'desc' });
    }
  }
}

function buildNoDataScreen(el, config) {
  el.classList.add('no-data');

  const h1 = createTag('h1', {}, 'All Event series');
  const area = createTag('div', { class: 'no-data-area' });
  const noEventHeading = createTag('h2', {}, config['no-data-heading']);
  const noEventDescription = createTag('p', {}, config['no-data-description']);
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

  const [series, events] = await Promise.all([getSeriesForUser(), getEventsForUser()]);

  if (!series?.length) {
    buildNoDataScreen(el, config);
  } else {
    props.events = events;
    props.data = series;
    props.filteredData = [...series];
    props.paginatedData = [...series];

    const dataHandler = {
      set(target, prop, value, receiver) {
        target[prop] = value;

        // Use async populateTable but don't await to avoid blocking
        populateTable(receiver, config).catch((error) => {
          window.lana?.log(`Error populating table: ${error.message}`);
        });
        updateDataCount(receiver);

        return true;
      },
    };
    const proxyProps = new Proxy(props, dataHandler);
    buildDashboardHeader(proxyProps, config);

    // Build table asynchronously
    buildDashboardTable(proxyProps, config).catch((error) => {
      window.lana?.log(`Error building dashboard table: ${error.message}`);
    });
  }

  setTimeout(() => {
    el.classList.remove('loading');
  }, 10);
}

function buildLoadingScreen(el) {
  el.classList.add('loading');
  const loadingScreen = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'loading-screen' });
  createTag('sp-progress-circle', { size: 'l', indeterminate: true }, '', { parent: loadingScreen });
  createTag('sp-field-label', {}, 'Loading event series dashboard...', { parent: loadingScreen });

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

  initProfileLogicTree('series-dashboard', {
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
