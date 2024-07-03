import {
  createEvent,
  deleteEvent,
  getEvents,
  publishEvent,
  unpublishEvent,
} from '../../utils/esp-controller.js';
import { LIBS, MILO_CONFIG } from '../../scripts/scripts.js';
import { getIcon, buildNoAccessScreen } from '../../utils/utils.js';
import { quickFilter } from '../form-handler/data-handler.js';
import BlockMediator from '../../deps/block-mediator.min.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

export function cloneFilter(obj) {
  const wl = [
    'agenda',
    'topics',
    'eventType',
    'cloudType',
    'seriesId',
    'rsvpRequired',
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
    'partners',
    'showAgendaPostEvent',
    'showVenuePostEvent',
    'attendeeLimit',
    'rsvpDescription',
    'allowWaitlisting',
    'hostEmail',
    'rsvpFormFields',
    'relatedProducts',
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

function formatLocaleDate(string) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  return new Date(string).toLocaleString('en-GB', options);
}

function buildThumbnail(data) {
  // TODO: use thumbnail instead of just first image or mock image
  const img = createTag('img', { class: 'event-thumbnail-img', src: data.photos?.[0]?.imageUrl || '/ecc/icons/icon-placeholder.svg' });
  const container = createTag('td', { class: 'thumbnail-container' }, img);
  return container;
}

function updateDashboardData(newPayload, props) {
  if (!newPayload) return;

  props.data = props.data.map((event) => {
    if (event.eventId === newPayload.eventId) {
      return newPayload;
    }
    return event;
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

  if (el.classList.contains('active')) {
    if (options.resort) {
      sortAscending = !el.classList.contains('desc-sort');
    } else {
      sortAscending = el.classList.contains('desc-sort');
    }
    el.classList.toggle('desc-sort', !sortAscending);
  } else {
    el.classList.remove('desc-sort');
  }

  if (options.direction) {
    sortAscending = options.direction === 'asc';
    el.classList.toggle('desc-sort', !sortAscending);
  }

  props.filteredData = props.filteredData.sort((a, b) => {
    let valA;
    let valB;

    if (field === 'title' || field === 'venueId') {
      valA = a[field].toLowerCase();
      valB = b[field].toLowerCase();
      return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    if (field === 'startDate' || field === 'modificationTime') {
      valA = new Date(a[field]);
      valB = new Date(b[field]);
      return sortAscending ? valA - valB : valB - valA;
    }

    if (a[field] !== undefined && b[field] !== undefined) {
      valA = a[field].toString().toLowerCase();
      valB = b[field].toString().toLowerCase();
      return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    return null;
  });

  el.parentNode.querySelectorAll('th').forEach((header) => {
    if (header !== el) {
      header.classList.remove('active');
      header.classList.remove('desc-sort');
    }
  });

  props.currentPage = 1;
  paginateData(props, config, 1);
  el.classList.add('active');
}

function initMoreOptions(props, config, eventObj, row) {
  const moreOptionsCell = row.querySelector('.option-col');
  const moreOptionIcon = moreOptionsCell.querySelector('.icon-more-small-list');

  const buildTool = (parent, text, icon) => {
    const tool = createTag('a', { class: 'dash-event-tool', href: '#' }, text, { parent });
    tool.prepend(getIcon(icon));
    return tool;
  };

  moreOptionIcon.addEventListener('click', () => {
    const toolBox = createTag('div', { class: 'dashboard-event-tool-box' });

    if (eventObj.published) {
      const unpub = buildTool(toolBox, 'Unpublish', 'publish-remove');
      unpub.addEventListener('click', async (e) => {
        e.preventDefault();
        toolBox.remove();
        row.classList.add('pending');
        const resp = await unpublishEvent(eventObj.eventId, quickFilter(eventObj));
        updateDashboardData(resp, props);
      });
    } else {
      const pub = buildTool(toolBox, 'Publish', 'publish-rocket');
      pub.addEventListener('click', async (e) => {
        e.preventDefault();
        toolBox.remove();
        row.classList.add('pending');
        const resp = await publishEvent(eventObj.eventId, quickFilter(eventObj));
        updateDashboardData(resp, props);
      });
    }

    const previewPre = buildTool(toolBox, 'Preview pre-event', 'preview-eye');
    const previewPost = buildTool(toolBox, 'Preview post-event', 'preview-eye');
    const edit = buildTool(toolBox, 'Edit', 'edit-pencil');
    const clone = buildTool(toolBox, 'Clone', 'clone');
    const deleteBtn = buildTool(toolBox, 'Delete', 'delete-wire-round');

    if (eventObj.detailPagePath) {
      previewPre.href = (() => {
        const url = new URL(`${window.location.origin}${eventObj.detailPagePath}`);
        url.searchParams.set('timing', +eventObj.localEndTimeMillis - 10);
        return url.toString();
      })();
      previewPost.href = (() => {
        const url = new URL(`${window.location.origin}${eventObj.detailPagePath}`);
        url.searchParams.set('timing', +eventObj.localEndTimeMillis + 10);
        return url.toString();
      })();
    } else {
      previewPre.classList.add('disabled');
      previewPost.classList.add('disabled');
    }


    // edit
    const url = new URL(`${window.location.origin}${config['create-form-url']}`);
    url.searchParams.set('eventId', eventObj.eventId);
    edit.href = url.toString();

    // clone
    clone.addEventListener('click', async (e) => {
      e.preventDefault();
      const payload = { ...eventObj };
      payload.title = `${eventObj.title} - copy`;
      toolBox.remove();
      row.classList.add('pending');
      const newEventJSON = await createEvent(cloneFilter(payload));
      const reloadUrl = new URL(window.location.href);
      reloadUrl.searchParams.set('clonedEventId', newEventJSON.eventId);
      window.location.assign(reloadUrl.href);
    });

    deleteBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      toolBox.remove();
      row.classList.add('pending');
      await deleteEvent(eventObj.eventId);
      const newJson = await getEvents();
      props.data = newJson.events;
      props.filteredData = newJson.events;
      props.paginatedData = newJson.events;

      sortData(props, config, { resort: true });
    });

    if (!moreOptionsCell.querySelector('.dashboard-event-tool-box')) {
      moreOptionsCell.append(toolBox);
    }
  });

  document.addEventListener('click', (e) => {
    if (!moreOptionsCell.contains(e.target) || moreOptionsCell === e.target) {
      const toolBox = moreOptionsCell.querySelector('.dashboard-event-tool-box');
      toolBox?.remove();
    }
  });
}

function getTimezoneName(offsetHours) {
  const offsetMinutes = offsetHours * 60;

  const d = new Date();
  const utcDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000 + offsetMinutes * 60000);

  const options = {
    timeZone: 'UTC',
    timeZoneName: 'long',
  };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(utcDate);
  const timeZoneName = parts.find((part) => part.type === 'timeZoneName').value;

  return timeZoneName;
}

function buildStatusTag(event) {
  const dot = event.published ? getIcon('dot-purple') : getIcon('dot-green');
  const text = event.published ? 'Published' : 'Draft';

  const statusTag = createTag('div', { class: 'event-status' });
  statusTag.append(dot, text);
  return statusTag;
}

function buildEventTitleTag(event) {
  if (event.detailPagePath) {
    const eventTitleTag = createTag('a', { class: 'event-title-link', href: `${window.location.origin}${event.detailPagePath}` }, event.title);
    return eventTitleTag;
  }

  const eventTitleTag = createTag('a', { class: 'event-title-link disabled' }, event.title);
  return eventTitleTag;
}

// TODO: to retire
async function buildVenueTag(eventObj) {
  const { venue } = eventObj;
  if (!venue) return null;

  const venueTag = createTag('div', { class: 'vanue-name' }, venue.venueName);
  return venueTag;
}

function highlightRow(row) {
  row.classList.add('highlight');

  setTimeout(() => {
    row.classList.remove('highlight');
  }, 1000);
}

function buildToastMsg(eventTitle, msgTemplate) {
  return msgTemplate.replace(/\[\[(.*?)\]\]/g, eventTitle);
}

async function populateRow(props, config, index) {
  const event = props.paginatedData[index];
  const tBody = props.el.querySelector('table.dashboard-table tbody');
  const toastArea = props.el.querySelector('.toast-area');
  const sp = new URLSearchParams(window.location.search);

  // TODO: build each column's element specifically rather than just text
  const row = createTag('tr', { class: 'event-row' }, '', { parent: tBody });
  const thumbnailCell = buildThumbnail(event);
  const titleCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildEventTitleTag(event)));
  const statusCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildStatusTag(event)));
  const startDateCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, formatLocaleDate(event.startDate)));
  const modDateCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, formatLocaleDate(event.modificationTime)));
  const venueCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, await buildVenueTag(event)));
  const timezoneCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, getTimezoneName(event.gmtOffset)));
  const externalEventId = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, event.externalEventId));
  const moreOptionsCell = createTag('td', { class: 'option-col' }, createTag('div', { class: 'td-wrapper' }, getIcon('more-small-list')));

  row.append(
    thumbnailCell,
    titleCell,
    statusCell,
    startDateCell,
    modDateCell,
    venueCell,
    timezoneCell,
    externalEventId,
    moreOptionsCell,
  );

  initMoreOptions(props, config, event, row);

  if (event.eventId === sp.get('newEventId') && !props.el.classList.contains('toast-shown')) {
    const msgTemplate = config['new-event-toast-msg'] instanceof Array ? config['new-event-toast-msg'].join('<br/>') : config['new-event-toast-msg'];
    const toastMsg = buildToastMsg(event.title, msgTemplate);
    createTag('sp-toast', { open: true, variant: 'positive' }, toastMsg, { parent: toastArea });
    highlightRow(row);
    props.el.classList.add('toast-shown');
  }

  if (event.eventId === sp.get('clonedEventId') && !props.el.classList.contains('toast-shown')) {
    const msgTemplate = config['clone-event-toast-msg'] instanceof Array ? config['clone-event-toast-msg'].join('<br/>') : config['clone-event-toast-msg'];
    const toastMsg = buildToastMsg(event.title, msgTemplate);
    createTag('sp-toast', { open: true, variant: 'positive' }, toastMsg, { parent: toastArea });
    highlightRow(row);
    props.el.classList.add('toast-shown');
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
  const totalPages = Math.ceil(props.filteredData.length / +config['page-size']);
  const paginationContainer = createTag('div', { class: 'pagination-container' });
  const chevLeft = getIcon('chev-left');
  const chevRight = getIcon('chev-right');
  const paginationText = createTag('div', { class: 'pagination-text' }, `of ${totalPages} pages`);
  const pageInput = createTag('input', { type: 'text', class: 'page-input' });

  paginationText.prepend(pageInput);
  paginationContainer.append(chevLeft, paginationText, chevRight);

  pageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
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
    venueId: 'VENUE NAME',
    timezone: 'GEO',
    externalEventId: 'RSVP DATA',
    manage: 'MANAGE',
  };

  Object.entries(headers).forEach(([key, val]) => {
    const thText = createTag('span', {}, val);
    const th = createTag('th', {}, thText, { parent: thRow });

    if (['thumbnail', 'manage'].includes(key)) return;

    th.append(getIcon('chev-down'), getIcon('chev-up'));
    th.classList.add('sortable', key);
    th.addEventListener('click', () => {
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

function populateTable(props, config) {
  const spTheme = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'toast-area' });
  const tBody = props.el.querySelector('table.dashboard-table tbody');
  props.el.append(spTheme);
  tBody.innerHTML = '';

  const endOfPage = Math.min(+config['page-size'], props.paginatedData.length);

  for (let i = 0; i < endOfPage; i += 1) {
    populateRow(props, config, i);
  }

  props.el.querySelector('.pagination-container')?.remove();
  decoratePagination(props, config);
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
  createTag('p', { class: 'dashboard-header-events-count' }, `(${props.data.length} events)`, { parent: textContainer });

  const searchInputWrapper = createTag('div', { class: 'search-input-wrapper' }, '', { parent: actionsContainer });
  const searchInput = createTag('input', { type: 'text', placeholder: 'Search' }, '', { parent: searchInputWrapper });
  searchInputWrapper.append(getIcon('search'));
  createTag('a', { class: 'con-button blue', href: config['create-form-url'] }, config['create-event-cta-text'], { parent: actionsContainer });
  searchInput.addEventListener('input', () => filterData(props, config, searchInput.value));

  dashboardHeader.append(textContainer, actionsContainer);
  props.el.prepend(dashboardHeader);
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
  if (usp.get('newEventId') || usp.get('clonedEventId')) {
    const modTimeHeader = props.el.querySelector('th.sortable.modificationTime');
    if (modTimeHeader) {
      props.currentSort = { field: 'modificationTime', el: modTimeHeader };
      sortData(props, config, { direction: 'desc' });
    }
  }
}

async function getEventsArray() {
  const json = await getEvents();

  if (!json || json.errors?.length > 0) {
    return [];
  }

  return json.events;
}

function buildNoEventScreen(el, config) {
  el.classList.add('no-events');

  const h1 = createTag('h1', {}, 'All Events');
  const area = createTag('div', { class: 'no-events-area' });
  const noEventHeading = createTag('h2', {}, config['no-event-heading']);
  const noEventDescription = createTag('p', {}, config['no-event-description']);
  const cta = createTag('a', { class: 'con-button blue', href: config['create-form-url'] }, config['create-event-cta-text']);

  el.append(h1, area);
  area.append(getIcon('empty-dashboard'), noEventHeading, noEventDescription, cta);
}

async function buildDashboard(el, config) {
  const miloLibs = LIBS;
  await Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/theme.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/toast.js`),
  ]);

  const props = {
    el,
    currentPage: 1,
    currentSort: {},
  };

  const data = await getEventsArray();

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
        return true;
      },
    };
    const proxyProps = new Proxy(props, dataHandler);
    buildDashboardHeader(proxyProps, config);
    buildDashboardTable(proxyProps, config);
  }
}

export default async function init(el) {
  const { search } = window.location;
  const urlParams = new URLSearchParams(search);
  const devMode = urlParams.get('devMode');

  const config = readBlockConfig(el);
  el.innerHTML = '';
  const profile = BlockMediator.get('imsProfile');

  if (devMode === 'true' && ['stage', 'local'].includes(MILO_CONFIG.env.name)) {
    buildDashboard(el, config);
    return;
  }

  if (profile) {
    if (profile.noProfile || profile.account_type !== 'type3') {
      buildNoAccessScreen(el);
    } else {
      buildDashboard(el, config);
    }

    return;
  }

  if (!profile) {
    const unsubscribe = BlockMediator.subscribe('imsProfile', ({ newValue }) => {
      if (newValue?.noProfile || newValue.account_type !== 'type3') {
        buildNoAccessScreen(el);
      } else {
        buildDashboard(el, config);
      }

      unsubscribe();
    });
  }
}
