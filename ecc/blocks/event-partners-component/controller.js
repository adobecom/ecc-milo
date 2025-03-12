/* eslint-disable no-restricted-syntax */
import {
  addSponsorToEvent,
  getSponsor,
  getSponsorImages,
  getSponsors,
  removeSponsorFromEvent,
  updateSponsorInEvent,
} from '../../scripts/esp-controller.js';
import { setPropsPayload } from '../form-handler/data-handler.js';

let PARTNERS_SERIES_ID;

/* eslint-disable no-unused-vars */
export async function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const showSponsors = component.querySelector('#checkbox-sponsors')?.checked;
  const partnerSelectorGroup = component.querySelector('partner-selector-group');
  const { eventId } = props.eventDataResp;

  if (partnerSelectorGroup && eventId) {
    const partners = partnerSelectorGroup.getSavedPartners();
    await partners.reduce(async (promise, partner) => {
      await promise;

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
            return;
          }

          props.eventDataResp = { ...props.eventDataResp, ...resp };
        } else if (partner.hasUnsavedChanges) {
          // If there are unsaved changes, do nothing
        } else {
          const updatableData = {
            sponsorId,
            sponsorType,
          };
          const resp = await updateSponsorInEvent(updatableData, partner.sponsorId, eventId);

          if (resp.error) {
            return;
          }

          props.eventDataResp = { ...props.eventDataResp, ...resp };
        }
      }
    }, Promise.resolve());

    if (props.eventDataResp.sponsors) {
      const savedPartners = props.eventDataResp.sponsors.filter((sponsor) => sponsor.sponsorType === 'Partner');
      await savedPartners.reduce(async (promise, partner) => {
        await promise;
        const { sponsorId } = partner;
        const stillNeeded = partners.find((p) => p.sponsorId === sponsorId);

        if (!stillNeeded) {
          const resp = await removeSponsorFromEvent(sponsorId, eventId);
          if (resp.error) {
            return;
          }

          props.eventDataResp = { ...props.eventDataResp, ...resp };
        }
      }, Promise.resolve());
    }
  }

  setPropsPayload(props, { showSponsors });
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
  const localeEventData = eventData.localizations?.[props.lang] || eventData;
  const partnersGroup = component.querySelector('partner-selector-group');

  if (localeEventData.sponsors) {
    const partners = await Promise.all(localeEventData.sponsors.map(async (sponsor, index) => {
      if (sponsor.sponsorType === 'Partner') {
        const partnerData = await getSponsor(localeEventData.seriesId, sponsor.sponsorId);

        if (partnerData) {
          let photo;
          const { name, link, sponsorId, modificationTime } = partnerData;
          if (partnerData.image) {
            photo = { ...partnerData.image, url: partnerData.image.imageUrl };
          } else {
            const resp = await getSponsorImages(localeEventData.seriesId, sponsorId);

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
  partnerVisible.checked = localeEventData.showSponsors;
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
