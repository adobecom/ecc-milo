import {
  createEvent,
  deleteEvent,
  getEventImages,
  getEventsForUser,
  getSpeaker,
  getEventSpeakers,
  getEventVenue,
  getEventHistory,
  getLocales,
  publishEvent,
  unpublishEvent,
  getSeriesById,
} from '../../scripts/esp-controller.js';
import { LIBS } from '../../scripts/scripts.js';
import {
  getIcon,
  buildNoAccessScreen,
  getEventPageHost,
  readBlockConfig,
  signIn,
} from '../../scripts/utils.js';

import { initProfileLogicTree } from '../../scripts/profile.js';
import { cloneFilter, eventObjFilter } from './dashboard-utils.js';
import { getAttribute, setEventAttribute } from '../../scripts/data-utils.js';
import { EVENT_TYPES } from '../../scripts/constants.js';

// API Cache and Throttling System (functional approach)
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

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function showToast(props, msg, options = {}) {
  const toastArea = props.el.querySelector('sp-theme.toast-area');
  const toast = createTag('sp-toast', { open: true, ...options }, msg, { parent: toastArea });
  toast.addEventListener('close', () => {
    toast.remove();
  });
}

function formatLocaleDate(string) {
  // MM/DD/YYYY
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
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

function buildThumbnail(data) {
  const container = createTag('td', { class: 'thumbnail-container' });
  const thumbnailLoader = createSwipingLoader('full-height-loader');
  container.append(thumbnailLoader);

  const buildThumbnailContainer = (images) => {
    const cardImage = images.find((photo) => photo.imageKind === 'event-card-image');
    const heroImage = images.find((photo) => photo.imageKind === 'event-hero-image');
    const venueImage = images.find((photo) => photo.imageKind === 'venue-image');

    // TODO: Remember to remove the replace('https://www.adobe.com', '') once the images are returned with relative paths
    const imgSrc = (cardImage?.sharepointUrl
      && `${getEventPageHost()}${cardImage?.sharepointUrl
        .replace('https://www.adobe.com', '')
      }`.replace('.hlx.', '.aem.')
        .replace('aem.page', 'aem.live'))
    || cardImage?.imageUrl
    || (heroImage?.sharepointUrl
      && `${getEventPageHost()}${heroImage?.sharepointUrl
        .replace('https://www.adobe.com', '')
      }`.replace('.hlx.', '.aem.')
        .replace('aem.page', 'aem.live'))
    || heroImage?.imageUrl
    || (venueImage?.sharepointUrl
      && `${getEventPageHost()}${venueImage?.sharepointUrl
        .replace('https://www.adobe.com', '')
      }`.replace('.hlx.', '.aem.')
        .replace('aem.page', 'aem.live'))
    || venueImage?.imageUrl
    || images[0]?.imageUrl;

    const img = createTag('img', { class: 'event-thumbnail-img hidden' });

    if (imgSrc) {
      img.src = imgSrc;
    } else {
      thumbnailLoader.remove();
      img.classList.remove('hidden');
    }

    container.append(img);

    return img;
  };

  if (data.photos) {
    const img = buildThumbnailContainer(data.photos);
    img.addEventListener('load', () => {
      img.classList.remove('hidden');
      thumbnailLoader.remove();
    });
  } else {
    apiCache.get(getEventImages, data.eventId).then(({ images }) => {
      if (!images) {
        thumbnailLoader.remove();
        return;
      }

      const img = buildThumbnailContainer(images);
      img.addEventListener('load', () => {
        img.classList.remove('hidden');
        thumbnailLoader.remove();
      });
    });
  }

  if (data.isPrivate) {
    const privateIcon = getIcon('invisible-eye');
    container.append(privateIcon);
  }

  return container;
}

function updateDashboardData(newPayload, props) {
  if (!newPayload) return;

  // Invalidate cache for this specific event
  apiCache.invalidate(newPayload.eventId);

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

    if ((field === 'title')) {
      const defaultLocale = a.defaultLocale || Object.keys(a.localizations)[0] || 'en-US';
      const eventTitleA = getAttribute(a, 'title', defaultLocale);
      const eventTitleB = getAttribute(b, 'title', defaultLocale);
      valA = eventTitleA?.toLowerCase() || '';
      valB = eventTitleB?.toLowerCase() || '';
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

function getEventEditUrl(config, eventObj) {
  const url = new URL(`${window.location.origin}${eventObj.eventType === EVENT_TYPES.WEBINAR ? config['webinar-form-url'] : config['create-form-url']}`);
  url.searchParams.set('eventId', eventObj.eventId);
  return url;
}

function buildToastMsgWithEventTitle(event, configValue) {
  const defaultLocale = event.defaultLocale || Object.keys(event.localizations)[0] || 'en-US';
  const eventTitle = getAttribute(event, 'title', defaultLocale);
  const msgTemplate = configValue instanceof Array ? configValue.join('<br/>') : configValue;

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
        const resp = await unpublishEvent(eventObj.eventId, eventObjFilter(eventObj));

        if (resp.error) {
          row.classList.remove('pending');
          showToast(props, 'Failed to unpublish event. Please try again later.', { variant: 'negative' });
          return;
        }

        updateDashboardData(resp, props);

        sortData(props, config, { resort: true });

        showToast(props, buildToastMsgWithEventTitle(eventObj, config['event-unpublished-msg']), { variant: 'positive' });
      });
    } else {
      const pub = buildTool(toolBox, 'Publish', 'publish-rocket');
      if (!eventObj.detailPagePath) pub.classList.add('disabled');
      pub.addEventListener('click', async (e) => {
        e.preventDefault();
        toolBox.remove();
        row.classList.add('pending');
        const resp = await publishEvent(eventObj.eventId, eventObjFilter(eventObj));

        if (resp.error) {
          row.classList.remove('pending');
          showToast(props, 'Failed to publish event. Please try again later.', { variant: 'negative' });
          return;
        }

        updateDashboardData(resp, props);

        sortData(props, config, { resort: true });

        showToast(props, buildToastMsgWithEventTitle(eventObj, config['event-published-msg']), { variant: 'positive' });
      });
    }

    const previewPre = buildTool(toolBox, 'Preview pre-event', 'preview-eye');
    const previewPost = buildTool(toolBox, 'Preview post-event', 'preview-eye');
    const copyUrl = buildTool(toolBox, 'Copy URL', 'copy');
    const edit = buildTool(toolBox, 'Edit', 'edit-pencil');
    const clone = buildTool(toolBox, 'Clone', 'clone');
    const deleteBtn = buildTool(toolBox, 'Delete', 'delete-wire-round');

    if (eventObj.detailPagePath) {
      previewPre.href = (() => {
        let url;

        try {
          url = new URL(`${eventObj.detailPagePath}`);
        } catch (e) {
          url = new URL(`${getEventPageHost()}${eventObj.detailPagePath}`);
        }

        if (url) {
          url.searchParams.set('previewMode', 'true');
          url.searchParams.set('cachebuster', Date.now());
          url.searchParams.set('timing', +eventObj.localEndTimeMillis - 10);
          return url.toString();
        }
        return '#';
      })();
      previewPre.target = '_blank';

      previewPost.href = (() => {
        let url;
        try {
          url = new URL(`${eventObj.detailPagePath}`);
        } catch (e) {
          url = new URL(`${getEventPageHost()}${eventObj.detailPagePath}`);
        }

        if (url) {
          url.searchParams.set('previewMode', 'true');
          url.searchParams.set('cachebuster', Date.now());
          url.searchParams.set('timing', +eventObj.localEndTimeMillis + 10);
          return url.toString();
        }

        return '#';
      })();
      previewPost.target = '_blank';

      copyUrl.addEventListener('click', (e) => {
        let url;
        try {
          url = new URL(`${eventObj.detailPagePath}`);
        } catch (err) {
          url = new URL(`${getEventPageHost()}${eventObj.detailPagePath}`);
        }

        if (url) {
          e.preventDefault();
          navigator.clipboard.writeText(url.href);
          showToast(props, config['copy-url-toast-msg'] || 'The URL has been added to the clipboard', { variant: 'positive', timeout: 6000 });
        }
      });
    } else {
      previewPre.classList.add('disabled');
      previewPost.classList.add('disabled');
      copyUrl.classList.add('disabled');
    }

    // edit
    const url = getEventEditUrl(config, eventObj);
    edit.href = url.toString();

    // clone
    clone.addEventListener('click', async (e) => {
      e.preventDefault();
      const payload = { ...eventObj };
      const cloneTitle = `${getAttribute(eventObj, 'title', payload.defaultLocale || 'en-US')} - copy`;
      const cloneEnTitle = `${getAttribute(eventObj, 'enTitle', payload.defaultLocale || 'en-US')} - copy`;
      setEventAttribute(payload, 'title', cloneTitle, payload.defaultLocale || 'en-US');
      setEventAttribute(payload, 'enTitle', cloneEnTitle, payload.defaultLocale || 'en-US');
      toolBox.remove();
      row.classList.add('pending');
      const newEventJSON = await createEvent({ ...cloneFilter(payload), published: false }, payload.defaultLocale || 'en-US');

      if (newEventJSON.error) {
        row.classList.remove('pending');
        showToast(props, newEventJSON.error, { variant: 'negative' });
        return;
      }

      const newJson = await getEventsForUser();
      props.data = newJson;
      props.filteredData = newJson;
      props.paginatedData = newJson;

      const modTimeHeader = props.el.querySelector('th.sortable.modificationTime');
      if (modTimeHeader) {
        props.currentSort = { field: 'modificationTime', el: modTimeHeader };
        sortData(props, config, { direction: 'desc' });
      }

      const newRow = props.el.querySelector(`tr[data-event-id="${newEventJSON.eventId}"]`);
      highlightRow(newRow);
      showToast(props, buildToastMsgWithEventTitle(newEventJSON, config['clone-event-toast-msg']), { variant: 'info' });
    });

    // delete
    deleteBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const spTheme = props.el.querySelector('sp-theme.toast-area');
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
        const resp = await deleteEvent(eventObj.eventId);

        if (!resp.ok) {
          row.classList.remove('pending');
          showToast(props, 'Failed to delete event. Please try again later.', { variant: 'negative' });
          return;
        }

        // Invalidate cache for deleted event
        apiCache.invalidate(eventObj.eventId);

        const newJson = props.data.filter((event) => event.eventId !== eventObj.eventId);

        props.data = newJson;
        props.filteredData = newJson;
        props.paginatedData = newJson;

        sortData(props, config, { resort: true });
        showToast(props, config['delete-event-toast-msg']);
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

function getEventDefaultLanguage(eventObj, locales) {
  if (!eventObj.localizations) return locales['en-US'] || 'English, United States';

  const { defaultLocale, localizations } = eventObj;
  const defaultLocaleKey = defaultLocale || Object.keys(localizations)[0];

  if (!defaultLocaleKey) return locales['en-US'] || 'English, United States';
  const firstKeyLocale = locales[defaultLocaleKey];
  return firstKeyLocale || 'English, United States';
}

function buildStatusTag(event) {
  const eventPublished = event.published;
  const dot = eventPublished ? getIcon('dot-purple') : getIcon('dot-green');
  const text = eventPublished ? 'Published' : 'Draft';

  const statusTag = createTag('div', { class: 'event-status' });
  statusTag.append(dot, text);
  return statusTag;
}

async function buildContributorTag(event) {
  const eventSpeakers = await apiCache.get(getEventSpeakers, event.eventId);

  const contributorTag = createTag('div', { class: 'contributor' });
  const contributor = eventSpeakers.speakers?.[0];

  if (!contributor) return 'N/A';

  const contributorDets = await apiCache.get(getSpeaker, event.seriesId, contributor.speakerId);

  contributorTag.textContent = `${contributorDets.firstName || ''} ${contributorDets.lastName || ''}`;
  return contributorTag;
}

async function buildSeriesTag(event) {
  const series = await apiCache.get(getSeriesById, event.seriesId);
  const seriesTag = createTag('div', { class: 'series' });
  seriesTag.textContent = series.seriesName;
  return seriesTag;
}

function buildEventTitleTag(config, eventObj) {
  const url = getEventEditUrl(config, eventObj);

  const defaultLocale = eventObj.defaultLocale || Object.keys(eventObj.localizations)[0] || 'en-US';
  const eventTitle = getAttribute(eventObj, 'title', defaultLocale);
  const eventTitleTag = createTag('a', { class: 'event-title-link', href: url.toString() }, eventTitle);
  return eventTitleTag;
}

function buildVenueTag(eventObj) {
  return apiCache.get(getEventVenue, eventObj.eventId).then((venue) => {
    if (!venue) return 'N/A';

    const venueTag = createTag('span', { class: 'vanue-name' }, venue.venueName);
    return venueTag;
  });
}

function buildRSVPTag(config, eventObj) {
  const text = `${eventObj.attendeeCount} / ${eventObj.attendeeLimit}`;

  const url = new URL(`${window.location.origin}${config['attendee-dashboard-url']}`);
  url.searchParams.set('eventId', eventObj.eventId);

  const rsvpTag = createTag('a', { class: 'rsvp-tag', href: url }, text);
  return rsvpTag;
}

function buildRSVPCell(config, event) {
  const container = createTag('td', { class: 'rsvp-container' });
  const rsvpTag = buildRSVPTag(config, event);
  container.append(createTag('div', { class: 'td-wrapper' }, rsvpTag));
  return container;
}

// Lazy loading for table rows
function createLazyRow(props, config, event) {
  const tBody = props.el.querySelector('table.dashboard-table tbody');
  const sp = new URLSearchParams(window.location.search);

  const row = createTag('tr', { class: 'event-row', 'data-event-id': event.eventId }, '', { parent: tBody });

  // Create basic cells first (no API calls)
  const thumbnailCell = createTag('td', { class: 'thumbnail-container' }, createSwipingLoader('full-height-loader'));
  const titleCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildEventTitleTag(config, event)));
  const statusCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, buildStatusTag(event)));
  const contributorCell = createTag('td', { class: 'contributor-container' }, createTag('div', { class: 'td-wrapper' }, createSwipingLoader('single-line-loader')));
  const seriesCell = createTag('td', { class: 'series-container' }, createTag('div', { class: 'td-wrapper' }, createSwipingLoader('single-line-loader')));
  const startDateCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, formatLocaleDate(event.startDate)));
  const venueCell = createTag('td', { class: 'venue-container' }, createTag('div', { class: 'td-wrapper' }, createSwipingLoader('single-line-loader')));
  const langCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, getEventDefaultLanguage(event, config.locales)));
  const rsvpCell = buildRSVPCell(config, event);
  const creatorCell = createTag('td', { class: 'creator-container' }, createTag('div', { class: 'td-wrapper' }, createSwipingLoader('single-line-loader')));
  const modifierCell = createTag('td', { class: 'modifier-container' }, createTag('div', { class: 'td-wrapper' }, createSwipingLoader('single-line-loader')));
  const modDateCell = createTag('td', {}, createTag('div', { class: 'td-wrapper' }, formatLocaleDate(event.modificationTime)));
  const createdByCell = createTag('td', { class: 'publishedTime-container' }, createTag('div', { class: 'td-wrapper' }, createSwipingLoader('single-line-loader')));
  const moreOptionsCell = createTag('td', { class: 'option-col' }, createTag('div', { class: 'td-wrapper' }, getIcon('more-small-list')));

  row.append(
    thumbnailCell,
    titleCell,
    statusCell,
    contributorCell,
    seriesCell,
    startDateCell,
    venueCell,
    langCell,
    rsvpCell,
    creatorCell,
    modifierCell,
    modDateCell,
    createdByCell,
    moreOptionsCell,
  );

  initMoreOptions(props, config, event, row);

  if (event.eventId === sp.get('newEventId')) {
    if (!props.el.classList.contains('toast-shown')) {
      showToast(props, buildToastMsgWithEventTitle(event, config['new-event-toast-msg']), { variant: 'positive' });
      props.el.classList.add('toast-shown');
    }
    if (props.el.querySelector('.new-event-confirmation-toast')?.open === true) highlightRow(row);
  }

  return row;
}

