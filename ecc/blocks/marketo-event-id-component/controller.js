/* eslint-disable no-unused-vars */
import { setPropsPayload } from '../form-handler/data-handler.js';
import { getAttribute } from '../../scripts/data-utils.js';
import { LIBS } from '../../scripts/scripts.js';
import { getSeriesForUser } from '../../scripts/esp-controller.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

export function onSubmit(component, props) {
  const marketoIdField = component.querySelector('div.marketo-event-id > sp-textfield');
  const marketoId = marketoIdField.value;
  const removeData = [];

  if (!marketoIdField.value) {
    removeData.push({
      key: 'marketoId',
      path: '',
    });
  }

  setPropsPayload(props, { marketoId }, removeData);
}

function loadMarketoEventInfo(component, marketoId) {
  // register a iframe and load this url https://engage.adobe.com/mcz114328.html?mkto_src=emc
  const iframe = createTag('iframe', { src: `https://engage.adobe.com/${marketoId}.html?mkto_src=emc`, class: 'hidden' });
  component.append(iframe);
}

function setMarketoId(data, component, locale) {
  const marketoId = getAttribute(data, 'marketoId', locale);

  if (!marketoId) return;

  const marketoIdField = component.querySelector('div.marketo-event-id > sp-textfield');

  if (!marketoIdField) return;

  marketoIdField.setAttribute('value', marketoId);
}

export async function onPayloadUpdate(component, props) {
  setMarketoId(props.payload, component, props.locale);
}

export async function onRespUpdate(component, props) {
  setMarketoId(props.eventDataResp, component, props.locale);
}

async function updateFormUsingMarketoData(params, component, props) {

  const eventInfo = {
    title: params.profile['Event Name'],
    description: params.profile['Event Description'],
    localStartDate: params.profile['Event Start Date'],
    // localStartTime: params.profile['Event Start Time'],
    localEndDate: params.profile['Event End Date'],
    // localEndTime: params.profile['Event End Time'],
    timezone: params.dateTime.timezone,
  };

  const seriesName = params.profile['Series Name'];

  // lookup seriesId from eventInfo.seriesName
  const series = await getSeriesForUser();
  const seriesId = series.find((s) => s.seriesName === seriesName)?.seriesId;
  if (seriesId) {
    eventInfo.seriesId = seriesId;
  }

  // lookup eventId from eventInfo.title
  console.log('eventInfo : ', eventInfo);
  props.eventDataResp = { ...props.eventDataResp, ...eventInfo };
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
  const marketoIdField = component.querySelector('div.marketo-event-id > sp-textfield');
  if (!marketoIdField) return;

  // Listen for value changes on the textfield
  marketoIdField.addEventListener('change', (event) => {
    const marketoId = event.target.value;
    console.log('marketoId : ', marketoId);

    loadMarketoEventInfo(component, marketoId);
    // setPropsPayload(props, { marketoId });
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
