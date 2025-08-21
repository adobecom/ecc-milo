/* eslint-disable no-unused-vars */
import { setPropsPayload } from '../form-handler/data-handler.js';
import { getAttribute } from '../../scripts/data-utils.js';
import { LIBS } from '../../scripts/scripts.js';
import { getSeriesForUser } from '../../scripts/esp-controller.js';
import { updateRequiredVisibleFieldsValidation } from '../form-handler/form-handler-helper.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

// Centralized prefix management
const MCZ_PREFIX = 'mcz-';

const addMczPrefix = (value) => {
  if (!value) return '';
  // Don't add prefix if it already exists
  return value.startsWith(MCZ_PREFIX) ? value : `${MCZ_PREFIX}${value}`;
};

const removeMczPrefix = (value) => {
  if (!value) return '';
  // Remove prefix if it exists
  return value.startsWith(MCZ_PREFIX) ? value.substring(MCZ_PREFIX.length) : value;
};

const formatMarketoUrl = (marketoId) => {
  // Ensure consistent format for URL (without dash)
  const idWithPrefix = addMczPrefix(marketoId);
  return idWithPrefix.replace('-', '');
};

export function onSubmit(component, props) {
  const marketoIdField = component.querySelector('#mcz-event-id-textfield');
  const rawMarketoId = marketoIdField.value.trim();
  const isMczEvent = component.querySelector('sp-checkbox').checked;
  const removeData = [];

  if (isMczEvent && !rawMarketoId) {
    throw new Error('MCZ Program ID is required');
  }

  if (!rawMarketoId || isMczEvent === false) {
    removeData.push({
      key: 'externalEventId',
      path: '',
    });
  }

  // Store with prefix for backend consistency
  const marketoIdWithPrefix = addMczPrefix(rawMarketoId);

  setPropsPayload(props, { externalEventId: marketoIdWithPrefix }, removeData);
}

function loadMarketoEventInfo(component, marketoId) {
  const urlFormatId = formatMarketoUrl(marketoId);
  const iframe = createTag('iframe', {
    src: `https://engage.adobe.com/${urlFormatId}.html?mkto_src=emc`,
    class: 'hidden',
  });
    component.append(iframe);
}

function setMarketoId(data, component, locale) {
  const marketoIdFromDb = getAttribute(data, 'externalEventId', locale);

  if (!marketoIdFromDb) return;

  const marketoIdField = component.querySelector('#mcz-event-id-textfield');

  if (!marketoIdField) return;

  // Display without prefix in UI
  const displayValue = removeMczPrefix(marketoIdFromDb);
  marketoIdField.setAttribute('value', displayValue);

  loadMarketoEventInfo(component, marketoIdFromDb);
}

function mczEventSideEffect(component, props) {
  const { eventDataResp } = props;
  const { isMczEvent } = props.payload;
  const mczSection = component.querySelector('div.marketo-event-id');
  if (props.eventDataResp?.eventId) {
    // The event has already created. The marketer cannot change this section anymore.
    if (props.eventDataResp?.externalEventId) {
      // Disable this section
      const checkbox = component.querySelector('sp-checkbox');
      checkbox.checked = true;
      checkbox.disabled = true;
      mczSection.classList.remove('hidden');
      component.querySelector('#mcz-event-id-textfield').disabled = true;
    } else {
      component.parentElement.remove();
    }
    return;
  }

  if (isMczEvent) {
    mczSection.classList.remove('hidden');
  } else if (!isMczEvent && isMczEvent === false) {
    mczSection.classList.add('hidden');
  }
  updateRequiredVisibleFieldsValidation(props);
}

export async function onPayloadUpdate(component, props) {
  setMarketoId(props.eventDataResp, component, props.locale);
  mczEventSideEffect(component, props);
}

export async function onRespUpdate(component, props) {
  setMarketoId(props.eventDataResp, component, props.locale);
  mczEventSideEffect(component, props);
}

