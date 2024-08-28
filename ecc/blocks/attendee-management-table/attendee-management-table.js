import { getAllEventAttendees, getEvents } from '../../scripts/esp-controller.js';
import { ALLOWED_ACCOUNT_TYPES } from '../../constants/constants.js';
import { LIBS, MILO_CONFIG } from '../../scripts/scripts.js';
import { getIcon, buildNoAccessScreen, camelToSentenceCase } from '../../scripts/utils.js';
import BlockMediator from '../../scripts/deps/block-mediator.min.js';
import { SearchablePicker } from '../../components/searchable-picker/searchable-picker.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

const ATTENDEE_ATTR_KEYS = [
  'attendeeId',
  'firstName',
  'lastName',
  'email',
  'companyName',
  'jobTitle',
  'mobilePhone',
  'industry',
  'productsOfInterest',
  'companySize',
  'age',
  'jobLevel',
  'contactMethod',
];

export function cloneFilter(obj) {
  const wl = [
    'agenda',
    'topics',
    'speakers',
    'sponsors',
    'attendeeType',
    'cloudType',
    'seriesId',
    'templateId',
    'communityTopicUrl',
    'title',
    'description',
    'localStartDate',
    'localEndDate',
    'localStartTime',
    'localEndTime',
    'localStartTimeMillis',
    'localEndTimeMillis',
    'timezone',
    'showAgendaPostAttendee',
    'showVenuePostAttendee',
    'showVenueImage',
    'attendeeLimit',
    'rsvpDescription',
    'allowWaitlisting',
    'hostEmail',
    'rsvpFormFields',
    'relatedProducts',
    'venue',
  ];

  const output = {};

  wl.forEach((attr) => {
    if (attr !== undefined && attr !== null) {
      output[attr] = obj[attr];
    }
  });

  return output;
}

function toClassName(name) {
  return name && typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-')
    : '';
}

