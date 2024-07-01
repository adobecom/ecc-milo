import { addSponsorToEvent } from '../../../utils/esp-controller.js';
import { getFilteredCachedPayload } from '../data-handler.js';

/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const partnerVisible = component.querySelector('#partners-visible')?.checked;
  const partnerSelectorGroup = component.querySelector('partner-selector-group');

  if (partnerSelectorGroup) {
    const partners = partnerSelectorGroup.getSavedPartners();
    partners.forEach((partner) => {
      const { sponsorId, sponsorType } = partner;
      addSponsorToEvent({
        sponsorId,
        sponsorType,
      }, getFilteredCachedPayload().eventId);
    });
  }

  props.payload = { ...props.payload, partnerVisible };
}

export async function onUpdate(_component, _props) {
  // Do nothing
}

export default async function init(component, props) {
  const eventData = props.eventDataResp;
  const partnersGroup = component.querySelector('partner-selector-group');

  if (eventData.partners) {
    partnersGroup.partners = eventData.partners;
    component.classList.add('prefilled');
  }

  const partnerVisible = component.querySelector('#partners-visible');
  partnerVisible.checked = eventData.partnerVisible;
}
