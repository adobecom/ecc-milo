import {
  createEvent,
  deleteEvent,
  getEventImages,
  getEvents,
  publishEvent,
  unpublishEvent,
} from '../../scripts/esp-controller.js';
import { LIBS } from '../../scripts/scripts.js';
import {
  getIcon,
  buildNoAccessScreen,
  getEventPageHost,
  readBlockConfig,
  signIn,
  getECCEnv,
} from '../../scripts/utils.js';
import { quickFilter } from '../form-handler/data-handler.js';
import { initProfileLogicTree } from '../../scripts/event-apis.js';

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

function buildThumbnail(data) {
  const container = createTag('td', { class: 'thumbnail-container' });

  const buildThumbnailContainer = (images) => {
    const cardImage = images.find((photo) => photo.imageKind === 'event-card-image');
    const heroImage = images.find((photo) => photo.imageKind === 'event-hero-image');
    const venueImage = images.find((photo) => photo.imageKind === 'venue-image');

    // TODO: remove after no more adobe.com images
    const imgSrc = (cardImage?.sharepointUrl
      && `${getEventPageHost()}${cardImage?.sharepointUrl.replace('https://www.adobe.com', '')}`)
    || cardImage?.imageUrl
    || (heroImage?.sharepointUrl
      && `${getEventPageHost()}${heroImage?.sharepointUrl.replace('https://www.adobe.com', '')}`)
    || heroImage?.imageUrl
    || (venueImage?.sharepointUrl
      && `${getEventPageHost()}${venueImage?.sharepointUrl.replace('https://www.adobe.com', '')}`)
    || venueImage?.imageUrl
    || images[0]?.imageUrl;

    const img = createTag('img', { class: 'event-thumbnail-img' });

    if (imgSrc) img.src = imgSrc;
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

function buildToastMsgWithEventTitle(eventTitle, configValue) {
  const msgTemplate = configValue instanceof Array ? configValue.join('<br/>') : configValue;
  return msgTemplate.replace(/\[\[(.*?)\]\]/g, eventTitle);
}

function summonConfirmationDialog(props, action) {
  const {
    heading,
    description,
    confirmText,
    cancelText,
    confirmCallback = async () => {},
    cancelCallback = async () => {},
  } = action;
  const mainContainer = props.el.querySelector('sp-theme.sp-main-container');
  if (!mainContainer) return;

  const underlay = mainContainer.querySelector('sp-underlay');
  const dialog = mainContainer.querySelector('sp-dialog');
  createTag('h1', { slot: 'heading' }, heading, { parent: dialog });
  createTag('p', {}, description, { parent: dialog });
  const buttonContainer = createTag('div', { class: 'button-container' }, '', { parent: dialog });
  const dialogConfirmBtn = createTag('sp-button', { variant: 'secondary', slot: 'button' }, confirmText, { parent: buttonContainer });
  const dialogCancelBtn = createTag('sp-button', { variant: 'cta', slot: 'button' }, cancelText, { parent: buttonContainer });

  underlay.open = true;

  dialogConfirmBtn.addEventListener('click', async () => {
    await confirmCallback();
    underlay.open = false;
    dialog.innerHTML = '';
  });

  dialogCancelBtn.addEventListener('click', async () => {
    await cancelCallback();
    underlay.open = false;
    dialog.innerHTML = '';
  });
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
        showToast(props, buildToastMsgWithEventTitle(eventObj.title, config['event-unpublished-msg']), { variant: 'positive' });
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

        showToast(props, buildToastMsgWithEventTitle(eventObj.title, config['event-published-msg']), { variant: 'positive' });
      });
    }

    const previewPre = buildTool(toolBox, 'Preview pre-event', 'preview-eye');
    const previewPost = buildTool(toolBox, 'Preview post-event', 'preview-eye');
    const edit = buildTool(toolBox, 'Edit', 'edit-pencil');
    const clone = buildTool(toolBox, 'Clone', 'clone');
    const deleteBtn = buildTool(toolBox, 'Delete', 'delete-wire-round');

    if (eventObj.detailPagePath) {
      previewPre.href = (() => {
        const url = new URL(`${getEventPageHost()}${eventObj.detailPagePath}`);
        url.searchParams.set('previewMode', 'true');
        url.searchParams.set('cachebuster', Date.now());
        url.searchParams.set('timing', +eventObj.localEndTimeMillis - 10);
        return url.toString();
      })();
      previewPre.target = '_blank';
      previewPost.href = (() => {
        const url = new URL(`${getEventPageHost()}${eventObj.detailPagePath}`);
        url.searchParams.set('previewMode', 'true');
        url.searchParams.set('cachebuster', Date.now());
        url.searchParams.set('timing', +eventObj.localEndTimeMillis + 10);
        return url.toString();
      })();
      previewPost.target = '_blank';
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
      const newJson = await getEvents();
      props.data = newJson.events;
      props.filteredData = newJson.events;
      props.paginatedData = newJson.events;
      const modTimeHeader = props.el.querySelector('th.sortable.modificationTime');
      if (modTimeHeader) {
        props.currentSort = { field: 'modificationTime', el: modTimeHeader };
        sortData(props, config, { direction: 'desc' });
      }

      const newRow = props.el.querySelector(`tr[data-event-id="${newEventJSON.eventId}"]`);
      highlightRow(newRow);
      showToast(props, buildToastMsgWithEventTitle(newEventJSON.title, config['clone-event-toast-msg']), { variant: 'info' });
    });

    // delete
    deleteBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const action = {
        heading: 'You are deleting this event.',
        description: 'Are you sure you want to do this? This cannot be undone.',
        confirmText: 'Yes, I want to delete this event',
        cancelText: 'Do not delete',
        confirmCallback: async () => {
          toolBox.remove();
          row.classList.add('pending');
          await deleteEvent(eventObj.eventId);
          const newJson = await getEvents();
          props.data = newJson.events;
          props.filteredData = newJson.events;
          props.paginatedData = newJson.events;
          sortData(props, config, { resort: true });
          showToast(props, config['delete-event-toast-msg']);
        },
        cancelCallback: async () => {
          toolBox.remove();
        },
      };

      summonConfirmationDialog(props, action);
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
function buildVenueTag(eventObj) {
  const { venue } = eventObj;
  if (!venue) return null;

  const venueTag = createTag('span', { class: 'vanue-name' }, venue.venueName);
  return venueTag;
}

