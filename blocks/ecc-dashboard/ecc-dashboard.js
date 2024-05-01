import { getLibs } from '../../scripts/utils.js';
import { getIcon } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

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
  const img = createTag('img', { class: 'event-thumbnail-img', src: data.photos[0].imageUrl });
  const container = createTag('td', { class: 'thumbnail-container' }, img);
  return container;
}

function initMoreOptions(eventObj, moreOptionsCell) {
  const moreOptionIcon = moreOptionsCell.querySelector('.icon-more-small-list');

  const buildTool = (parent, id, text, icon) => {
    const tool = createTag('a', { id, class: 'dash-event-tool', href: '#' }, text, { parent });
    tool.prepend(getIcon(icon));
    return tool;
  };

  moreOptionIcon.addEventListener('click', () => {
    const toolBox = createTag('div', { class: 'dashboard-event-tool-box' });
    buildTool(toolBox, 'dash-tool-edit-event', 'Edit', 'edit');
    buildTool(toolBox, 'dash-tool-review-event', 'Send for review', 'resolve-comment');

    if (eventObj.published) {
      buildTool(toolBox, 'dash-tool-unpublish-event', 'Unpublish', 'publish-remove');
    } else {
      buildTool(toolBox, 'dash-tool-publish-event', 'Publish', 'publish-check');
    }

    buildTool(toolBox, 'dash-tool-clone-event', 'Clone', 'duplicate');
    buildTool(toolBox, 'dash-tool-delete-event', 'Delete', 'delete-outline');

    // TODO: enable each tool to perform their functions.

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

function buildStatusTag(event) {
  const dot = event.published ? getIcon('dot-purple') : getIcon('dot-green');
  const text = event.published ? 'Published' : 'Draft';

  const statusTag = createTag('div', { class: 'event-status' });
  statusTag.append(dot, text);
  return statusTag;
}

function populateRow(el, event) {
  const tBody = el.querySelector('table.dashboard-table tbody');

  // TODO: build each column's element specifically rather than just text
  const row = createTag('tr', { class: 'event-row' }, '', { parent: tBody });
  const thumbnailCell = buildThumbnail(event);
  const titleCell = createTag('td', {}, event.title);
  const statusCell = createTag('td', {}, buildStatusTag(event));
  const startDateCell = createTag('td', {}, formatLocaleDate(event.startDate));
  const modDateCell = createTag('td', {}, formatLocaleDate(event.modificationTime));
  const venueCell = createTag('td', {}, event.venueId);
  const timezoneCell = createTag('td', {}, event.timezone);
  const externalEventId = createTag('td', {}, event.externalEventId);
  const moreOptionsCell = createTag('td', { class: 'option-col' }, getIcon('more-small-list'));

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

  initMoreOptions(event, moreOptionsCell);
}

function populateTable(props) {
  const tBody = props.el.querySelector('table.dashboard-table tbody');
  tBody.innerHTML = '';

  const endOfPages = Math.min(props.currentPage + 10, props.mutableData.length);

  for (let i = props.currentPage; i < endOfPages; i += 1) {
    populateRow(props.el, props.mutableData[i]);
  }
}

function filterData(props, query) {
  const q = query.toLowerCase();
  props.mutableData = props.data.filter((e) => e.title.toLowerCase().startsWith(q));
}

function sortData(props, th, field) {
  let sortAscending = true;

  if (th.classList.contains('active') && !th.classList.contains('desc-sort')) {
    sortAscending = false;
    th.classList.add('desc-sort');
  } else {
    th.classList.remove('desc-sort');
  }

  props.mutableData = props.data.sort((a, b) => {
    let valA;
    let valB;

    if (field === 'title') {
      valA = a[field].toLowerCase();
      valB = b[field].toLowerCase();
      return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } if (field === 'startDate' || field === 'modificationTime') {
      valA = new Date(a[field]);
      valB = new Date(b[field]);
      return sortAscending ? valA - valB : valB - valA;
    }
    valA = a[field].toString().toLowerCase();
    valB = b[field].toString().toLowerCase();
    return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  th.parentNode.querySelectorAll('th').forEach((header) => {
    if (header !== th) {
      header.classList.remove('active');
      header.classList.remove('desc-sort');
    }
  });
  th.classList.add('active');
}

function paginateData(props, page) {
  props.mutableData = props.data.slice((page - 1) * props.pageSize, page * props.pageSize);
}

function updatePaginationControl(pagination, currentPage, totalPages) {
  const input = pagination.querySelector('input');
  input.value = currentPage;
  const leftChevron = pagination.querySelector('.icon-chev-left');
  const rightChevron = pagination.querySelector('.icon-chev-right');
  leftChevron.style.visibility = currentPage === 1 ? 'hidden' : 'visible';
  rightChevron.style.visibility = currentPage === totalPages ? 'hidden' : 'visible';
}

function decoratePagination(props) {
  const totalPages = Math.ceil(props.mutableData.length / props.pageSize);
  const paginationContainer = createTag('div', { class: 'pagination-container' });
  const chevLeft = getIcon('chev-left');
  const chevRight = getIcon('chev-right');
  const paginationText = createTag('div', { class: 'pagination-text' }, `of ${totalPages} pages`);
  const pageInput = createTag('input', { type: 'text', class: 'page-input' });

  paginationText.prepend(pageInput);
  paginationContainer.append(chevLeft, paginationText, chevRight);

  pageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      let page = parseInt(pageInput.value, props.pageSize);
      if (page > totalPages) {
        page = totalPages;
      } else if (page < 1) {
        page = 1;
      }

      updatePaginationControl(paginationContainer, props.currentPage = page, totalPages);
      paginateData(props, page);
    }
  });

  chevLeft.addEventListener('click', () => {
    if (props.currentPage > 1) {
      updatePaginationControl(paginationContainer, props.currentPage -= 1, totalPages);
      paginateData(props, props.currentPage);
    }
  });

  chevRight.addEventListener('click', () => {
    if (props.currentPage < totalPages) {
      updatePaginationControl(paginationContainer, props.currentPage += 1, totalPages);
      paginateData(props, props.currentPage);
    }
  });

  props.el.append(paginationContainer);
  updatePaginationControl(paginationContainer, props.currentPage, totalPages);
}

function buildDashboardHeader(props) {
  const dashboardHeader = createTag('div', { class: 'dashboard-header' });
  const textContainer = createTag('div', { class: 'dashboard-header-text' });
  const actionsContainer = createTag('div', { class: 'dashboard-actions-container' });

  createTag('h1', { class: 'dashboard-header-heading' }, 'All Events', { parent: textContainer });
  createTag('p', { class: 'dashboard-header-events-count' }, `(${props.data.length} events)`, { parent: textContainer });

  const searchInput = createTag('input', { type: 'text', placeholder: 'Search' }, '', { parent: actionsContainer });
  createTag('a', { class: 'con-button blue', href: '#' }, 'Create new event', { parent: actionsContainer });
  searchInput.addEventListener('input', () => filterData(props, searchInput.value));

  dashboardHeader.append(textContainer, actionsContainer);
  props.el.prepend(dashboardHeader);
}

function buildDashboard(props) {
  const tableContainer = createTag('div', { class: 'dashboard-table-container' }, '', { parent: props.el });
  const table = createTag('table', { class: 'dashboard-table' }, '', { parent: tableContainer });
  const thead = createTag('thead', {}, '', { parent: table });
  createTag('tbody', {}, '', { parent: table });

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
  const tr = createTag('tr', { class: 'table-header-row' }, '', { parent: thead });

  Object.entries(headers).forEach(([key, val]) => {
    const thText = createTag('span', {}, val);
    const th = createTag('th', {}, thText, { parent: tr });

    if (['thumbnail', 'manage'].includes(key)) return;

    th.append(getIcon('chev-down'), getIcon('chev-up'));
    th.classList.add('sortable');
    th.addEventListener('click', () => {
      thead.querySelectorAll('th').forEach((h) => {
        if (th !== h) {
          h.classList.remove('active');
        }
      });
      th.classList.add('active');
      sortData(props, th, key);
    });
  });

  decoratePagination(props);
  populateTable(props);
}

async function getEventsData() {
  const json = await fetch('/blocks/ecc-dashboard/mock.json').then((resp) => resp.json()).catch((error) => console.log(error));

  return json;
}

export default async function init(el) {
  const dataHandler = {
    set(target, prop, value) {
      target[prop] = value;
      populateTable(target);
      return true;
    },
  };

  const data = await getEventsData();

  const props = {
    el,
    data,
    mutableData: [...data],
    currentPage: 1,
    pageSize: 10,
  };

  const proxyProps = new Proxy(props, dataHandler);
  buildDashboardHeader(proxyProps);
  buildDashboard(proxyProps);
}
