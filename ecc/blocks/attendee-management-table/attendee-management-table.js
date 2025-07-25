/* eslint-disable max-len */
import { getAllEventAttendees, getEventImages, getEventsForUser, fetchRsvpFormConfigs } from '../../scripts/esp-controller.js';
import { LIBS } from '../../scripts/scripts.js';
import {
  getIcon,
  buildNoAccessScreen,
  camelToSentenceCase,
  readBlockConfig,
  signIn,
  getEventPageHost,
} from '../../scripts/utils.js';
import SearchablePicker from '../../components/searchable-picker/searchable-picker.js';
import FilterMenu from '../../components/filter-menu/filter-menu.js';
import { getUser, initProfileLogicTree, userHasAccessToBU, userHasAccessToEvent, userHasAccessToSeries } from '../../scripts/profile.js';
import { getAttribute } from '../../scripts/data-utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

// Place these at the top so they're defined before use
const stickyColumns = ['registrationStatus', 'checkedIn'];
const SPECTRUM_COMPONENTS = [
  'theme',
  'toast',
  'button',
  'dialog',
  'underlay',
  'progress-circle',
  'textfield',
  'picker',
  'divider',
  'overlay',
  'popover',
  'link',
  'tooltip',
  'action-button',
];

// Remove the top-level cache since we'll pass it through
let rsvpConfigCache = null;

function buildAllFilterMenues(props) {
  const sidePanel = props.el.querySelector('.dashboard-side-panel');

  if (!sidePanel) return null;

  const filterMenus = props.el.querySelectorAll('.filter-menu-wrapper:not(.clear-all-wrapper)');
  filterMenus.forEach((menu) => menu.remove());

  const { currentFilters, filterMap } = props;

  const menues = Object.entries(filterMap).filter(([key, val]) => {
    if (!val.length) return null;

    const filterMenuWrapper = createTag('div', { class: 'filter-menu-wrapper' }, '', { parent: sidePanel });
    createTag('sp-field-label', {}, camelToSentenceCase(key), { parent: filterMenuWrapper });
    const filterMenu = createTag('filter-menu', {}, '', { parent: filterMenuWrapper });
    filterMenu.items = val;
    filterMenu.type = key;

    filterMenu.addEventListener('filter-change', (e) => {
      const { detail } = e;
      const { type, value } = detail;
      props.currentFilters[type] = value;

      props.currentFilters = currentFilters;
    });

    return filterMenu;
  });

  return menues;
}

function buildFilters(props) {
  const sidePanel = props.el.querySelector('.dashboard-side-panel');

  if (!sidePanel) return;

  const existingFilterMenus = sidePanel.querySelectorAll('.filter-menu-wrapper');
  existingFilterMenus.forEach((menu) => menu.remove());

  const clearAllWrapper = createTag('div', { class: 'filter-menu-wrapper clear-all-wrapper' }, '', { parent: sidePanel });
  const clearAllButton = createTag('sp-button', { variant: 'primary', size: 's' }, 'Clear all filters', { parent: clearAllWrapper });
  clearAllButton.addEventListener('click', () => {
    const { currentFilters } = props;

    Object.keys(props.filterMap).forEach((key) => {
      currentFilters[key] = [];
    });

    props.currentFilters = currentFilters;
    const menues = buildAllFilterMenues(props);
    clearAllWrapper.classList.toggle('hidden', !menues.length);
  });

  const menues = buildAllFilterMenues(props);
  clearAllWrapper.classList.toggle('hidden', !menues.length);
}