function buildRSVPTag(config, eventObj) {
  const text = `${eventObj.attendeeCount} / ${eventObj.attendeeLimit}`;

  const url = new URL(`${window.location.origin}${config['attendee-dashboard-url']}`);
  url.searchParams.set('eventId', eventObj.eventId);

  const rsvpTag = createTag('a', { class: 'rsvp-tag', href: url }, text);
  return rsvpTag;
}

async function populateRow(props, config, index) {
  const event = props.paginatedData[index];
  const tBody = props.el.querySelector('table.dashboard-table tbody');
  const sp = new URLSearchParams(window.location.search);

  // TODO: build each column's element specifically rather than just text
  const row = createTag('tr', { class: 'event-row', 'data-event-id': event.eventId }, '', { parent: tBody });
  const thumbnailCell = buildThumbnail(event);
  const titleCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildEventTitleTag(config, event)));
  const statusCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildStatusTag(event)));
  const startDateCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, formatLocaleDate(event.startDate)));
  const modDateCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, formatLocaleDate(event.modificationTime)));
  const venueCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildVenueTag(event)));
  const geoCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, getCountryName(event)));
  const externalEventId = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildRSVPTag(config, event)));
  const moreOptionsCell = createTag('td', { class: 'option-col' }, createTag('div', { class: 'td-wrapper' }, getIcon('more-small-list')));

  const checkboxTd = createTag('td', { class: 'checkbox-col sticky-left' }, '', { parent: row });
  createTag('sp-checkbox', { class: 'select-checkbox' }, '', { parent: checkboxTd });

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
      showToast(props, buildToastMsgWithEventTitle(event.title, config['new-event-toast-msg']), { variant: 'positive' });

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
  if (!props.filteredData.length) return;

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
    venueName: 'VENUE NAME',
    timezone: 'GEO',
    attendeeCount: 'RSVP DATA',
    manage: 'MANAGE',
  };

  const checkboxTh = createTag('th', { class: 'checkbox-col sticky-left' }, '', { parent: thRow });
  createTag('sp-checkbox', { class: 'select-all-checkbox' }, '', { parent: checkboxTh });

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

