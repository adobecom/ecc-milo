/* eslint-disable no-unused-vars */
import { addSpeakerToEvent, getSpeaker, getSpeakers, updateSpeakerInEvent, removeSpeakerFromEvent } from '../../../scripts/esp-controller.js';
import { getFilteredCachedResponse } from '../data-handler.js';

export async function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const profileContainer = component.querySelector('profile-container');
  if (profileContainer) {
    const speakers = profileContainer.getProfiles();
    if (speakers.length === 0) return;

    const { eventId } = getFilteredCachedResponse();

    await speakers.reduce(async (promise, speaker) => {
      await promise;

      const { speakerId, speakerType } = speaker;

      if (!props.eventDataResp.sponsors) {
        const resp = await addSpeakerToEvent(speaker, eventId);

        if (!resp || resp.errors) {
          return;
        }

        props.eventDataResp = { ...props.eventDataResp, ...resp };
      } else {
        const existingSpeaker = props.eventDataResp.speakers.find((profile) => {
          const idMatch = profile.speakerId === speakerId;
          const typeMatch = profile.sponsorType === speakerType;
          const ordinalMatch = profile.ordinal === speaker.ordinal;
          return idMatch && typeMatch && ordinalMatch;
        });

        if (!existingSpeaker) {
          const resp = await addSpeakerToEvent(speaker, eventId);

          if (!resp || resp.errors) {
            return;
          }

          props.eventDataResp = { ...props.eventDataResp, ...resp };
        } else if (speaker.hasUnsavedChanges) {
          // If there are unsaved changes, do nothing
        } else {
          const updatableData = speaker;
          const resp = await updateSpeakerInEvent(updatableData, speaker.speakerId, eventId);

          if (!resp || resp.errors) {
            return;
          }

          props.eventDataResp = { ...props.eventDataResp, ...resp };
        }
      }
    }, Promise.resolve());

    if (props.eventDataResp.speakers) {
      const savedSpeakers = props.eventDataResp.speakers;
      await savedSpeakers.reduce(async (promise, speaker) => {
        await promise;
        const { speakerId } = speaker;
        const stillNeeded = speakers.find((profile) => profile.speakerId === speakerId);

        if (!stillNeeded) {
          const resp = await removeSpeakerFromEvent(speakerId, eventId);
          if (!resp || resp.errors) {
            return;
          }

          props.eventDataResp = { ...props.eventDataResp, ...resp };
        }
      }, Promise.resolve());
    }
  }
}

export async function onUpdate(component, props) {
  const containers = component.querySelectorAll('profile-container');
  containers.forEach(async (container) => {
    if (props.payload.seriesId && props.payload.seriesId !== container.seriesId) {
      container.setAttribute('seriesId', props.payload.seriesId);
      const { speakers } = await getSpeakers(props.payload.seriesId);
      container.searchdata = speakers ?? [];
    }
    container.requestUpdate();
  });
}

async function prefillProfiles(props) {
  const d = await props.eventDataResp;
  if (d?.eventId && d.seriesId) {
    const { seriesId } = d;
    try {
      // eslint-disable-next-line max-len
      const speakers = await Promise.all(d.speakers.map(async (sp) => getSpeaker(seriesId, sp.speakerId)));
      for (let idx = 0; idx < d.speakers.length; idx += 1) {
        d.speakers[idx] = { ...d.speakers[idx], ...speakers[idx] };
      }
      props.eventDataResp = { ...props.eventDataResp, ...d };
    } catch (e) {
      window.lana?.error('Error fetching speaker data: ', e);
    }
  }
}

export default async function init(component, props) {
  await prefillProfiles(props);
  const eventData = props.eventDataResp;
  const { speakers } = eventData;
  const profileContainer = component.querySelector('profile-container');
  if (!speakers || !speakers.length || !profileContainer) return;
  profileContainer.profiles = speakers;
  profileContainer.requestUpdate();
  component.classList.add('prefilled');
}
