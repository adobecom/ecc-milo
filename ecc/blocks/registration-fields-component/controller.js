/* eslint-disable no-unused-vars */
import { getAttribute } from '../../scripts/data-utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';
import { EVENT_TYPES, LINK_REGEX, SUPPORTED_CLOUDS } from '../../scripts/constants.js';
import { getSystemConfig } from '../../scripts/utils.js';
import { LIBS } from '../../scripts/scripts.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const rsvpform = component.querySelector('div > rsvp-form');

  const registrationPayload = rsvpform.getRegistrationPayload();

  const removeData = [];
  if (registrationPayload.registration?.type === 'Marketo') {
    if (!registrationPayload.registration?.formData.match(LINK_REGEX)) {
      setPropsPayload(
        props,
        registrationPayload,
        removeData,
      );
      throw new Error('Please enter a valid website address starting with "https://". For example: https://www.example.com');
    }

    // Remove the rsvpFormFields from the payload only when formUrl is valid
    removeData.push({
      key: 'rsvpFormFields',
      path: '',
    });
  }

  setPropsPayload(
    props,
    registrationPayload,
    removeData,
  );
}

function setMarketoAttributes(rsvpForm, registration) {
  rsvpForm.setAttribute('formType', 'marketo');
  if (registration?.formData) {
    rsvpForm.setAttribute('formUrl', registration.formData);
  }
}

function setBasicFormAttributes(rsvpForm, eventData, locale) {
  const rsvpFormFields = getAttribute(eventData, 'rsvpFormFields', locale);
  const visibleFields = new Set(rsvpFormFields?.visible || []);
  const requiredFields = new Set(rsvpFormFields?.required || []);

  rsvpForm.setAttribute('formType', 'basic');
  rsvpForm.visible = visibleFields;
  rsvpForm.required = requiredFields;
}

function filterRsvpConfigData(rsvpConfigData, eventData, props) {
  let data = rsvpConfigData;
  const marketoIntegration = getAttribute(eventData, 'marketoIntegration', props.locale);

  if (marketoIntegration?.eventPoi) {
    data = rsvpConfigData.filter(({ Field }) => Field !== 'primaryProductOfInterest');
  }
  return data;
}

async function setRsvpFormAttributes(props, eventData, component) {
  const rsvpFormConfigs = JSON.parse(component.dataset.rsvpFormConfigs);
  const cloudType = getAttribute(eventData, 'cloudType', props.locale);
  const eventType = getAttribute(eventData, 'eventType', props.locale);
  const registration = getAttribute(eventData, 'registration', props.locale);

  const eventTypeConfig = await getSystemConfig('event-type');
  const defaultRsvpFormConfig = eventTypeConfig.find((c) => c.configKey === 'default-rsvp-form');
  const defaultForm = defaultRsvpFormConfig[eventType]?.toLowerCase();

  const rsvpForm = component.querySelector('div > rsvp-form');
  const rsvpConfig = rsvpFormConfigs.find(({ cloudType: cType }) => cType === cloudType);

  const data = filterRsvpConfigData(rsvpConfig?.config?.data, eventData, props);

  rsvpForm.setAttribute('data', JSON.stringify(data));
  rsvpForm.setAttribute('eventType', eventType);

  const eventHasMarketoForm = eventType === EVENT_TYPES.WEBINAR && registration?.type === 'Marketo';
  const defaultFormIsMarketo = defaultForm === 'marketo' && !registration?.type;
  if (eventHasMarketoForm || defaultFormIsMarketo) {
    setMarketoAttributes(rsvpForm, registration);
  } else {
    setBasicFormAttributes(rsvpForm, eventData, props.locale);
  }
}

function updateDescription(component, props) {
  const rsvpFormConfigs = JSON.parse(component.dataset.rsvpFormConfigs);
  const cloudType = getAttribute(props.eventDataResp, 'cloudType', props.locale);

  if (!cloudType) return;

  const config = rsvpFormConfigs.find(({ cloudType: cType }) => cType === cloudType);
  const requiredFields = config?.config?.data?.filter(({ Required }) => Required === 'x');

  const descriptionDiv = component.querySelector(':scope > div:nth-of-type(2)');
  const existingDescription = descriptionDiv.querySelector('p');

  if (existingDescription) {
    existingDescription.remove();
  }

  const requiredFieldsDescription = requiredFields?.map(({ Label }) => `<strong>${Label}</strong>`).join(', ').replace(/, ([^,]*)$/, ' and $1') || '';
  createTag('p', { class: 'description' }, `Note: <strong>${SUPPORTED_CLOUDS.find(({ id }) => id === cloudType)?.name}</strong> required fields include ${requiredFieldsDescription}`, { parent: descriptionDiv });
}

export async function onPayloadUpdate(component, props) {
  updateDescription(component, props);
  await setRsvpFormAttributes(props, props.payload, component);
}

export async function onRespUpdate(component, props) {
  updateDescription(component, props);
  await setRsvpFormAttributes(props, props.eventDataResp, component);
}

export default async function init(component, props) {
  updateDescription(component, props);
  await setRsvpFormAttributes(props, props.eventDataResp, component);
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
