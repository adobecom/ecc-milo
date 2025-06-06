/* eslint-disable max-len */
import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function decorateMarketoIntegrationFields(el, fields) {
  const fieldsContainer = createTag('div', { class: 'fields-container' });

  fields.forEach((field) => {
    const fieldContainer = createTag('div', { class: 'field-container' });
    const fieldLabel = createTag('sp-field-label', { size: 'l' }, `${field.label}${field.required ? ' *' : ''}`);
    fieldContainer.appendChild(fieldLabel);

    if (field.type === 'select') {
      const fieldSelect = createTag('sp-picker', {
        id: field.id,
        size: 'l',
        required: field.required,
      });
      const label = createTag('span', { slot: 'label' }, field.placeholder);
      fieldSelect.appendChild(label);
      field.options.forEach((option) => {
        const opt = createTag('sp-menu-item', { value: option.value }, option.label);
        fieldSelect.append(opt);
      });
      fieldContainer.appendChild(fieldSelect);
    } else {
      const fieldInput = createTag('sp-textfield', {
        id: field.id,
        size: 'l',
        type: field.type,
        placeholder: field.placeholder,
        required: field.required,
      });
      fieldContainer.appendChild(fieldInput);
    }

    fieldsContainer.appendChild(fieldContainer);
  });

  el.appendChild(fieldsContainer);
}
export default function init(el) {
  const fields = [
    {
      id: 'marketo-event-type-select-input',
      name: 'eventType',
      label: 'Event type',
      placeholder: 'Select event type',
      type: 'select',
      required: true,
      masterField: true,
      options: [
        { label: 'DX NA/ROW', value: 'DX NA/ROW' },
        { label: 'DX APAC', value: 'DX APAC' },
        { label: 'DX EMEA', value: 'DX EMEA' },
        { label: 'DX Japan', value: 'DX Japan' },
        { label: 'DX LATAM', value: 'DX LATAM' },
        {
          label: 'No Marketo integration',
          value: 'No Marketo integration',
          placeholder: 'Select event type',
          disableFields: [
            { id: 'marketo-salesforce-campaign-id-input', name: 'salesforceCampaignId' },
            { id: 'marketo-mcz-program-name-input', name: 'mczProgramName' },
          ],
        },
      ],
    },
    {
      id: 'marketo-salesforce-campaign-id-input',
      name: 'salesforceCampaignId',
      label: 'Salesforce campaign ID',
      type: 'text',
      placeholder: 'Add Salesforce campaign ID',
      required: true,
    },
    {
      id: 'marketo-mcz-program-name-input',
      name: 'mczProgramName',
      label: 'MCZ program name',
      type: 'text',
      placeholder: 'Add MCZ program name',
      required: true,
    },
    {
      id: 'marketo-co-marketing-partner-input',
      name: 'coMarketingPartner',
      label: 'Co-marketing partner',
      type: 'text',
      placeholder: 'Add co-marketing partner name',
      required: false,
    },
    {
      id: 'marketo-event-poi-input',
      name: 'eventPoi',
      label: 'Event POI',
      type: 'select',
      placeholder: 'Select POI',
      options: [
        { label: 'Adobe Analytics', value: 'Adobe Analytics' },
        { label: 'Adobe Audience Manager', value: 'Adobe Audience Manager' },
        { label: 'Adobe Campaign', value: 'Adobe Campaign' },
        { label: 'Adobe Commerce', value: 'Adobe Commerce' },
        { label: 'Adobe Experience Manager', value: 'Adobe Experience Manager' },
        { label: 'Adobe Experience Manager Assets', value: 'Adobe Experience Manager Assets' },
        { label: 'Adobe Experience Manager Forms', value: 'Adobe Experience Manager Forms' },
        { label: 'Adobe Experience Manager Sites', value: 'Adobe Experience Manager Sites' },
        { label: 'Adobe Experience Platform', value: 'Adobe Experience Platform' },
        { label: 'Adobe Journey Optimizer B2B Edition', value: 'Adobe Journey Optimizer B2B Edition' },
        { label: 'Adobe Learning Manager', value: 'Adobe Learning Manager' },
        { label: 'Adobe Sign', value: 'Adobe Sign' },
        { label: 'Adobe Target', value: 'Adobe Target' },
        { label: 'Adobe Customer Journey Analytics B2B Edition', value: 'Adobe Customer Journey Analytics B2B Edition' },
        { label: 'Experience Platform Launch', value: 'Experience Platform Launch' },
        { label: 'Intelligent Services', value: 'Intelligent Services' },
        { label: 'Marketo Engage', value: 'Marketo Engage' },
        { label: 'Adobe Real-Time CDP Collaboration', value: 'Adobe Real-Time CDP Collaboration' },
        { label: 'Workfront', value: 'Workfront' },
        { label: 'Adobe GenStudio for Performance Marketing', value: 'Adobe GenStudio for Performance Marketing' },
      ],
      required: false,
    },
  ];

  el.classList.add('form-component');
  const firstRow = el.querySelector(':scope > div');
  generateToolTip(firstRow);

  decorateMarketoIntegrationFields(el, fields);
  el.dataset.fields = JSON.stringify(fields);
}