function updateFilterMap(props) {
  if (!props.columnMap) return;

  // Clear existing filter map
  props.filterMap = {};

  props.columnMap.forEach(({ key }) => {
    // Skip firstName and lastName for filters
    if (['firstName', 'lastName'].includes(key)) return;
    props.filterMap[key] = [...new Set(props.data.map((e) => e[key]))].filter((e) => e);
  });
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

async function populateRow(props, index) {
  const attendee = props.paginatedData[index];
  const tBody = props.el.querySelector('table.dashboard-table tbody');
  const row = createTag('tr', { class: 'attendee-row', 'data-attendee-id': attendee.attendeeId }, '', { parent: tBody });
  const getDisplayVal = (key) => {
    if (key === 'checkedIn') {
      return attendee[key] ? 'yes' : 'no';
    }
    if (key === 'name') {
      return `${attendee.firstName || ''} ${attendee.lastName || ''}`.trim() || '-';
    }
    return attendee[key];
  };
  props.columnMap.forEach(({ key, fallback }, i, arr) => {
    const td = createTag('td', {}, getDisplayVal(key) || fallback, { parent: row });
    if (stickyColumns.includes(key)) {
      td.classList.add(`sticky-right-${arr.length - i}`, 'actions');
    }
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

  const mainContainer = props.el.querySelector('.dashboard-main-container');

  if (!mainContainer) return;

  const totalPages = Math.ceil(props.filteredData.length / +config['page-size']);
  const paginationContainer = createTag('div', { class: 'pagination-container' });
  const chevLeft = getIcon('chev-left');
  const chevRight = getIcon('chev-right');
  const paginationText = createTag('div', { class: 'pagination-text' }, `of ${totalPages} pages`);
  const pageInput = createTag('input', { type: 'text', class: 'page-input' });

  paginationText.prepend(pageInput);
  paginationContainer.append(chevLeft, paginationText, chevRight);

  pageInput.addEventListener('keypress', (attendee) => {
    if (attendee.key === 'Enter') {
      let page = parseInt(pageInput.value, 10);
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

  mainContainer.querySelector('.dashboard-table-container')?.append(paginationContainer);
  updatePaginationControl(paginationContainer, props.currentPage, totalPages);
}

function initSorting(props, config) {
  const sortables = props.el.querySelectorAll('th.sortable');
  sortables.forEach((th) => {
    th.addEventListener('click', () => {
      if (!props.filteredData.length) return;

      sortables.forEach((h) => {
        if (th !== h) {
          h.classList.remove('active');
        }
      });
      th.classList.add('active');
      props.currentSort = {
        el: th,
        field: th.dataset.field,
      };
      sortData(props, config);
    });
  });
}

function buildTableHeaders(props, config) {
  if (!props.columnMap?.length) {
    return;
  }

  const thead = props.el.querySelector('thead');
  if (!thead) {
    return;
  }

  const thRow = thead.querySelector('tr');
  if (!thRow) {
    return;
  }

  // Sort columns to ensure sticky columns are last
  const sortedColumns = [...props.columnMap].sort((a, b) => {
    if (stickyColumns.includes(a.key) && !stickyColumns.includes(b.key)) return 1;
    if (!stickyColumns.includes(a.key) && stickyColumns.includes(b.key)) return -1;
    return 0;
  });

  sortedColumns.forEach(({ key }, i, arr) => {
    const thText = createTag('span', {}, camelToSentenceCase(key).toUpperCase());
    const th = createTag('th', {}, thText, { parent: thRow });
    th.append(getIcon('chev-down'), getIcon('chev-up'));
    if (stickyColumns.includes(key)) {
      th.classList.add('actions', `sticky-right-${arr.length - i}`);
    }
    th.classList.add('sortable');
    th.dataset.field = key;
  });

  initSorting(props, config);
}

function buildNoResultsScreen(props, config) {
  const tBody = props.el.querySelector('table.dashboard-table tbody');
  props.el.classList.add('no-results');

  const noSearchResultsRow = createTag('tr', { class: 'no-search-results-row' });
  const noSearchResultsCol = createTag('td', { colspan: '100%' }, getIcon('empty-dashboard'), { parent: noSearchResultsRow });
  createTag('h2', {}, config['no-attendee-results-heading'], { parent: noSearchResultsCol });
  createTag('p', {}, config['no-attendee-results-text'], { parent: noSearchResultsCol });

  tBody.append(noSearchResultsRow);
}

function populateTable(props, config) {
  const tBody = props.el.querySelector('table.dashboard-table tbody');
  props.el.classList.remove('no-results');
  tBody.innerHTML = '';

  if (!props.paginatedData.length) {
    buildNoResultsScreen(props, config);
  } else {
    const endOfPage = Math.min(+config['page-size'], props.paginatedData.length);

    for (let i = 0; i < endOfPage; i += 1) {
      populateRow(props, i);
    }

    props.el.querySelector('.pagination-container')?.remove();
    decoratePagination(props, config);
  }
}

function filterData(props, config) {
  const q = props.currentQuery.toLowerCase();
  props.filteredData = props.data.filter((e) => {
    const searchMatch = props.columnMap.some(({ key }) => e[key]?.toString().toLowerCase().includes(q));
    const appliedFilters = Object.entries(props.currentFilters).filter(([, val]) => val.length);
    const filterMatch = appliedFilters.every(([key, val]) => val.includes(e[key]));
    return searchMatch && filterMatch;
  });
  props.currentPage = 1;
  paginateData(props, config, 1);
  sortData(props, config, { resort: true });
}

function calculatePercentage(part, total) {
  if (total === 0) {
    return '0%';
  }
  const percentage = (part / total) * 100;
  return `${percentage.toFixed(2)}%`;
}

async function buildEventInfo(props) {
  const eventInfoContainer = props.el.querySelector('.dashboard-header-event-info');
  if (!eventInfoContainer) return;

  eventInfoContainer.innerHTML = '';
  const eventObj = props.events.find((e) => e.eventId === props.currentEventId);

  if (!eventObj) return;

  getEventImages(eventObj.eventId).then(({ images }) => {
    if (!images) return;

    const heroImgObj = images?.find((p) => p.imageKind === 'event-hero-image');
    const thumbnailImgObj = images?.find((p) => p.imageKind === 'event-thumbnail-image');
    const firstImageObj = images?.[0];

    const imgSrc = (heroImgObj?.sharepointUrl
      && `${getEventPageHost()}${heroImgObj?.sharepointUrl}`.replace('.hlx.', '.aem.')
        .replace('aem.page', 'aem.live'))
    || thumbnailImgObj?.imageUrl
    || heroImgObj?.imageUrl
    || firstImageObj?.imageUrl
    || '';

    const eventImage = createTag(
      'div',
      { class: 'event-image-container' },
      createTag('img', { class: 'event-image', src: imgSrc }),
    );

    eventInfoContainer.prepend(eventImage);
  });

  const [
    defaultLocale,
    eventType,
    attendeeCount,
    attendeeLimit,
    waitlistAttendeeCount,
  ] = [
    getAttribute(eventObj, 'defaultLocale', props.locale),
    getAttribute(eventObj, 'eventType', props.locale),
    getAttribute(eventObj, 'attendeeCount', props.locale),
    getAttribute(eventObj, 'attendeeLimit', props.locale),
    getAttribute(eventObj, 'waitlistAttendeeCount', props.locale),
  ];

  const totalAttendeeCount = +attendeeCount + (+waitlistAttendeeCount || 0);
  const infoContainer = createTag('div', { class: 'event-info-container' }, '', { parent: eventInfoContainer });
  const infoRow = createTag('div', { class: 'event-info-row' }, '', { parent: infoContainer });
  const statsRow = createTag('div', { class: 'event-stats-row' }, '', { parent: infoContainer });

  const eventTitle = getAttribute(eventObj, 'title', defaultLocale);

  [
    {
      label: 'EVENT:',
      value: eventTitle,
    },
    {
      label: 'WHEN:',
      value: new Date(eventObj.localStartTimeMillis).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    },
    {
      label: 'TYPE:',
      value: eventType,
    },
  ].forEach(({ label, value }) => {
    const infoColWrapper = createTag('div', { class: 'event-stats-col-wrapper' }, '', { parent: infoRow });
    createTag('span', { class: 'event-info-label' }, label, { parent: infoColWrapper });
    createTag('span', { class: 'event-info-value' }, value, { parent: infoColWrapper });
  });

  [
    {
      label: 'RSVPs',
      value: totalAttendeeCount || '0',
      subText: calculatePercentage(+totalAttendeeCount, +attendeeLimit),
    },
  ].forEach(({ label, value, subText }) => {
    const statsColWrapper = createTag('div', { class: 'event-stats-col-wrapper' }, '', { parent: statsRow });
    createTag('h3', { class: 'event-stats-label' }, label, { parent: statsColWrapper });
    const statsValWrapper = createTag('div', { class: 'event-stats-value-wrapper' }, '', { parent: statsColWrapper });
    createTag('p', { class: 'event-stats-value' }, value, { parent: statsValWrapper });
    createTag('p', { class: 'event-stats-subtext' }, subText, { parent: statsValWrapper });
  });
}

function buildDashboardHeader(props, config) {
  const mainContainer = props.el.querySelector('.dashboard-main-container');
  const dashboardHeader = createTag('div', { class: 'dashboard-header' });
  const headingContainer = createTag('div', { class: 'dashboard-header-text' });
  const eventInfoContainer = createTag('div', { class: 'dashboard-header-event-info' });
  const actionsContainer = createTag('div', { class: 'dashboard-actions-container' });

  const heading = createTag('h1', { class: 'dashboard-header-heading' }, 'Event report', { parent: headingContainer });

  if (config.tooltipText) {
    const toolTipTrigger = createTag('sp-action-button', { size: 's' }, getIcon('info'));
    createTag('sp-tooltip', { 'self-managed': true, variant: 'info' }, config.tooltipText, { parent: toolTipTrigger });
    heading.append(toolTipTrigger);
  }

  const searchInputWrapper = createTag('div', { class: 'search-input-wrapper' }, '', { parent: actionsContainer });
  const searchInput = createTag('input', { type: 'text', placeholder: 'Search' }, '', { parent: searchInputWrapper });
  searchInputWrapper.append(getIcon('search'));
  searchInput.addEventListener('input', () => {
    props.currentQuery = searchInput.value;
    filterData(props, config);
  });

  dashboardHeader.append(headingContainer, eventInfoContainer, actionsContainer);
  mainContainer.prepend(dashboardHeader);
  buildEventInfo(props);
}

function buildDashboardTable(props, config) {
  const dashboardBody = props.el.querySelector('.dashboard-body-container');
  if (!dashboardBody) {
    return;
  }

  // Clear any existing table
  const existingTable = dashboardBody.querySelector('.dashboard-table-container');
  if (existingTable) {
    existingTable.remove();
  }

  const tableContainer = createTag('div', { class: 'dashboard-table-container' }, '', { parent: dashboardBody });
  const tableWrapper = createTag('div', { class: 'dashboard-table-wrapper' }, '', { parent: tableContainer });
  const table = createTag('table', { class: 'dashboard-table' }, '', { parent: tableWrapper });
  const thead = createTag('thead', {}, '', { parent: table });
  createTag('tbody', {}, '', { parent: table });
  createTag('tr', { class: 'table-header-row' }, '', { parent: thead });

  if (props.columnMap?.length) {
    buildTableHeaders(props, config);
    populateTable(props, config);
  } else {
    const tBody = table.querySelector('tbody');
    const noDataRow = createTag('tr', { class: 'no-data-row' });
    createTag('td', { colspan: '100%' }, 'No columns available', { parent: noDataRow });
    tBody.append(noDataRow);
  }
}

function renderTableLoadingOverlay(props) {
  const tableContainer = props.el.querySelector('.dashboard-table-container');
  const loadingOverlay = createTag('div', { class: 'loading-overlay' });
  createTag('sp-progress-circle', { size: 'l', indeterminate: true }, '', { parent: loadingOverlay });
  tableContainer.append(loadingOverlay);
}

function removeTableLoadingOverlay(props) {
  const loadingOverlay = props.el.querySelector('.loading-overlay');
  loadingOverlay?.remove();
}

function buildEventPicker(props) {
  const { events } = props;

  if (!events?.length) return;

  const sidePanel = props.el.querySelector('.dashboard-side-panel');
  const eventsPickerWrapper = createTag('div', { class: 'events-picker-wrapper' }, '', { parent: sidePanel });
  createTag('sp-field-label', {}, 'Search other events', { parent: eventsPickerWrapper });
  const eventsPicker = createTag('searchable-picker', {
    class: 'events-picker',
    label: 'Event name',
  }, '', { parent: eventsPickerWrapper });

  if (props.currentEventId) {
    eventsPicker.value = props.currentEventId;
    const event = props.events.find((e) => e.eventId === props.currentEventId);

    const defaultLocale = event.defaultLocale || Object.keys(event.localizations)[0] || 'en-US';
    const eventTitle = getAttribute(event, 'title', defaultLocale);
    if (event) eventsPicker.displayValue = eventTitle;
  }

  eventsPicker.items = events.map((e) => {
    const defaultLocale = e.defaultLocale || Object.keys(e.localizations)[0] || 'en-US';
    const eventTitle = getAttribute(e, 'title', defaultLocale);
    return { label: eventTitle, value: e.eventId };
  });
  eventsPicker.filteredItems = eventsPicker.items;

  eventsPicker.addEventListener('picker-change', (e) => {
    const { detail } = e;
    props.currentEventId = detail.value;
    renderTableLoadingOverlay(props);
    getAllEventAttendees(props.currentEventId).then((attendees) => {
      if (!attendees.error) {
        props.data = attendees;
      }
      removeTableLoadingOverlay(props);
    });
  });
}

function updateResetFilterBtnState(props) {
  const clearAllWrapper = props.el.querySelector('.clear-all-wrapper');
  const btn = clearAllWrapper.querySelector('sp-button');
  const { currentFilters } = props;
  const hasFilters = Object.values(currentFilters).some((val) => val.length);
  btn.disabled = !hasFilters;
}

function buildBackToDashboardBtn(props, config) {
  const sidePanel = props.el.querySelector('.dashboard-side-panel');

  if (!sidePanel) return;

  const url = new URL(`${window.location.origin}${config['event-dashboard-url']}`);
  const backBtn = createTag('a', { class: 'back-btn', href: url.toString() }, 'Back', { parent: sidePanel });
  backBtn.prepend(getIcon('chev-left'));
}

function buildDashboardSidePanel(props, config) {
  const dashboardBody = props.el.querySelector('.dashboard-body-container');

  if (!dashboardBody) return;

  const sidePanel = createTag('div', { class: 'dashboard-side-panel' }, '', { parent: dashboardBody });
  buildBackToDashboardBtn(props, config);
  buildEventPicker(props);
  createTag('sp-divider', {}, '', { parent: sidePanel });
  buildFilters(props);
  updateResetFilterBtnState(props);
}

function clearActionArea(props) {
  const actionArea = props.el.querySelector('.dashboard-actions-container');
  const searchInput = actionArea.querySelector('input');
  searchInput.value = '';
}

function resetSort(props) {
  const thRow = props.el.querySelector('thead tr');
  thRow.querySelectorAll('th').forEach((th) => {
    th.classList.remove('active');
    th.classList.remove('desc-sort');
  });
}

function initCustomLitComponents() {
  customElements.define('searchable-picker', SearchablePicker);
  customElements.define('filter-menu', FilterMenu);
}

async function fetchRSVPConfig(cloudType) {
  try {
    if (!rsvpConfigCache) {
      return [];
    }

    // Find the appropriate config based on cloudType
    const configItem = rsvpConfigCache.find((c) => c.cloudType === cloudType);
    if (!configItem?.config?.data?.length) {
      return [];
    }

    // Only use rows where Type is not 'submit'
    const configColumns = configItem.config.data
      .filter((row) => row.Type !== 'submit')
      .filter((row) => !['firstName', 'lastName'].includes(row.Field)) // Remove individual name fields
      .map((row) => ({
        key: row.Field,
        label: row.Label,
        type: row.Type,
        fallback: '',
      }));

    // Add the name column at the beginning
    configColumns.unshift({
      key: 'name',
      label: 'Name',
      type: 'text',
      fallback: '',
    });

    // Add the required sticky columns if they don't exist
    const requiredColumns = [
      { key: 'registrationStatus', label: 'RSVP Status', type: 'text', fallback: 'registered' },
      { key: 'checkedIn', label: 'Checked In', type: 'text', fallback: '-' },
    ];

    // Only add if they don't already exist in the config
    requiredColumns.forEach((col) => {
      if (!configColumns.find((c) => c.key === col.key)) {
        configColumns.push(col);
      }
    });

    return configColumns;
  } catch (error) {
    return [];
  }
}

async function buildDashboard(el, config) {
  const spTheme = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'toast-area' }, '', { parent: el });
  createTag('sp-underlay', {}, '', { parent: spTheme });
  createTag('sp-dialog', { size: 's' }, '', { parent: spTheme });
  const mainContainer = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'dashboard-main-container' }, '', { parent: el });
  createTag('div', { class: 'dashboard-body-container' }, '', { parent: mainContainer });

  const uspEventId = new URLSearchParams(window.location.search).get('eventId');
  const events = await getEventsForUser();

  const props = {
    el,
    events,
    currentPage: 1,
    currentSort: {},
    currentFilters: {},
    currentQuery: '',
    currentEventId: uspEventId || '',
    showAllAttendees: false,
    columnMap: [],
    currentCloudType: '',
    filterMap: {},
  };

  let data = [];

  if (props.currentEventId) {
    const currentEvent = events.find((e) => e.eventId === props.currentEventId);
    if (!currentEvent) {
      console.error('Current event not found for ID:', props.currentEventId);
      buildNoAccessScreen(el);
      return;
    }

    const user = await getUser();
    const hasEventAccess = userHasAccessToEvent(user, props.currentEventId);
    const hasSeriesAccess = userHasAccessToSeries(user, currentEvent.seriesId);
    const hasBUAccess = userHasAccessToBU(user, currentEvent.cloudType);

    if (hasEventAccess || hasSeriesAccess || hasBUAccess) {
      const resp = await getAllEventAttendees(props.currentEventId);
      if (resp && !resp.error) {
        data = resp;
      } else {
        console.error('Failed to load attendee data:', resp?.error);
      }

      // Fetch the RSVP config based on cloudType
      props.columnMap = await fetchRSVPConfig(currentEvent.cloudType);
      props.currentCloudType = currentEvent.cloudType;

      console.log('RSVP config load results:', {
        cloudType: currentEvent.cloudType,
        columnCount: props.columnMap.length,
        columns: props.columnMap.map((c) => c.key),
      });

      if (!props.columnMap.length) {
        console.error('Failed to load column configuration for cloudType:', currentEvent.cloudType);
        buildNoAccessScreen(el);
        return;
      }
    } else {
      console.error('User does not have access to event:', {
        eventId: props.currentEventId,
        userId: user?.id,
        cloudType: currentEvent.cloudType,
      });
      buildNoAccessScreen(el);
      return;
    }
  }

  props.data = data;
  props.filteredData = [...data];
  props.paginatedData = [...data];
  updateFilterMap(props);

  const dataHandler = {
    set(target, prop, value, receiver) {
      target[prop] = value;
      if (prop === 'data') {
        target.filteredData = [...value];
        target.paginatedData = [...value];
        target.currentFilters = {};
        updateFilterMap(receiver);
        buildFilters(receiver);
        buildEventInfo(target);
      }
      if (prop === 'columnMap') {
        // When column map changes, update filter map and rebuild filters
        updateFilterMap(receiver);
        buildFilters(receiver);
        buildDashboardTable(receiver, config);
      }
      if (prop === 'currentEventId') {
        clearActionArea(target);
        resetSort(target);
        // On event change, check if cloudType changed and reload config if needed
        const newEvent = target.events.find((e) => e.eventId === value);
        if (newEvent && newEvent.cloudType !== target.currentCloudType) {
          fetchRSVPConfig(newEvent.cloudType).then((columnMap) => {
            target.columnMap = columnMap;
            target.currentCloudType = newEvent.cloudType;
            updateFilterMap(target);
            buildFilters(target);
            buildDashboardTable(target, config);
          });
        }
      }
      if (prop === 'currentFilters') {
        filterData(target, config);
      }
      populateTable(receiver, config);
      updateResetFilterBtnState(target);
      return true;
    },
  };

  const proxyProps = new Proxy(props, dataHandler);
  buildDashboardSidePanel(proxyProps, config);
  buildDashboardHeader(proxyProps, config);
  buildDashboardTable(proxyProps, config);
  initCustomLitComponents();
  setTimeout(() => {
    el.classList.remove('loading');
  }, 10);
}

function buildLoadingScreen(el) {
  el.classList.add('loading');
  const loadingScreen = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'loading-screen' });
  createTag('sp-progress-circle', { size: 'l', indeterminate: true }, '', { parent: loadingScreen });
  createTag('sp-field-label', {}, 'Loading Adobe Event Creation Console Attendee Management Table...', { parent: loadingScreen });

  el.prepend(loadingScreen);
}

export default async function init(el) {
  const miloLibs = LIBS;
  const promises = Array.from(SPECTRUM_COMPONENTS).map(async (component) => {
    await import(`${miloLibs}/features/spectrum-web-components/dist/${component}.js`);
  });
  await Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    ...promises,
  ]);

  const config = readBlockConfig(el);
  el.innerHTML = '';
  buildLoadingScreen(el);

  // Fetch RSVP configs once during initialization
  try {
    rsvpConfigCache = await fetchRsvpFormConfigs();
    if (!rsvpConfigCache?.length) {
      buildNoAccessScreen(el);
      return;
    }
  } catch (error) {
    buildNoAccessScreen(el);
    return;
  }

  await initProfileLogicTree('attendee-management-table', {
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
