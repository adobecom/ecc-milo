import { addSpeakerToEvent } from '../../../utils/esp-controller.js';
import getJoinedData, { getFilteredResponse } from '../data-handler.js';

export async function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const profileContainer = component.querySelector('profile-container');
  if (profileContainer) {
    const speakers = profileContainer.getProfiles();
    if (speakers.length === 0) return;

    speakers.forEach(async (speaker) => {
      const resp = await addSpeakerToEvent(speaker, getFilteredResponse().eventId);
      if (!resp || resp.errors) return;
      props.response = resp;
    });
  }
}

export default function init(component, props) {
  const eventData = getJoinedData();
  const { profiles } = eventData;
  const profileContainer = component.querySelector('profile-container');
  if (!profiles || !profileContainer) return;
  profileContainer.profiles = profiles;
  profileContainer.requestUpdate();
}
