/* eslint-disable no-unused-vars */
import { setPropsPayload } from '../form-handler/data-handler.js';
import { initRequiredFieldsValidation } from '../form-handler/form-handler-helper.js';

export async function onPayloadUpdate(component, props) {
  const { cloudType } = props.payload;
  if (cloudType && cloudType !== component.dataset.cloudType) {
    component.dataset.cloudType = cloudType;
    const isDX = cloudType === 'ExperienceCloud' && component.classList.contains('dx-only');
    const isDME = cloudType === 'CreativeCloud' && component.classList.contains('dme-only');
    const noSpecifiedCloud = !(component.classList.contains('dx-only') || component.classList.contains('dme-only'));
    const eventTypeSelect = component.querySelector('#marketo-event-type-select-input');

    eventTypeSelect.disabled = !(isDME || isDX || noSpecifiedCloud);
  }
}

export async function onRespUpdate(component, props) {
  if (props.eventDataResp) {
    const { marketoIntegration } = props.eventDataResp;

    if (marketoIntegration) {
      const {
        eventType,
        salesforceCampaignId,
        mczProgramName,
        coMarketingPartner,
        eventPoi,
      } = marketoIntegration;

      const eventTypeSelect = component.querySelector('#marketo-event-type-select-input');
      const salesforceCampaignIdInput = component.querySelector('#marketo-salesforce-campaign-id-input');
      const mczProgramNameInput = component.querySelector('#marketo-mcz-program-name-input');
      const coMarketingPartnerInput = component.querySelector('#marketo-co-marketing-partner-input');
      const eventPoiInput = component.querySelector('#marketo-event-poi-input');

      if (eventType) eventTypeSelect.value = eventType;
      if (salesforceCampaignId) salesforceCampaignIdInput.value = salesforceCampaignId;
      if (mczProgramName) mczProgramNameInput.value = mczProgramName;
      if (coMarketingPartner) coMarketingPartnerInput.value = coMarketingPartner;
      if (eventPoi) eventPoiInput.value = eventPoi;
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

  const markettoIntegration = {};

  if (eventType) markettoIntegration.eventType = eventType;
  if (salesforceCampaignId) markettoIntegration.salesforceCampaignId = salesforceCampaignId;
  if (mczProgramName) markettoIntegration.mczProgramName = mczProgramName;
  if (coMarketingPartner) markettoIntegration.coMarketingPartner = coMarketingPartner;
  if (eventPoi) markettoIntegration.eventPoi = eventPoi;

  setPropsPayload(props, markettoIntegration);
}

export function onTargetUpdate(component, props) {
  // Do nothing
}

export default async function init(component, props) {
  const fields = JSON.parse(component.dataset.fields);

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
        });
      }

      initRequiredFieldsValidation(props);
    });
  }
}
