/* eslint-disable no-restricted-syntax */
import {
  addSponsorToEvent,
  getEvent,
  getSponsor,
  getSponsorImages,
  getSponsors,
  removeSponsorFromEvent,
  updateSponsorInEvent,
} from '../../scripts/esp-controller.js';

let PARTNERS_SERIES_ID;

/* eslint-disable no-unused-vars */
export async function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const showSponsors = component.querySelector('#partners-visible')?.checked;
  const partnerSelectorGroup = component.querySelector('partner-selector-group');
  const { eventId } = props.eventDataResp;

  if (partnerSelectorGroup && eventId) {
    const partners = partnerSelectorGroup.getSavedPartners();
    await Promise.all(partners.map(async (partner) => {
      const { sponsorId, sponsorType } = partner;

      if (!props.eventDataResp.sponsors) {
        const resp = await addSponsorToEvent({
          sponsorId,
          sponsorType,
        }, eventId);

        if (resp.error) {
          return;
        }

        props.eventDataResp = { ...props.eventDataResp, ...resp };
      } else {
        const existingPartner = props.eventDataResp.sponsors.find((sponsor) => {
          const idMatch = sponsor.sponsorId === sponsorId;
          const typeMatch = sponsor.sponsorType === sponsorType;
          return idMatch && typeMatch;
        });

        if (!existingPartner) {
          const resp = await addSponsorToEvent({
            sponsorId,
            sponsorType,
          }, eventId);

          if (resp.error) {
            window.lana?.log('Failed to add sponsor to event', resp);
          }
        } else if (partner.hasUnsavedChanges) {
          // If there are unsaved changes, do nothing
        } else {
          const updatableData = {
            sponsorId,
            sponsorType,
          };
          const resp = await updateSponsorInEvent(updatableData, partner.sponsorId, eventId);

          if (resp.error) {
            window.lana?.log('Failed to update sponsor in event', resp);
          }
        }
      }
    }));

    if (props.eventDataResp.sponsors) {
      const savedPartners = props.eventDataResp.sponsors.filter((sponsor) => sponsor.sponsorType === 'Partner');
      await Promise.all(savedPartners.map(async (partner) => {
        const { sponsorId } = partner;
        const stillNeeded = partners.find((p) => p.sponsorId === sponsorId);

        if (!stillNeeded) {
          const resp = await removeSponsorFromEvent(sponsorId, eventId);
          if (!resp.ok) {
            window.lana?.log('Failed to remove sponsor from event', resp);
          }
        }
      }));
    }

    const updatedEventData = await getEvent(eventId);
    props.eventDataResp = { ...props.eventDataResp, ...updatedEventData };
  }

  props.payload = { ...props.payload, showSponsors };
}

export async function onPayloadUpdate(component, props) {
  if (!PARTNERS_SERIES_ID || PARTNERS_SERIES_ID !== props.eventDataResp.seriesId) {
    const partnersGroup = component.querySelector('partner-selector-group');

    PARTNERS_SERIES_ID = props.eventDataResp.seriesId;

    if (PARTNERS_SERIES_ID) {
      const spResp = await getSponsors(PARTNERS_SERIES_ID);
      if (spResp) partnersGroup.seriesSponsors = spResp.sponsors;
    }
  }
}

export async function onRespUpdate(_component, _props) {
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
          const { name, link, sponsorId, modificationTime } = partnerData;
          if (partnerData.image) {
            photo = { ...partnerData.image, url: partnerData.image.imageUrl };
          } else {
            const resp = await getSponsorImages(eventData.seriesId, sponsorId);

            if (resp?.images) {
              const sponsorImage = resp?.images.find((image) => image.imageKind === 'sponsor-image');
              if (sponsorImage) {
                photo = { ...sponsorImage, url: sponsorImage.imageUrl };
              }
            }
          }

          return {
            name,
            link,
            sponsorId,
            isValidPartner: true,
            photo,
            index,
            modificationTime,
          };
        }
      }
      return { index, isValidPartner: false };
    }));

    const filteredPartners = partners
      .filter((partner) => partner.isValidPartner)
      .sort((a, b) => a.index - b.index)
      .map(({
        name,
        link,
        photo,
        sponsorId,
        modificationTime,
      }) => ({
        name,
        link,
        photo,
        sponsorId,
        modificationTime,
      }));

    if (filteredPartners.length) {
      partnersGroup.partners = filteredPartners;
      component.classList.add('prefilled');
    }
  }

  const partnerVisible = component.querySelector('#partners-visible');
  partnerVisible.checked = eventData.showSponsors;
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
