/* eslint-disable no-unused-vars */
import { addSpeakerToEvent, getSpeaker, getSpeakers } from '../../../scripts/esp-controller.js';
import { getFilteredCachedResponse } from '../data-handler.js';

export async function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const profileContainer = component.querySelector('profile-container');
  if (profileContainer) {
    const speakers = profileContainer.getProfiles();
    if (speakers.length === 0) return;

    await speakers.reduce(async (promise, speaker) => {
      await promise;

      const resp = await addSpeakerToEvent(speaker, getFilteredCachedResponse().eventId);
      if (!resp || resp.errors) {
        return;
      }

      props.eventDataResp = { ...props.eventDataResp, ...resp };
    }, Promise.resolve());
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
      d.speakers = speakers;
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
