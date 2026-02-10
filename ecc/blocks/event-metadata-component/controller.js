/* eslint-disable no-unused-vars */
import {
  createPublishingProfile,
  updatePublishingProfile,
  getEventPublishingProfile,
  assignPublishingProfileToEvent,
} from '../../scripts/esp-controller.js';
import { changeInputValue } from '../../scripts/utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';
import { filterPublishingProfileData } from '../../scripts/data-utils.js';

function getMetadataFromComponent(component) {
  const metadata = {};
  const pickers = component.querySelectorAll('sp-picker[id$="-picker"]');

  pickers.forEach((picker) => {
    const key = picker.id.replace('-picker', '');
    const { value } = picker;

    // Only include fields with actual values (not "No {label}" options)
    if (value && !value.startsWith('No ')) {
      metadata[key] = value;
    }
  });

  return metadata;
}

function prefillMetadata(component, metadata) {
  if (!metadata || typeof metadata !== 'object') return;

  Object.entries(metadata).forEach(([key, value]) => {
    const picker = component.querySelector(`#${key}-picker`);
    if (picker && value) {
      changeInputValue(picker, 'value', value);
    }
  });
}

function showErrorToast(component, message) {
  component.dispatchEvent(new CustomEvent('show-error-toast', {
    detail: { error: { message } },
    bubbles: true,
    composed: true,
  }));
}

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const metadata = getMetadataFromComponent(component);

  // Store metadata in payload for publishing profile creation/update
  setPropsPayload(props, { metadata });
}

export async function onPayloadUpdate(component, props) {
  // Handle payload updates if needed
}

export async function onRespUpdate(component, props) {
  const { eventDataResp } = props;
  if (!eventDataResp?.eventId) return;

  try {
    const eventPublishingProfile = await getEventPublishingProfile(eventDataResp.eventId);

    if (!eventPublishingProfile?.error && eventPublishingProfile?.profile) {
      const { profile } = eventPublishingProfile;

      component.dataset.profileId = profile.profileId;
      component.dataset.modificationTime = profile.modificationTime;

      if (profile.metadata) {
        prefillMetadata(component, profile.metadata);
      }

      component.classList.add('prefilled');
    }
  } catch (error) {
    window.lana?.log(`Failed to fetch event publishing profile: ${error.message}`);
  }
}

export default async function init(component, props) {
  // Initialize component - metadata catalogue and pickers are already built by the main component
}

export async function onTargetUpdate(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const { eventDataResp } = props;
  if (!eventDataResp?.eventId) return;

  const metadata = getMetadataFromComponent(component);
  const existingProfileId = component.dataset.profileId;

  try {
    if (!existingProfileId) {
      const profileData = filterPublishingProfileData({
        name: `${eventDataResp.title || 'Event'} - Publishing Profile`,
        description: `Publishing profile for event ${eventDataResp.eventId}`,
        metadata,
        status: 'active',
      }, 'submission');

      const createResp = await createPublishingProfile(profileData);
      if (createResp?.error) {
        showErrorToast(component, 'Failed to create publishing profile');
        return;
      }

      const assignResp = await assignPublishingProfileToEvent(
        eventDataResp.eventId,
        createResp.profileId,
      );
      if (assignResp?.error) {
        showErrorToast(component, 'Failed to assign publishing profile to event');
        return;
      }

      component.dataset.profileId = createResp.profileId;
      component.dataset.modificationTime = createResp.modificationTime;
    } else {
      const modificationTime = Number(component.dataset.modificationTime);
      const profileData = filterPublishingProfileData({
        name: `${eventDataResp.title || 'Event'} - Publishing Profile`,
        description: `Publishing profile for event ${eventDataResp.eventId}`,
        metadata,
        status: 'active',
        modificationTime,
      }, 'update');

      const updateResp = await updatePublishingProfile(existingProfileId, profileData);
      if (updateResp?.error) {
        showErrorToast(component, 'Failed to update publishing profile');
        return;
      }

      component.dataset.modificationTime = updateResp.modificationTime;
    }
  } catch (error) {
    window.lana?.log(`Failed to handle publishing profile: ${error.message}`);
    showErrorToast(component, error.message);
  }
}
