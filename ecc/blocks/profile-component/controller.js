/* eslint-disable no-unused-vars */
import { getAttribute } from '../../scripts/data-utils.js';
import { LIBS } from '../../scripts/scripts.js';
import { getToastArea } from '../../scripts/utils.js';
import ToastManager from '../../scripts/toast-manager.js';
import {
  addSpeakerToEvent,
  getSpeakers,
  updateSpeakerInEvent,
  removeSpeakerFromEvent,
  getEvent,
  getHydratedEventSpeaker,
} from '../../scripts/esp-controller.js';

function getToastManager(component) {
  const toastArea = getToastArea(component);
  return new ToastManager(toastArea);
}

export async function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const profileContainer = component.querySelector('profile-container');

  if (profileContainer) {
    await profileContainer.saveAllProfiles();
    const savedSpeakers = getAttribute(props.eventDataResp, 'speakers', props.locale);
    const eventId = getAttribute(props.eventDataResp, 'eventId', props.locale);
    const speakers = profileContainer.getProfiles();

    if (speakers.filter((speaker) => !speaker.speakerType).length > 0) {
      throw new Error('Please make sure to pick a speaker type for each speaker.');
    }

    if (speakers.length === 0 && (savedSpeakers && savedSpeakers.length > 0)) {
      await Promise.all(savedSpeakers.map(async (speaker) => {
        const { speakerId } = speaker;
        const resp = await removeSpeakerFromEvent(speakerId, eventId);

        if (!resp.ok) {
          window.lana?.log(`Failed to remove speaker from event:\n${JSON.stringify(resp, null, 2)}`);
        }
      }));

      return;
    }

    // Process all speakers in parallel
    await Promise.all(speakers.map(async (eventSpeaker) => {
      if (!eventSpeaker.speakerId) return;
      if (!savedSpeakers || savedSpeakers.length === 0) {
        const resp = await addSpeakerToEvent(eventSpeaker, eventId);

        if (resp.error) {
          getToastManager(component).showError(resp.error.message || 'Failed to add speaker to event');
          window.lana?.log(`Failed to add speaker to event:\n${JSON.stringify(resp, null, 2)}`);
        }
      } else {
        const existingSpeaker = savedSpeakers.find((profile) => {
          const idMatch = profile.speakerId === eventSpeaker.speakerId;
          const typeMatch = profile.speakerType === eventSpeaker.speakerType;
          const ordinalMatch = profile.ordinal === eventSpeaker.ordinal;
          return idMatch && typeMatch && ordinalMatch;
        });

        if (existingSpeaker) {
          // do nothing
        } else {
          const updateSpeaker = savedSpeakers.find((p) => p.speakerId === eventSpeaker.speakerId);
          if (updateSpeaker) {
            const resp = await updateSpeakerInEvent(eventSpeaker, eventSpeaker.speakerId, eventId);

            if (resp.error) {
              window.lana?.log(`Failed to update speaker in event:\n${JSON.stringify(resp, null, 2)}`);
            }
          } else {
            const resp = await addSpeakerToEvent(eventSpeaker, eventId);
            if (resp.error) {
              window.lana?.log(`Failed to add speaker to event:\n${JSON.stringify(resp, null, 2)}`);
            }
          }
        }
      }
    }));

    if (savedSpeakers && savedSpeakers.length > 0) {
      await Promise.all(savedSpeakers.map(async (eventSpeaker) => {
        const stillNeeded = speakers.find((p) => p.speakerId === eventSpeaker.speakerId);

        if (!stillNeeded) {
          const resp = await removeSpeakerFromEvent(eventSpeaker.speakerId, eventId);

          if (!resp.ok) {
            window.lana?.log(`Failed to remove speaker from event:\n${JSON.stringify(resp, null, 2)}`);
          }
        }
      }));
    }

    const updatedEventData = await getEvent(eventId);
    if (!updatedEventData.error && updatedEventData) {
      props.eventDataResp = updatedEventData;
    } else {
      getToastManager(component).showError(updatedEventData.error?.message || 'Failed to update event data');
    }
  }
}

export async function onPayloadUpdate(component, props) {
  const containers = component.querySelectorAll('profile-container');
  containers.forEach(async (container) => {
    if (props.payload.seriesId && props.payload.seriesId !== container.seriesId) {
      container.setAttribute('seriesId', props.payload.seriesId);
      const { speakers } = await getSpeakers(props.payload.seriesId);
      container.searchdata = speakers ?? [];
    }

    if (props.locale) {
      container.locale = props.locale;
    }

    container.requestUpdate();
  });
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

async function prefillProfiles(component, props) {
  const d = props.eventDataResp;

  if (d?.eventId && d.seriesId) {
    const { eventId, seriesId } = d;
    try {
      // eslint-disable-next-line max-len
      const speakers = await Promise.all(d.speakers.map(async (sp) => getHydratedEventSpeaker(seriesId, eventId, sp.speakerId)));
      for (let idx = 0; idx < d.speakers.length; idx += 1) {
        // eslint-disable-next-line max-len
        d.speakers[idx] = { ...d.speakers[idx], type: d.speakers[idx].speakerType, ...speakers[idx] };
      }

      if (!d.error && d) {
        props.eventDataResp = d;
      } else {
        getToastManager(component).showError(d.error?.message || 'Failed to fetch speaker data');
      }
    } catch (e) {
      window.lana?.log(`Error fetching speaker data:\n${JSON.stringify(e, null, 2)}`);
    }
  }
}

export default async function init(component, props) {
  await prefillProfiles(component, props);
  const eventData = props.eventDataResp;
  const speakers = getAttribute(eventData, 'speakers', props.locale);
  const profileContainer = component.querySelector('profile-container');
  if (!speakers || !speakers.length || !profileContainer) return;
  profileContainer.profiles = [...speakers];
  profileContainer.requestUpdate();
  component.classList.add('prefilled');
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
