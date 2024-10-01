import BlockMediator from './deps/block-mediator.min.js';

export function getECCEnv() {
  const validEnvs = ['dev', 'stage', 'prod'];
  const { host, search } = window.location;
  const SLD = host.includes('.aem.') ? 'aem' : 'hlx';
  const usp = new URLSearchParams(search);
  const eccEnv = usp.get('eccEnv');

  if (validEnvs.includes(eccEnv)) return eccEnv;

  if (((host.includes(`${SLD}.page`) || host.includes(`${SLD}.live`)) && host.startsWith('dev--'))
    || host.includes('localhost')) return 'dev';

  if (((host.includes(`${SLD}.page`) || host.includes(`${SLD}.live`)) && host.startsWith('stage--'))
    || host.includes('stage.adobe')
    || host.includes('corp.adobe')
    || host.includes('graybox.adobe')) return 'stage';

  if (((host.includes(`${SLD}.page`) || host.includes(`${SLD}.live`)) && host.startsWith('main--')) || host.endsWith('adobe.com')) return 'prod';

  // fallback to dev
  return 'dev';
}

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
        const sp = new URLSearchParams(window.location.search);
        const devToken = sp.get('devToken');
        if (devToken && getECCEnv() === 'dev') {
          clearInterval(profileRetryer);
          window.adobeIMS.getAccessToken = () => new Promise((resolve) => {
            resolve({ token: devToken });
          });
          window.adobeIMS.getProfile = () => new Promise((resolve) => {
            resolve({
              account_type: 'type3',
              utcOffset: 'null',
              preferred_languages: null,
              displayName: 'Developer',
              last_name: 'User',
              userId: 'B90719A765B288680A494219@c62f24cc5b5b7e0e0a494004',
              authId: 'B90719A765B288680A494219@c62f24cc5b5b7e0e0a494004',
              tags: [
                'agegroup_unknown',
                'edu',
                'edu_k12',
              ],
              emailVerified: 'true',
              phoneNumber: null,
              countryCode: 'US',
              name: 'Developer User',
              mrktPerm: '',
              mrktPermEmail: null,
              first_name: 'Developer',
              email: 'cod87753@adobe.com',
            });
          });
        } else {
          clearInterval(profileRetryer);
          BlockMediator.set('imsProfile', { noProfile: true });
        }
      }

      attempCounter += 1;
    }
  }, 1000);
}
