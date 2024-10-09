import BlockMediator from './deps/block-mediator.min.js';
import { ALLOWED_ACCOUNT_TYPES } from '../constants/constants.js';

export async function getProfile() {
  const { feds, adobeProfile, fedsConfig, adobeIMS } = window;

  const getUserProfile = () => {
    if (fedsConfig?.universalNav) {
      return feds?.services?.universalnav?.interface?.adobeProfile?.getUserProfile()
          || adobeProfile?.getUserProfile();
    }

    return (
      feds?.services?.profile?.interface?.adobeProfile?.getUserProfile()
      || adobeProfile?.getUserProfile()
      || adobeIMS?.getProfile()
    );
  };

  const profile = await getUserProfile();

  if (profile) return profile;

  window.lana?.log('Failed to get user profile data.');
  return {};
}

export async function captureProfile() {
  try {
    const profile = await getProfile();
    BlockMediator.set('imsProfile', profile);
  } catch {
    if (window.adobeIMS) {
      BlockMediator.set('imsProfile', { noProfile: true });
    }
  }
}

export function lazyCaptureProfile() {
  let attempCounter = 0;
  const profileRetryer = setInterval(async () => {
    if (!window.adobeIMS) {
      attempCounter += 1;
      return;
    }

    if (attempCounter >= 10) {
      clearInterval(profileRetryer);
    }

    try {
      const profile = await getProfile();
      BlockMediator.set('imsProfile', profile);
      clearInterval(profileRetryer);
    } catch {
      if (window.adobeIMS) {
        clearInterval(profileRetryer);
        BlockMediator.set('imsProfile', { noProfile: true });
      }

      attempCounter += 1;
    }
  }, 1000);
}

export function initProfileLogicTree(callbacks) {
  const { noProfile, noAccessProfile, validProfile } = callbacks;

  const profile = BlockMediator.get('imsProfile');

  if (profile) {
    if (profile.noProfile) {
      noProfile();
    } else if (!ALLOWED_ACCOUNT_TYPES.includes(profile.account_type)) {
      noAccessProfile();
    } else {
      validProfile(profile);
    }

    return;
  }

  if (!profile) {
    const unsubscribe = BlockMediator.subscribe('imsProfile', ({ newValue }) => {
      if (newValue) {
        if (newValue.noProfile) {
          noProfile();
        } else if (!ALLOWED_ACCOUNT_TYPES.includes(newValue.account_type)) {
          noAccessProfile();
        } else {
          validProfile(newValue);
        }
      }

      unsubscribe();
    });
  }
}