// Load data for a specific row
async function loadRowData(row, event) {
  const thumbnailCell = row.querySelector('.thumbnail-container');
  const contributorCell = row.querySelector('.contributor-container .td-wrapper');
  const seriesCell = row.querySelector('.series-container .td-wrapper');
  const venueCell = row.querySelector('.venue-container .td-wrapper');
  const creatorCell = row.querySelector('.creator-container .td-wrapper');
  const modifierCell = row.querySelector('.modifier-container .td-wrapper');
  const createdByCell = row.querySelector('.publishedTime-container .td-wrapper');

  // Load thumbnail
  const thumbnail = buildThumbnail(event);
  thumbnailCell.innerHTML = '';
  thumbnailCell.append(thumbnail);

  // Load contributor data
  buildContributorTag(event).then((contributorTag) => {
    contributorCell.innerHTML = '';
    contributorCell.append(contributorTag);
  });

  // Load series data
  buildSeriesTag(event).then((seriesTag) => {
    seriesCell.innerHTML = '';
    seriesCell.append(seriesTag);
  });

  // Load venue data
  buildVenueTag(event).then((venueTag) => {
    venueCell.innerHTML = '';
    venueCell.append(venueTag);
  });

  // Load history data
  const historyPromises = [
    { cell: creatorCell, type: 'creator' },
    { cell: modifierCell, type: 'modifier' },
    { cell: createdByCell, type: 'publishedTime' },
  ];

  historyPromises.forEach(({ cell, type }) => {
    apiCache.get(getEventHistory, event.eventId).then((response) => {
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
        publishedTime: {
          target: history.find((h) => h.diff?.updated?.published),
          getValue: (target) => (target?.timestamp ? formatLocaleDate(target.timestamp) : 'N/A'),
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
        window.lana?.log(`Error processing history data for event ${event.eventId}, type ${type}: ${error.message}`);
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

  pageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
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

  props.el.append(paginationContainer);
  updatePaginationControl(paginationContainer, props.currentPage, totalPages);
}

function initSorting(props, config) {
  const thead = props.el.querySelector('thead');
  const thRow = thead.querySelector('tr');

  const headers = {
    thumbnail: { text: '', sortable: false },
    title: { text: 'EVENT NAME', sortable: true },
    published: { text: 'PUBLISH STATUS', sortable: true },
    contributor: { text: 'CONTRIBUTOR', sortable: false },
    series: { text: 'SERIES', sortable: false },
    startDate: { text: 'DATE RUN | (MM/DD/YYYY)', sortable: true },
    venueName: { text: 'VENUE NAME', sortable: false },
    language: { text: 'LANGUAGE', sortable: true },
    attendeeCount: { text: 'RSVP DATA', sortable: true },
    createdBy: { text: 'CREATOR', sortable: false },
    modifiedBy: { text: 'MODIFIER', sortable: false },
    modificationTime: { text: 'LAST MODIFIED | (MM/DD/YYYY)', sortable: true },
    publishTime: { text: 'PUBLISHED AT | (MM/DD/YYYY)', sortable: false },
    manage: { text: 'MANAGE', sortable: false },
  };

  Object.entries(headers).forEach(([key, headerConfig]) => {
    const { text, sortable } = headerConfig;
    const [firstRow, secondRow] = text.split(' | ');

    const thTextWrapper = createTag('span', {}, '');

    if (secondRow) {
      createTag('div', { class: 'ecc-table-header-row' }, firstRow, { parent: thTextWrapper });
      createTag('div', { class: 'ecc-table-header-row' }, secondRow, { parent: thTextWrapper });
    } else {
      createTag('div', { class: 'ecc-table-header-row' }, text, { parent: thTextWrapper });
    }
    const th = createTag('th', {}, thTextWrapper, { parent: thRow });

    if (!sortable) return;

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
          const event = props.paginatedData[j];
          batchPromises.push(loadRowData(row, event));
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
  props.filteredData = props.data.filter((e) => {
    const defaultLocale = e.defaultLocale || Object.keys(e.localizations)[0] || 'en-US';
    const eventTitle = getAttribute(e, 'title', defaultLocale);
    if (!eventTitle) {
      window.lana?.log(`event Title is not defined ${e.eventId}`);
      return false;
    }
    return eventTitle.toLowerCase().includes(q);
  });
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
  const dropdown = createTag('div', { class: 'dropdown' }, '', { parent: actionsContainer });
  const createCta = createTag('a', { class: 'con-button blue' }, config['create-event-cta-text'], { parent: dropdown });
  const dropdownContent = createTag('div', { class: 'dropdown-content hidden' }, '', { parent: dropdown });

  createTag('a', { class: 'dropdown-item', href: config['webinar-form-url'] }, 'Webinar', { parent: dropdownContent });
  createTag('a', { class: 'dropdown-item', href: config['create-form-url'] }, 'In-Person', { parent: dropdownContent });

  createCta.addEventListener('click', (e) => {
    e.preventDefault();
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !createCta.contains(e.target)) {
      dropdownContent.classList.add('hidden');
    } else {
      dropdownContent.classList.remove('hidden');
    }
  });

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

function updateEventsCount(props) {
  const eventsCount = props.el.querySelector('.dashboard-header-events-count');
  eventsCount.textContent = `(${props.data.length} events)`;
}

async function buildDashboardTable(props, config) {
  const tableContainer = createTag('div', { class: 'dashboard-table-container' }, '', { parent: props.el });
  const table = createTag('table', { class: 'dashboard-table' }, '', { parent: tableContainer });
  const thead = createTag('thead', {}, '', { parent: table });
  createTag('tbody', {}, '', { parent: table });
  createTag('tr', { class: 'table-header-row' }, '', { parent: thead });
  initSorting(props, config);

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
  const spTheme = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'toast-area' }, '', { parent: el });
  createTag('sp-underlay', {}, '', { parent: spTheme });
  createTag('sp-dialog', { size: 's' }, '', { parent: spTheme });

  const props = {
    el,
    currentPage: 1,
    currentSort: {},
  };

  const data = await getEventsForUser();
  if (!data?.length) {
    buildNoEventScreen(el, config);
  } else {
    const locales = await getLocales().then((resp) => resp.localeNames) || {};
    props.data = data;
    props.filteredData = [...data];
    props.paginatedData = [...data];

    const dataHandler = {
      set(target, prop, value, receiver) {
        target[prop] = value;

        // Use async populateTable but don't await to avoid blocking
        populateTable(receiver, { ...config, locales }).catch((error) => {
          window.lana?.log(`Error populating table: ${error.message}`);
        });
        updateEventsCount(receiver);

        return true;
      },
    };
    const proxyProps = new Proxy(props, dataHandler);
    buildDashboardHeader(proxyProps, config);

    // Build table asynchronously
    buildDashboardTable(proxyProps, { ...config, locales }).catch((error) => {
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

  await initProfileLogicTree('ecc-dashboard', {
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
