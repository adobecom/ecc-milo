import { addSpeakerToEvent } from '../../../utils/esp-controller.js';
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

export default function init(component, props) {
  const eventData = props.eventDataResp;
  const { speakers } = eventData;
  const profileContainer = component.querySelector('profile-container');
  if (!speakers || !profileContainer) return;
  profileContainer.profiles = speakers;
  profileContainer.requestUpdate();
}
