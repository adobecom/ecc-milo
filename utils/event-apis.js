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

  if (profile) {
    console.log('Fetched user profile:', profile);
    return profile;
  }

  return {};
}

export async function captureProfile() {
  try {
    const profile = await getProfile();
    window.bm8tr.set('imsProfile', profile);
  } catch {
    if (window.adobeIMS) {
      window.bm8tr.set('imsProfile', { noProfile: true });
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
      window.bm8tr.set('imsProfile', profile);
      clearInterval(profileRetryer);
    } catch {
      if (window.adobeIMS) {
        clearInterval(profileRetryer);
        window.bm8tr.set('imsProfile', { noProfile: true });
      }

      attempCounter += 1;
    }
  }, 1000);
}
