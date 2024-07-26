import {
  createEvent,
  deleteEvent,
  getEventImages,
  getEvents,
  publishEvent,
  unpublishEvent,
} from '../../scripts/esp-controller.js';
import { LIBS, MILO_CONFIG } from '../../scripts/scripts.js';
import { getIcon, buildNoAccessScreen, getEventPageHost } from '../../scripts/utils.js';
import { quickFilter } from '../form-handler/data-handler.js';
import BlockMediator from '../../scripts/deps/block-mediator.min.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

export function cloneFilter(obj) {
  const wl = [
    'agenda',
    'topics',
    'speakers',
    'sponsors',
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
    'showAgendaPostEvent',
    'showVenuePostEvent',
    'showVenueImage',
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

function buildThumbnail(data) {
  const container = createTag('td', { class: 'thumbnail-container' });

  const buildThumbnailContainer = (images) => {
    const cardImage = images.find((photo) => photo.imageKind === 'event-card-image');
    const heroImage = images.find((photo) => photo.imageKind === 'event-hero-image');
    const venueImage = images.find((photo) => photo.imageKind === 'venue-image');

    const img = createTag('img', {
      class: 'event-thumbnail-img',
      src: (cardImage?.sharepointUrl && cardImage?.sharepointUrl.replace('https://www.adobe.com', getEventPageHost(data.published)))
      || cardImage?.imageUrl
      || (heroImage?.sharepointUrl && cardImage?.sharepointUrl.replace('https://www.adobe.com', getEventPageHost(data.published)))
      || heroImage?.imageUrl
      || (venueImage?.sharepointUrl && cardImage?.sharepointUrl.replace('https://www.adobe.com', getEventPageHost(data.published)))
      || venueImage?.imageUrl
      || images[0]?.imageUrl
      || '/ecc/icons/icon-placeholder.svg',
    });
    container.append(img);
  };

  if (data.photos) {
    buildThumbnailContainer(data.photos);
  } else {
    getEventImages(data.eventId).then(({ images }) => {
      if (!images) return;
      buildThumbnailContainer(images);
    });
  }

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

    if ((field === 'title' || field === 'venueId')) {
      valA = a[field]?.toLowerCase() || '';
      valB = b[field]?.toLowerCase() || '';
      return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    if (field === 'startDate' || field === 'modificationTime') {
      valA = new Date(a[field]);
      valB = new Date(b[field]);
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

function buildToastMsg(eventTitle, msgTemplate) {
  return msgTemplate.replace(/\[\[(.*?)\]\]/g, eventTitle);
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

        sortData(props, config, { resort: true });
      });
    } else {
      const pub = buildTool(toolBox, 'Publish', 'publish-rocket');
      if (!eventObj.detailPagePath) pub.classList.add('disabled');
      pub.addEventListener('click', async (e) => {
        e.preventDefault();
        toolBox.remove();
        row.classList.add('pending');
        const resp = await publishEvent(eventObj.eventId, quickFilter(eventObj));
        updateDashboardData(resp, props);

        sortData(props, config, { resort: true });
      });
    }

    const previewPre = buildTool(toolBox, 'Preview pre-event', 'preview-eye');
    const previewPost = buildTool(toolBox, 'Preview post-event', 'preview-eye');
    const edit = buildTool(toolBox, 'Edit', 'edit-pencil');
    const clone = buildTool(toolBox, 'Clone', 'clone');
    const deleteBtn = buildTool(toolBox, 'Delete', 'delete-wire-round');

    if (eventObj.detailPagePath) {
      previewPre.href = (() => {
        const url = new URL(`${getEventPageHost(eventObj.published)}${eventObj.detailPagePath}`);
        url.searchParams.set('timing', +eventObj.localEndTimeMillis - 10);
        return url.toString();
      })();
      previewPost.href = (() => {
        const url = new URL(`${getEventPageHost(eventObj.published)}${eventObj.detailPagePath}`);
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
      const spTheme = props.el.querySelector('sp-theme');
      const payload = { ...eventObj };
      payload.title = `${eventObj.title} - copy`;
      toolBox.remove();
      row.classList.add('pending');
      const newEventJSON = await createEvent(cloneFilter(payload));
      const newJson = await getEvents();
      props.data = newJson.events;
      props.filteredData = newJson.events;
      props.paginatedData = newJson.events;
      const modTimeHeader = props.el.querySelector('th.sortable.modificationTime');
      if (modTimeHeader) {
        props.currentSort = { field: 'modificationTime', el: modTimeHeader };
        sortData(props, config, { direction: 'desc' });
      }
      const msgTemplate = config['clone-event-toast-msg'] instanceof Array ? config['clone-event-toast-msg'].join('<br/>') : config['clone-event-toast-msg'];
      const toastMsg = buildToastMsg(newEventJSON.title, msgTemplate);
      createTag('sp-toast', { open: true, variant: 'info' }, toastMsg, { parent: spTheme });
      const newRow = props.el.querySelector(`tr[data-event-id="${newEventJSON.eventId}"]`);
      highlightRow(newRow);
    });

    // delete
    deleteBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const spTheme = props.el.querySelector('sp-theme');
      if (!spTheme) return;

      const underlay = spTheme.querySelector('sp-underlay');
      const dialog = spTheme.querySelector('sp-dialog');
      createTag('h1', { slot: 'heading' }, 'You are deleting this event.', { parent: dialog });
      createTag('p', {}, 'Are you sure you want to do this? This cannot be undone.', { parent: dialog });
      const buttonContainer = createTag('div', { class: 'button-container' }, '', { parent: dialog });
      const dialogDeleteBtn = createTag('sp-button', { variant: 'secondary', slot: 'button' }, 'Yes, I want to delete this event', { parent: buttonContainer });
      const dialogCancelBtn = createTag('sp-button', { variant: 'cta', slot: 'button' }, 'Do not delete', { parent: buttonContainer });

      underlay.open = true;

      dialogDeleteBtn.addEventListener('click', async () => {
        toolBox.remove();
        underlay.open = false;
        dialog.innerHTML = '';
        row.classList.add('pending');
        await deleteEvent(eventObj.eventId);
        const newJson = await getEvents();
        props.data = newJson.events;
        props.filteredData = newJson.events;
        props.paginatedData = newJson.events;

        sortData(props, config, { resort: true });
        createTag('sp-toast', { open: true }, config['delete-event-toast-msg'], { parent: spTheme });
      });

      dialogCancelBtn.addEventListener('click', () => {
        toolBox.remove();
        underlay.open = false;
        dialog.innerHTML = '';
      });
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

function getCountryName(eventObj) {
  if (!eventObj.venue) return '';

  const { venue } = eventObj;
  return venue.country || '';
}

function buildStatusTag(event) {
  const dot = event.published ? getIcon('dot-purple') : getIcon('dot-green');
  const text = event.published ? 'Published' : 'Draft';

  const statusTag = createTag('div', { class: 'event-status' });
  statusTag.append(dot, text);
  return statusTag;
}

function buildEventTitleTag(config, eventObj) {
  const url = new URL(`${window.location.origin}${config['create-form-url']}`);
  url.searchParams.set('eventId', eventObj.eventId);
  const eventTitleTag = createTag('a', { class: 'event-title-link', href: url.toString() }, eventObj.title);
  return eventTitleTag;
}

// TODO: to retire
function buildVenueTag(config, eventObj) {
  const { venue } = eventObj;
  if (!venue) return null;

  const url = new URL(`${window.location.origin}${config['create-form-url']}`);
  url.searchParams.set('eventId', eventObj.eventId);

  const venueTag = createTag('a', { class: 'vanue-name', href: url.toString() }, venue.venueName);
  return venueTag;
}

function buildRSVPTag(config, eventObj) {
  let text = 'RSVP';
  if (eventObj.externalEventId?.startsWith('st')) text = 'SplashThat';

  const url = new URL(`${window.location.origin}${config['create-form-url']}`);
  url.searchParams.set('eventId', eventObj.eventId);

  const rsvpTag = createTag('a', { class: 'rsvp-tag', href: `${url.toString()}#form-step-rsvp` }, text);
  return rsvpTag;
}

async function populateRow(props, config, index) {
  const event = props.paginatedData[index];
  const tBody = props.el.querySelector('table.dashboard-table tbody');
  const toastArea = props.el.querySelector('.toast-area');
  const sp = new URLSearchParams(window.location.search);

  // TODO: build each column's element specifically rather than just text
  const row = createTag('tr', { class: 'event-row', 'data-event-id': event.eventId }, '', { parent: tBody });
  const thumbnailCell = buildThumbnail(event);
  const titleCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildEventTitleTag(config, event)));
  const statusCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildStatusTag(event)));
  const startDateCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, formatLocaleDate(event.startDate)));
  const modDateCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, formatLocaleDate(event.modificationTime)));
  const venueCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildVenueTag(config, event)));
  const geoCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, getCountryName(event)));
  const externalEventId = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildRSVPTag(config, event)));
  const moreOptionsCell = createTag('td', { class: 'option-col' }, createTag('div', { class: 'td-wrapper' }, getIcon('more-small-list')));

  row.append(
    thumbnailCell,
    titleCell,
    statusCell,
    startDateCell,
    modDateCell,
    venueCell,
    geoCell,
    externalEventId,
    moreOptionsCell,
  );

  initMoreOptions(props, config, event, row);

  if (event.eventId === sp.get('newEventId')) {
    if (!props.el.classList.contains('toast-shown')) {
      const msgTemplate = config['new-event-toast-msg'] instanceof Array ? config['new-event-toast-msg'].join('<br/>') : config['new-event-toast-msg'];
      const toastMsg = buildToastMsg(event.title, msgTemplate);
      createTag('sp-toast', { class: 'new-event-confirmation-toast', open: true, variant: 'positive' }, toastMsg, { parent: toastArea });

      props.el.classList.add('toast-shown');
    }

    if (props.el.querySelector('.new-event-confirmation-toast')?.open === true) highlightRow(row);
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
  const tBody = props.el.querySelector('table.dashboard-table tbody');
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
  if (usp.get('newEventId')) {
    const modTimeHeader = props.el.querySelector('th.sortable.modificationTime');
    if (modTimeHeader) {
      props.currentSort = { field: 'modificationTime', el: modTimeHeader };
      sortData(props, config, { direction: 'desc' });
    }
  }
}

async function getEventsArray() {
  const resp = await getEvents();

  if (resp.error) {
    return [];
  }

  return resp.events;
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
    import(`${miloLibs}/features/spectrum-web-components/dist/button.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/dialog.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/underlay.js`),
  ]);

  const spTheme = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'toast-area' }, '', { parent: el });
  createTag('sp-underlay', {}, '', { parent: spTheme });
  createTag('sp-dialog', { size: 's' }, '', { parent: spTheme });

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