function convertDateToYYYYMMDD(date) {
  // Converts input like "31st January 2025" to "YYYY-MM-DD"
  // Returns null if input is invalid
  if (!date || typeof date !== 'string') return null;
  // Match groups: day, month, year
  const match = date.trim().match(/^(\d{1,2})st\s(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  // Map month name to MM format
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthIndex = monthNames.indexOf(month);
  if (monthIndex === -1) return null;
  const mm = String(monthIndex + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function convertTimeToHHMMSS(time) {
  // Converts input like "11:00am", "3:15pm", or "11am" to "HH:MM:SS" 24-hour format (e.g., "11:00:00", "15:15:00", "11:00:00")
  // Returns null if input is invalid
  if (!time || typeof time !== 'string') return null;
  // Match groups: hour, optional minute, am/pm
  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!match) return null;
  let [, hour, minute, period] = match;
  hour = parseInt(hour, 10);
  minute = minute !== undefined ? parseInt(minute, 10) : 0;
  if (period.toLowerCase() === 'pm' && hour !== 12) hour += 12;
  if (period.toLowerCase() === 'am' && hour === 12) hour = 0;
  // Pad hour and minute
  const hh = hour.toString().padStart(2, '0');
  const mm = minute.toString().padStart(2, '0');
  return `${hh}:${mm}:00`;
}

async function updateFormUsingMarketoData(params, component, props) {
  const seriesName = params.profile['Series Name'];

  // lookup seriesId from eventInfo.seriesName
  const series = await getSeriesForUser();
  const seriesId = series.find((s) => s.seriesName === seriesName)?.seriesId;

  const eventStartDateTime = params.profile['Event Start Date Time ISO'];
  const eventEndDateTime = params.profile['Event End Date Time ISO'];

  const localStartDate = eventStartDateTime.split('T')[0];
  const localEndDate = eventEndDateTime.split('T')[0];
  const localStartTime = eventStartDateTime.split('T')[1].split(':')[0];
  const localEndTime = eventEndDateTime.split('T')[1].split(':')[0];

  // const localStartDate = convertDateToYYYYMMDD(params.profile['Event Start Date']);
  // const localEndDate = convertDateToYYYYMMDD(params.profile['Event End Date']);
  // const localStartTime = convertTimeToHHMMSS(params.profile['Event Start Time']);
  // const localEndTime = convertTimeToHHMMSS(params.profile['Event End Time']);

  const eventInfo = {
    title: params.profile['Event Name'],
    description: params.profile['Event Description'],
    localStartDate,
    localStartTime,
    localEndDate,
    localEndTime,
    timezone: params.dateTime.timezone,
  };

  if (seriesId) {
    eventInfo.seriesId = seriesId;
  }  
  // lookup eventId from eventInfo.title
  console.log('eventInfo : ', eventInfo);
  props.eventDataResp = { ...props.eventDataResp, ...eventInfo };
  // this should be done only if data is not already present in the eventInfo
}

function onMczMessage(event, component, props) {
  const config = { allowedOrigins: ['https://engage.adobe.com', 'https://business.adobe.com'] };
  const eventOrigin = new URL(event.origin);
  let allowedToPass = false;
  for (let i = 0; i < config.allowedOrigins.length; i += 1) {
    const allowedOriginURL = new URL(config.allowedOrigins[i]);
    if (
      eventOrigin.host === allowedOriginURL.host
        && eventOrigin.protocol === allowedOriginURL.protocol
        && eventOrigin.port === allowedOriginURL.port
    ) {
      allowedToPass = true;
      break;
    }
  }
  if (event.data && event.data.type !== 'mcz_marketoForm_pref_sync') {
    allowedToPass = false;
  }
  if (!allowedToPass) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log('MCZ RefData Received:', event.data);
  if (event.data && event.data.target_path !== null && event.data.target_attribute !== null) {
    // let save = event.data.save || false;
    updateFormUsingMarketoData(event.data.data, component, props);
  }
}

function initMarketoIdFieldListener(component, props) {
  const marketoIdField = component.querySelector('#mcz-event-id-textfield');
  if (!marketoIdField) return;

  // Listen for value changes on the textfield
  marketoIdField.addEventListener('change', (event) => {
    const marketoId = addMczPrefix(event.target.value);
    console.log('marketoId : ', marketoId);

    loadMarketoEventInfo(component, marketoId);
  });

  const isMczField = component.querySelector('sp-checkbox');

  isMczField.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    setPropsPayload(props, { isMczEvent: isChecked }, []);
  });

  window.addEventListener('message', (event) => onMczMessage(event, component, props));
}

export default function init(component, props) {
  setMarketoId(props.eventDataResp, component, props.locale);
  initMarketoIdFieldListener(component, props);
}

export function onTargetUpdate(_component, _props) {
  // Do nothing
}