function buildActionsArea(props, config) {
  const actionsContainer = props.el.querySelector('.dashboard-actions-container');
  const batchActionsContainer = createTag('div', { class: 'batch-actions-container' }, '', { parent: actionsContainer });

  createTag('button', { class: 'select-batch-action delete-action con-button outline hidden' }, 'Delete selected', { parent: batchActionsContainer });
  createTag('button', { class: 'select-batch-action publish-action con-button outline hidden' }, 'Publish selected', { parent: batchActionsContainer });
  createTag('button', { class: 'select-batch-action unpublish-action con-button outline hidden' }, 'Unpublish selected', { parent: batchActionsContainer });

  createTag('a', { class: 'con-button blue', href: config['create-form-url'] }, config['create-event-cta-text'], { parent: actionsContainer });
  // search input
  const searchInputWrapper = createTag('div', { class: 'search-input-wrapper' }, '', { parent: actionsContainer });
  const searchInput = createTag('input', { type: 'text', placeholder: 'Search' }, '', { parent: searchInputWrapper });
  searchInputWrapper.append(getIcon('search'));

  searchInput.addEventListener('input', () => filterData(props, config, searchInput.value));
}

function buildDashboardHeader(props, config) {
  const mainContainer = props.el.querySelector('sp-theme.sp-main-container');
  const dashboardHeader = createTag('div', { class: 'dashboard-header' });
  const textContainer = createTag('div', { class: 'dashboard-header-text' });
  const actionsContainer = createTag('div', { class: 'dashboard-actions-container' });

  createTag('h1', { class: 'dashboard-header-heading' }, 'All Events', { parent: textContainer });
  createTag('p', { class: 'dashboard-header-events-count' }, `(${props.data.length} events)`, { parent: textContainer });

  dashboardHeader.append(textContainer, actionsContainer);
  mainContainer.prepend(dashboardHeader);
  buildActionsArea(props, config);
}

