/* eslint-disable no-unused-vars */
import { setPropsPayload } from '../form-handler/data-handler.js';
import { initRequiredFieldsValidation } from '../form-handler/form-handler-helper.js';
import { MARKETO_INTEGRATION_FIELDS } from './marketo-integration-component.js';

export async function onPayloadUpdate(component, props) {
  const { cloudType } = props.payload;
  if (cloudType && cloudType !== component.dataset.cloudType) {
    component.dataset.cloudType = cloudType;
  }
}

export async function onRespUpdate(component, props) {
  if (props.eventDataResp) {
    const { marketoIntegration, eventId } = props.eventDataResp;

    const eventTypeSelect = component.querySelector('#marketo-event-type-select-input');
    const salesforceCampaignIdInput = component.querySelector('#marketo-salesforce-campaign-id-input');
    const mczProgramNameInput = component.querySelector('#marketo-mcz-program-name-input');
    const coMarketingPartnerInput = component.querySelector('#marketo-co-marketing-partner-input');
    const eventPoiInput = component.querySelector('#marketo-event-poi-input');

    if (marketoIntegration) {
      const {
        eventType,
        salesforceCampaignId,
        mczProgramName,
        coMarketingPartner,
        eventPoi,
      } = marketoIntegration;

      if (eventType) eventTypeSelect.value = eventType;
      if (salesforceCampaignId) salesforceCampaignIdInput.value = salesforceCampaignId;
      if (mczProgramName) mczProgramNameInput.value = mczProgramName;
      if (coMarketingPartner) coMarketingPartnerInput.value = coMarketingPartner;
      if (eventPoi) eventPoiInput.value = eventPoi;
    }

    if (eventId) {
      eventTypeSelect.disabled = true;
      salesforceCampaignIdInput.disabled = true;
      mczProgramNameInput.disabled = true;
      coMarketingPartnerInput.disabled = true;
      eventPoiInput.disabled = true;

      if (!marketoIntegration) {
        eventTypeSelect.value = 'No Marketo integration';
        eventTypeSelect.dispatchEvent(new Event('change'));
      }
    }
  }
}

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const eventType = component.querySelector('#marketo-event-type-select-input').value;
  const salesforceCampaignId = component.querySelector('#marketo-salesforce-campaign-id-input').value;
  const mczProgramName = component.querySelector('#marketo-mcz-program-name-input').value;
  const coMarketingPartner = component.querySelector('#marketo-co-marketing-partner-input').value;
  const eventPoi = component.querySelector('#marketo-event-poi-input').value;

  const marketoIntegration = {};
  const removeData = [];

  if (eventType && eventType !== 'No Marketo integration') {
    marketoIntegration.eventType = eventType;
    if (salesforceCampaignId) marketoIntegration.salesforceCampaignId = salesforceCampaignId;
    if (mczProgramName) marketoIntegration.mczProgramName = mczProgramName;
    if (coMarketingPartner) marketoIntegration.coMarketingPartner = coMarketingPartner;
    if (eventPoi && eventPoi !== 'No Event POI') marketoIntegration.eventPoi = eventPoi;
    setPropsPayload(props, { marketoIntegration });
  } else {
    removeData.push({
      key: 'marketoIntegration',
      path: '',
    });

    setPropsPayload(props, {}, removeData);
  }
}

export function onTargetUpdate(component, props) {
  // Do nothing
}

export default async function init(component, props) {
  const fields = MARKETO_INTEGRATION_FIELDS;

  const masterField = fields.find((field) => field.masterField);

  if (masterField) {
    const masterFieldInput = component.querySelector(`#${masterField.id}`);
    const optionWithDisableRule = masterField.options.find((option) => option.disableFields);
    const fieldsToDisable = optionWithDisableRule.disableFields;

    masterFieldInput.addEventListener('change', (e) => {
      const selectedValue = e.target.value;
      if (selectedValue === 'No Marketo integration') {
        fieldsToDisable.forEach((field) => {
          const fieldInput = component.querySelector(`#${field.id}`);
          fieldInput.value = '';
          fieldInput.disabled = true;
        });
        setPropsPayload(props, { 'marketo-integration': {} });
      } else {
        fieldsToDisable.forEach((field) => {
          const fieldInput = component.querySelector(`#${field.id}`);
          fieldInput.disabled = false;
          if (fieldInput.required && fieldInput.value === '') fieldInput.invalid = true;
        });
      }

      initRequiredFieldsValidation(props);
    });
  }
}