export function readBlockConfig(block) {
  return [...block.querySelectorAll(':scope>div')].reduce((config, row) => {
    if (row.children) {
      const cols = [...row.children];
      if (cols[1]) {
        const valueEl = cols[1];
        const name = toClassName(cols[0].textContent);
        if (valueEl.querySelector('a')) {
          const aArr = [...valueEl.querySelectorAll('a')];
          if (aArr.length === 1) {
            config[name] = aArr[0].href;
          } else {
            config[name] = aArr.map((a) => a.href);
          }
        } else if (valueEl.querySelector('p')) {
          const pArr = [...valueEl.querySelectorAll('p')];
          if (pArr.length === 1) {
            config[name] = pArr[0].innerHTML;
          } else {
            config[name] = pArr.map((p) => p.innerHTML);
          }
        } else config[name] = row.children[1].innerHTML;
      }
    }

    return config;
  }, {});
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

  ATTENDEE_ATTR_KEYS.forEach((key) => {
    createTag('td', {}, attendee[key] || '', { parent: row });
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

  mainContainer.querySelector('.dashboard-table-container')?.append(paginationContainer);
  updatePaginationControl(paginationContainer, props.currentPage, totalPages);
}

function initSorting(props, config) {
  const thead = props.el.querySelector('thead');
  const thRow = thead.querySelector('tr');

  ATTENDEE_ATTR_KEYS.forEach((key) => {
    const val = camelToSentenceCase(key).toUpperCase();
    const thText = createTag('span', {}, val);
    const th = createTag('th', {}, thText, { parent: thRow });

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

function buildNoResultsScreen(el, config) {
  const noSearchResultsRow = createTag('tr', { class: 'no-search-results-row' });
  const noSearchResultsCol = createTag('td', { colspan: '100%' }, getIcon('empty-dashboard'), { parent: noSearchResultsRow });
  createTag('h2', {}, config['no-attendee-results-heading'], { parent: noSearchResultsCol });
  createTag('p', {}, config['no-attendee-results-text'], { parent: noSearchResultsCol });

  el.append(noSearchResultsRow);
}

function populateTable(props, config) {
  const tBody = props.el.querySelector('table.dashboard-table tbody');
  tBody.innerHTML = '';

  if (!props.paginatedData.length) {
    buildNoResultsScreen(tBody, config);
  } else {
    const endOfPage = Math.min(+config['page-size'], props.paginatedData.length);

    for (let i = 0; i < endOfPage; i += 1) {
      populateRow(props, i);
    }

    props.el.querySelector('.pagination-container')?.remove();
    decoratePagination(props, config);
  }
}

function filterData(props, config, query) {
  const q = query.toLowerCase();
  // eslint-disable-next-line max-len
  props.filteredData = props.data.filter((e) => ATTENDEE_ATTR_KEYS.some((key) => e[key]?.toString().toLowerCase().includes(q)));
  props.currentPage = 1;
  paginateData(props, config, 1);
  sortData(props, config, { resort: true });
}

function buildDashboardHeader(props, config) {
  const dashboardHeader = createTag('div', { class: 'dashboard-header' });
  const textContainer = createTag('div', { class: 'dashboard-header-text' });
  const actionsContainer = createTag('div', { class: 'dashboard-actions-container' });

  createTag('h1', { class: 'dashboard-header-heading' }, 'All event attendees', { parent: textContainer });
  createTag('p', { class: 'dashboard-header-attendees-count' }, `(${props.data.length} attendees)`, { parent: textContainer });

  const searchInputWrapper = createTag('div', { class: 'search-input-wrapper' }, '', { parent: actionsContainer });
  const searchInput = createTag('input', { type: 'text', placeholder: 'Search' }, '', { parent: searchInputWrapper });
  searchInputWrapper.append(getIcon('search'));
  searchInput.addEventListener('input', () => filterData(props, config, searchInput.value));

  dashboardHeader.append(textContainer, actionsContainer);
  props.el.prepend(dashboardHeader);
}

function updateDashboardHeader(props) {
  const attendeesCount = props.el.querySelector('.dashboard-header-attendees-count');

  if (attendeesCount) attendeesCount.textContent = `(${props.data.length} attendees)`;
}

function buildDashboardTable(props, config) {
  const mainContainer = props.el.querySelector('.dashboard-main-container');

  if (!mainContainer) return;

  const tableContainer = createTag('div', { class: 'dashboard-table-container' }, '', { parent: mainContainer });
  const tableWrapper = createTag('div', { class: 'dashboard-table-wrapper' }, '', { parent: tableContainer });
  const table = createTag('table', { class: 'dashboard-table' }, '', { parent: tableWrapper });
  const thead = createTag('thead', {}, '', { parent: table });
  createTag('tbody', {}, '', { parent: table });
  createTag('tr', { class: 'table-header-row' }, '', { parent: thead });
  initSorting(props, config);
  populateTable(props, config);
}

async function getEventsArray() {
  const resp = await getEvents();

  if (resp.error) {
    return [];
  }

  return resp.events;
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
  createTag('sp-field-label', {}, 'Current event', { parent: eventsPickerWrapper });
  const eventsPicker = createTag('searchable-picker', {
    class: 'events-picker',
    label: 'Choose an event',
  }, '', { parent: eventsPickerWrapper });

  if (props.currentEventId) {
    eventsPicker.value = props.currentEventId;
    const event = props.events.find((e) => e.eventId === props.currentEventId);

    if (event) eventsPicker.displayValue = event.title;
  }

  eventsPicker.items = events.map((e) => ({ label: e.title, value: e.eventId }));
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

function buildDashboardSidePanel(props) {
  const mainContainer = props.el.querySelector('.dashboard-main-container');

  if (!mainContainer) return;

  const sidePanel = createTag('div', { class: 'dashboard-side-panel' }, '', { parent: mainContainer });
  buildEventPicker(props);
  createTag('sp-divider', {}, '', { parent: sidePanel });
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
}

async function buildDashboard(el, config) {
  const spTheme = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'toast-area' }, '', { parent: el });
  createTag('sp-underlay', {}, '', { parent: spTheme });
  createTag('sp-dialog', { size: 's' }, '', { parent: spTheme });
  createTag('sp-theme', { color: 'light', scale: 'medium', class: 'dashboard-main-container' }, '', { parent: el });

  const uspEventId = new URLSearchParams(window.location.search).get('eventId');
  const events = await getEventsArray();

  const props = {
    el,
    events,
    currentPage: 1,
    currentSort: {},
    currentEventId: uspEventId || '',
  };

  let data = [];

  if (props.currentEventId) {
    const resp = await getAllEventAttendees(props.currentEventId);
    if (!resp.error) data = resp;
  }

  props.data = data;
  props.filteredData = [...data];
  props.paginatedData = [...data];

  const dataHandler = {
    set(target, prop, value, receiver) {
      target[prop] = value;

      if (prop === 'data') {
        target.filteredData = [...value];
        target.paginatedData = [...value];
      }

      if (prop === 'currentEventId') {
        clearActionArea(props);
        resetSort(props);
      }

      updateDashboardHeader(props);
      populateTable(receiver, config);

      return true;
    },
  };

  const proxyProps = new Proxy(props, dataHandler);
  initCustomLitComponents();
  buildDashboardSidePanel(proxyProps);
  buildDashboardHeader(proxyProps, config);
  buildDashboardTable(proxyProps, config);
  setTimeout(() => {
    el.classList.remove('loading');
  }, 10);
}

function buildLoadingScreen(el) {
  el.classList.add('loading');
  const loadingScreen = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'loading-screen' });
  createTag('sp-progress-circle', { size: 'l', indeterminate: true }, '', { parent: loadingScreen });
  createTag('sp-field-label', {}, 'Loading Adobe Attendee Creation Console Attendee Management...', { parent: loadingScreen });

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
    import(`${miloLibs}/features/spectrum-web-components/dist/textfield.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/picker.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/divider.js`),
  ]);

  const { search } = window.location;
  const urlParams = new URLSearchParams(search);
  const devMode = urlParams.get('devMode');

  const config = readBlockConfig(el);
  el.innerHTML = '';
  buildLoadingScreen(el);
  const profile = BlockMediator.get('imsProfile');

  if (devMode === 'true' && ['stage', 'local'].includes(MILO_CONFIG.env.name)) {
    buildDashboard(el, config);
    return;
  }

  if (profile) {
    if (profile.noProfile || !ALLOWED_ACCOUNT_TYPES.includes(profile.account_type)) {
      buildNoAccessScreen(el);
    } else {
      buildDashboard(el, config);
    }

    return;
  }

  if (!profile) {
    const unsubscribe = BlockMediator.subscribe('imsProfile', ({ newValue }) => {
      if (newValue?.noProfile || !ALLOWED_ACCOUNT_TYPES.includes(newValue.account_type)) {
        buildNoAccessScreen(el);
      } else {
        buildDashboard(el, config);
      }

      unsubscribe();
    });
  }
}
