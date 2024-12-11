import BlockMediator from './deps/block-mediator.min.js';

let usersCache = [];

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

export async function getUser() {
  const profile = BlockMediator.get('imsProfile');
  if (!profile || profile.noProfile) return null;

  const { email } = profile;

  if (usersCache.length === 0) {
    const resp = await fetch('/ecc/system/users.json')
      .then((r) => r)
      .catch((e) => window.lana?.log(`Failed to fetch Google Places API key: ${e}`));

    if (!resp.ok) return null;

    const json = await resp.json();
    usersCache = json.data;
  }

  const user = usersCache.find((s) => s.email === email);
  return user;
}

export function userHasAccessToBU(user, bu) {
  if (!user) return false;

  const userBU = user['business-units'];

  if (!userBU) return false;

  if (userBU === 'all') return true;

  const businessUnits = userBU.split(',').map((b) => b.trim());
  return businessUnits.length === 0 || businessUnits.includes(bu);
}

export function userHasAccessToSeries(user, seriesId) {
  if (!user) return false;

  const userSeries = user.series;

  if (!userSeries) return false;

  if (userSeries === 'all') return true;

  const series = userSeries.split(',').map((b) => b.trim());
  return series.length === 0 || series.includes(seriesId);
}

export function userHasAccessToEvent(user, eventId) {
  if (!user) return false;

  const userEvents = user.events;

  if (!userEvents) return false;

  if (userEvents === 'all') return true;

  const events = userEvents.split(',').map((b) => b.trim());
  return events.length === 0 || events.includes(eventId);
}

export async function initProfileLogicTree(callbacks) {
  const { noProfile, noAccessProfile, validProfile } = callbacks;

  const profile = BlockMediator.get('imsProfile');
  let user;

  if (profile) {
    user = await getUser();
    if (profile.noProfile) {
      noProfile();
    } else if (!user) {
      noAccessProfile();
    } else {
      validProfile(profile);
    }

    return;
  }

  if (!profile) {
    const unsubscribe = BlockMediator.subscribe('imsProfile', ({ newValue }) => {
      getUser().then((u) => {
        if (newValue) {
          if (newValue.noProfile) {
            noProfile();
          } else if (!u) {
            noAccessProfile();
          } else {
            validProfile(newValue);
          }
        }

        unsubscribe();
      });
    });
  }
}
