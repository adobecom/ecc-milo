import { addSpeakerToEvent } from '../../../utils/esp-controller.js';
import getJoinedData, { getFilteredResponse } from '../data-handler.js';

export async function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const profileContainer = component.querySelector('profile-container');
  if (profileContainer) {
    const speakers = profileContainer.getProfiles();
    if (speakers.length === 0) return;

    await speakers.reduce(async (promise, speaker) => {
      await promise;

      const resp = await addSpeakerToEvent(speaker, getFilteredResponse().eventId);
      if (!resp || resp.errors) {
        return;
      }

      props.response = resp;
    }, Promise.resolve());
  }
}

export default function init(component) {
  const eventData = getJoinedData();
  const { profiles } = eventData;
  const profileContainer = component.querySelector('profile-container');
  if (!profiles || !profileContainer) return;
  profileContainer.profiles = profiles;
  profileContainer.requestUpdate();
}