function buildDashboardTable(props, config) {
  const mainContainer = props.el.querySelector('sp-theme.sp-main-container');
  const tableContainer = createTag('div', { class: 'dashboard-table-container' }, '', { parent: mainContainer });
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

function initBatchOperator(props, config) {
  const batchActionsContainer = props.el.querySelector('.batch-actions-container');
  const selectAllCheckbox = props.el.querySelector('.select-all-checkbox');
  const selectCheckboxes = props.el.querySelectorAll('.select-checkbox');

  if (!batchActionsContainer || !selectAllCheckbox || !selectCheckboxes.length) return;

  selectAllCheckbox.addEventListener('change', () => {
    selectCheckboxes.forEach((checkbox) => {
      checkbox.checked = selectAllCheckbox.checked;
      const checkedBoxes = [...selectCheckboxes].filter((cb) => cb.checked);
      const anyChecked = checkedBoxes.length > 0;

      const allPublished = checkedBoxes.every((c) => {
        const row = c.closest('tr');
        const { eventId } = row.dataset;
        return props.data.find((e) => e.eventId === eventId)?.published === true;
      }) && anyChecked;

      const allUnpublished = checkedBoxes.every((c) => {
        const row = c.closest('tr');
        const { eventId } = row.dataset;
        return props.data.find((e) => e.eventId === eventId)?.published === false;
      }) && anyChecked;

      const selectBatchActions = props.el.querySelectorAll('.select-batch-action');
      selectBatchActions.forEach((action) => {
        if (action.classList.contains('unpublish-action')) {
          action.classList.toggle('hidden', !allPublished);
        } else if (action.classList.contains('publish-action')) {
          action.classList.toggle('hidden', !allUnpublished);
        } else {
          action.classList.toggle('hidden', !anyChecked);
        }
      });
    });
  });

  selectCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const checkedBoxes = [...selectCheckboxes].filter((cb) => cb.checked);
      const allChecked = checkedBoxes.length === selectCheckboxes.length;
      const anyChecked = checkedBoxes.length > 0;

      const allPublished = checkedBoxes.every((c) => {
        const row = c.closest('tr');
        const { eventId } = row.dataset;
        return props.data.find((e) => e.eventId === eventId)?.published === true;
      }) && anyChecked;

      const allUnpublished = checkedBoxes.every((c) => {
        const row = c.closest('tr');
        const { eventId } = row.dataset;
        return props.data.find((e) => e.eventId === eventId)?.published === false;
      }) && anyChecked;

      selectAllCheckbox.checked = allChecked;
      const selectBatchActions = props.el.querySelectorAll('.select-batch-action');
      selectBatchActions.forEach((action) => {
        if (action.classList.contains('unpublish-action')) {
          action.classList.toggle('hidden', !allPublished);
        } else if (action.classList.contains('publish-action')) {
          action.classList.toggle('hidden', !allUnpublished);
        } else {
          action.classList.toggle('hidden', !anyChecked);
        }
      });
    });
  });

  // batch delete
  const deleteAction = props.el.querySelector('.delete-action');
  deleteAction.addEventListener('click', async () => {
    const checkboxes = props.el.querySelectorAll('.select-checkbox:checked');
    const eventIds = Array.from(checkboxes).map((cb) => cb.closest('tr').dataset.eventId);

    const action = {
      heading: 'You are deleting these events.',
      description: 'Are you sure you want to do this? This cannot be undone.',
      confirmText: 'Yes, I want to delete these events',
      cancelText: 'Do not delete',
      confirmCallback: async () => {
        await Promise.all(eventIds.map((id) => deleteEvent(id)));
        const newJson = await getEvents();
        props.data = newJson.events;
        props.filteredData = newJson.events;
        props.paginatedData = newJson.events;
        sortData(props, config, { resort: true });
        showToast(props, config['delete-event-toast-msg']);
      },
    };

    summonConfirmationDialog(props, action);
  });

  // batch publish
  const publishAction = props.el.querySelector('.publish-action');
  publishAction.addEventListener('click', async () => {
    const checkboxes = props.el.querySelectorAll('.select-checkbox:checked');
    const eventIds = Array.from(checkboxes).map((cb) => cb.closest('tr').dataset.eventId);

    const action = {
      heading: 'You are publishing these events.',
      description: 'Are you sure you want to do this?',
      confirmText: 'Yes, I want to publish these events',
      cancelText: 'Do not publish',
      confirmCallback: async () => {
        await Promise.all(eventIds.map((id) => publishEvent(id)));
        const newJson = await getEvents();
        props.data = newJson.events;
        props.filteredData = newJson.events;
        props.paginatedData = newJson.events;
        sortData(props, config, { resort: true });
        showToast(props, config['publish-event-toast-msg']);
      },
    };

    summonConfirmationDialog(props, action);
  });
}

async function buildDashboard(el, config) {
  createTag('sp-theme', { color: 'light', scale: 'medium', class: 'toast-area' }, '', { parent: el });
  const main = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'sp-main-container' }, '', { parent: el });
  createTag('sp-underlay', {}, '', { parent: main });
  createTag('sp-dialog', { size: 's' }, '', { parent: main });

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
        initBatchOperator(receiver, config);

        return true;
      },
    };
    const proxyProps = new Proxy(props, dataHandler);
    buildDashboardHeader(proxyProps, config);
    buildDashboardTable(proxyProps, config);
    initBatchOperator(proxyProps, config);
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
    import(`${miloLibs}/features/spectrum-web-components/dist/checkbox.js`),
  ]);

  const config = readBlockConfig(el);
  el.innerHTML = '';
  buildLoadingScreen(el);

  const sp = new URLSearchParams(window.location.search);
  const devToken = sp.get('devToken');
  if (devToken && getECCEnv() === 'dev') {
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
