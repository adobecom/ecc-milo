import { addSponsorToEvent } from '../../../utils/esp-controller.js';
import { getFilteredCachedResponse } from '../data-handler.js';

/* eslint-disable no-unused-vars */
export async function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const partnerVisible = component.querySelector('#partners-visible')?.checked;
  const partnerSelectorGroup = component.querySelector('partner-selector-group');
  const { eventId } = getFilteredCachedResponse();

  if (partnerSelectorGroup && eventId) {
    const partners = partnerSelectorGroup.getSavedPartners();
    await partners.reduce(async (promise, partner) => {
      await promise;
      const { sponsorId, sponsorType } = partner;
      const resp = await addSponsorToEvent({
        sponsorId,
        sponsorType,
      }, eventId);
      if (!resp || resp.errors) {
        return;
      }

      props.eventDataResp = { ...props.eventDataResp, ...resp };
    }, Promise.resolve());
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
