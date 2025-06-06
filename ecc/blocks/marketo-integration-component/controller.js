/* eslint-disable no-unused-vars */
import { setPropsPayload } from '../form-handler/data-handler.js';

export async function onPayloadUpdate(component, props) {
  // Do nothing
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

      eventTypeSelect.value = eventType;
      salesforceCampaignIdInput.value = salesforceCampaignId;
      mczProgramNameInput.value = mczProgramName;
      coMarketingPartnerInput.value = coMarketingPartner;
      eventPoiInput.value = eventPoi;
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

  const marketoIntegration = {
    eventType,
    salesforceCampaignId,
    mczProgramName,
    coMarketingPartner,
    eventPoi,
  };

  setPropsPayload(props, marketoIntegration);
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
      if (selectedValue === optionWithDisableRule.value) {
        fieldsToDisable.forEach((field) => {
          const fieldInput = component.querySelector(`#${field.id}`);
          fieldInput.disabled = true;
        });
      } else {
        fieldsToDisable.forEach((field) => {
          const fieldInput = component.querySelector(`#${field.id}`);
          fieldInput.disabled = false;
        });
      }
    });
  }
}
