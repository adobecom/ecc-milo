/* eslint-disable no-unused-vars */
import {
  addSpeakerToEvent,
  getSpeakers,
  updateSpeakerInEvent,
  removeSpeakerFromEvent,
  getEventSpeaker,
  getEvent,
} from '../../scripts/esp-controller.js';

export async function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const profileContainer = component.querySelector('profile-container');
  if (profileContainer) {
    const { eventId } = props.eventDataResp;
    const speakers = profileContainer.getProfiles();

    if (speakers.length === 0) {
      if (props.eventDataResp.speakers) {
        const savedSpeakers = props.eventDataResp.speakers;
        await Promise.all(savedSpeakers.map(async (speaker) => {
          const { speakerId } = speaker;
          const resp = await removeSpeakerFromEvent(speakerId, eventId);

          if (!resp.ok) {
            window.lana?.log(`Failed to remove speaker from event:\n${JSON.stringify(resp, null, 2)}`);
          }
        }));
      }

      return;
    }

    if (speakers.filter((speaker) => !speaker.speakerType).length > 0) {
      throw new Error('Please select a speaker type for the speakers');
    }

    // Process all speakers in parallel
    await Promise.all(speakers.map(async (speaker) => {
      const { speakerId, speakerType, ordinal } = speaker;

      if (!props.eventDataResp.speakers) {
        const resp = await addSpeakerToEvent(speaker, eventId);

        if (resp.error) {
          component.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: resp.error } }));
          window.lana?.log(`Failed to add speaker to event:\n${JSON.stringify(resp, null, 2)}`);
        }
      } else {
        const existingSpeaker = props.eventDataResp.speakers.find((profile) => {
          const idMatch = profile.speakerId === speakerId;
          const typeMatch = profile.speakerType === speakerType;
          const ordinalMatch = profile.ordinal === ordinal;
          return idMatch && typeMatch && ordinalMatch;
        });

        if (existingSpeaker) {
          // do nothing
        } else {
          // eslint-disable-next-line max-len
          const updateSpeaker = props.eventDataResp.speakers.find((profile) => profile.speakerId === speakerId);
          if (updateSpeaker) {
            const resp = await updateSpeakerInEvent(speaker, speakerId, eventId);

            if (resp.error) {
              window.lana?.log(`Failed to update speaker in event:\n${JSON.stringify(resp, null, 2)}`);
            }
          } else {
            const resp = await addSpeakerToEvent(speaker, eventId);
            if (resp.error) {
              window.lana?.log(`Failed to add speaker to event:\n${JSON.stringify(resp, null, 2)}`);
            }
          }
        }
      }
    }));

    if (props.eventDataResp.speakers) {
      const savedSpeakers = props.eventDataResp.speakers;
      await Promise.all(savedSpeakers.map(async (speaker) => {
        const { speakerId } = speaker;
        const stillNeeded = speakers.find((profile) => profile.speakerId === speakerId);

        if (!stillNeeded) {
          const resp = await removeSpeakerFromEvent(speakerId, eventId);

          if (!resp.ok) {
            window.lana?.log(`Failed to remove speaker from event:\n${JSON.stringify(resp, null, 2)}`);
          }
        }
      }));
    }

    const updatedEventData = await getEvent(eventId);
    props.eventDataResp = { ...props.eventDataResp, ...updatedEventData };
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
    container.requestUpdate();
  });
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

async function prefillProfiles(props) {
  const d = props.eventDataResp;

  if (d?.eventId && d.seriesId) {
    const { eventId, seriesId } = d;
    try {
      // eslint-disable-next-line max-len
      const speakers = await Promise.all(d.speakers.map(async (sp) => getEventSpeaker(seriesId, eventId, sp.speakerId)));
      for (let idx = 0; idx < d.speakers.length; idx += 1) {
        // eslint-disable-next-line max-len
        d.speakers[idx] = { ...d.speakers[idx], type: d.speakers[idx].speakerType, ...speakers[idx] };
      }

      props.eventDataResp = { ...props.eventDataResp, ...d };
    } catch (e) {
      window.lana?.log(`Error fetching speaker data:\n${JSON.stringify(e, null, 2)}`);
    }
  }
}

export default async function init(component, props) {
  await prefillProfiles(props);
  const eventData = props.eventDataResp;
  const { speakers } = eventData;
  const profileContainer = component.querySelector('profile-container');
  if (!speakers || !speakers.length || !profileContainer) return;
  profileContainer.profiles = [...speakers];
  profileContainer.requestUpdate();
  component.classList.add('prefilled');
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
