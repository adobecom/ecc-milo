import { addSponsorToEvent, getSponsor, removeSponsorFromEvent } from '../../../scripts/esp-controller.js';
import { getFilteredCachedResponse } from '../data-handler.js';

/* eslint-disable no-unused-vars */
export async function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const partnerVisible = component.querySelector('#partners-visible')?.checked;
  const partnerSelectorGroup = component.querySelector('partner-selector-group');
  const { eventId, sponsors } = getFilteredCachedResponse();

  if (partnerSelectorGroup && eventId) {
    if (sponsors) {
      const responses = await Promise.all(sponsors.map(async (sponsor) => {
        if (sponsor.sponsorType === 'Partner') {
          const resp = await removeSponsorFromEvent(sponsor.sponsorId, eventId);
          if (resp && !resp.errors) {
            return { ...resp, sponsorId: sponsor.sponsorId };
          }
        }
        return null;
      }));

      const validResponses = responses.filter((resp) => resp !== null);
      validResponses.sort((a, b) => a.modificationTime - b.modificationTime);

      validResponses.forEach((resp) => {
        props.eventDataResp = { ...props.eventDataResp, ...resp };
      });
    }

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

  if (eventData.sponsors) {
    const partners = await Promise.all(eventData.sponsors.map(async (sponsor, index) => {
      if (sponsor.sponsorType === 'Partner') {
        const partnerData = await getSponsor(eventData.seriesId, sponsor.sponsorId);

        if (partnerData) {
          let photo;
          const { name, link } = partnerData;
          if (partnerData.image) {
            photo = { ...partnerData.image, url: partnerData.image.imageUrl };
          }

          return { name, link, isValidPartner: true, photo, index };
        }
      }
      return { index, isValidPartner: false };
    }));

    const filteredPartners = partners
      .filter((partner) => partner.isValidPartner)
      .sort((a, b) => a.index - b.index)
      .map(({ name, link, photo }) => ({ name, link, photo }));

    partnersGroup.partners = filteredPartners;
    component.classList.add('prefilled');
  }

  const partnerVisible = component.querySelector('#partners-visible');
  partnerVisible.checked = eventData.partnerVisible;
}
