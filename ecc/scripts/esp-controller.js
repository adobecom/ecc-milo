import { LIBS } from './scripts.js';
import { getEventServiceEnv, getSecret, signIn } from './utils.js';
import { getUser, userHasAccessToBU, userHasAccessToEvent, userHasAccessToSeries } from './profile.js';
import { API_CONFIG, ALLOWED_HOSTS } from './constants.js';

export function waitForAdobeIMS() {
  return new Promise((resolve) => {
    const checkIMS = () => {
      if (window.adobeIMS && window.adobeIMS.getAccessToken) {
        resolve();
      } else {
        setTimeout(checkIMS, 100);
      }
    };
    checkIMS();
  });
}

function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);

    if (!ALLOWED_HOSTS[url.hostname]) {
      window.lana?.log(`Blocked request to non-allowed host: ${url.hostname}`);
      return false;
    }

    if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
      window.lana?.log(`Blocked non-HTTPS request to: ${url.toString()}`);
      return false;
    }

    return true;
  } catch (e) {
    window.lana?.log(`Invalid URL: ${urlString}`, e);
    return false;
  }
}

async function safeFetch(url, options) {
  if (!isValidUrl(url)) {
    throw new Error('Invalid or unauthorized URL');
  }

  const nonInvasiveTest = new URLSearchParams(window.location.search).get('nonInvasiveTest') === 'true';
  if (nonInvasiveTest && ['PUT', 'POST', 'DELETE'].includes(options.method)) {
    console.log('Non-invasive test mode. Skipping request:', url, options);
    console.log('Payload:', JSON.parse(options.body));
    return { ok: true, status: 200, json: () => Promise.resolve({}) };
  }

  try {
    const response = await fetch(url, options);

    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json') && !contentType.includes('text/plain')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    return response;
  } catch (error) {
    window.lana?.log('Request failed:', error);
    throw error;
  }
}

export async function constructRequestOptions(method, body = null) {
  const secretEnv = getEventServiceEnv();
  const [
    { default: getUuid },
    clientIdentity,
  ] = await Promise.all([
    import(`${LIBS}/utils/getUuid.js`),
    getSecret(`${secretEnv}-client-identity`),
    waitForAdobeIMS(),
  ]);

  const headers = new Headers();
  const authToken = window.adobeIMS?.getAccessToken()?.token;

  if (!authToken) {
    signIn();
    return null;
  }

  const sanitizedHeaders = {
    Authorization: `Bearer ${authToken}`,
    'x-api-key': 'acom_event_service',
    'content-type': 'application/json',
    'x-request-id': await getUuid(new Date().getTime()),
    'x-client-identity': clientIdentity,
  };

  Object.entries(sanitizedHeaders).forEach(([key, value]) => {
    if (typeof value === 'string' && !value.includes('\n') && !value.includes('\r')) {
      headers.append(key, value);
    } else {
      throw new Error(`Invalid header value for ${key}`);
    }
  });

  const options = {
    method,
    headers,
  };

  if (body) {
    // Validate body is a string
    if (typeof body !== 'string') {
      throw new Error('Request body must be a string');
    }

    // Validate JSON structure
    try {
      JSON.parse(body);
    } catch (e) {
      throw new Error('Invalid JSON in request body');
    }

    options.body = body;
  }

  return options;
}

export async function uploadImage(file, configs, tracker, imageId = null) {
  const secretEnv = getEventServiceEnv();
  const [
    { default: getUuid },
    clientIdentity,
  ] = await Promise.all([
    import(`${LIBS}/utils/getUuid.js`),
    getSecret(`${secretEnv}-client-identity`),
    waitForAdobeIMS(),
  ]);

  const requestId = await getUuid(new Date().getTime());
  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const authToken = window.adobeIMS?.getAccessToken()?.token;

  let respJson = null;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = imageId ? 'PUT' : 'POST';
    const url = imageId ? `${host}${configs.targetUrl}/${imageId}` : `${host}${configs.targetUrl}`;

    xhr.open(method, url);
    xhr.setRequestHeader('x-image-alt-text', configs.altText || '');
    xhr.setRequestHeader('x-image-kind', configs.type);
    xhr.setRequestHeader('x-api-key', 'acom_event_service');
    xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
    xhr.setRequestHeader('x-request-id', requestId);
    xhr.setRequestHeader('x-client-identity', clientIdentity);

    if (tracker) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          tracker.progress = percentComplete;
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          respJson = JSON.parse(xhr.responseText);
          resolve(respJson);
        } catch (e) {
          window.lana?.log('Failed to parse image upload response. Error:', e);
          reject(e);
        }
      } else {
        window.lana?.log('Unexpected image upload server response. Response:', xhr.status);
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      window.lana?.log('Failed to upload image. Error:', xhr.statusText);
      reject(new Error(`Upload failed with status: ${xhr.statusText}`));
    };

    xhr.send(file);
  });
}

export async function getLocales() {
  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  try {
    const response = await safeFetch(`${host}/v1/locales`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get locales. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to get locales. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function deleteImage(configs, imageId) {
  if (!imageId || typeof imageId !== 'string') throw new Error('Invalid image ID');
  if (!configs || typeof configs !== 'object') throw new Error('Invalid image configs');

  await waitForAdobeIMS();
  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('DELETE');

  try {
    const response = await safeFetch(`${host}${configs.targetUrl}/${imageId}`, options);

    if (!response.ok) {
      const data = await response.json();
      window.lana?.log('Failed to delete image. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    // 204 no content. Return true if no error.
    return true;
  } catch (error) {
    window.lana?.log('Failed to delete image. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function createVenue(eventId, venueData) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!venueData || typeof venueData !== 'object') throw new Error('Invalid venue data');

  const { host } = API_CONFIG.esl[getEventServiceEnv()];
  const raw = JSON.stringify(venueData);
  const options = await constructRequestOptions('POST', raw);

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/venues`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to create venue. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data.espProvider || data;
  } catch (error) {
    window.lana?.log('Failed to create venue. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function replaceVenue(eventId, venueId, venueData) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!venueId || typeof venueId !== 'string') throw new Error('Invalid venue ID');
  if (!venueData || typeof venueData !== 'object') throw new Error('Invalid venue data');

  const { host } = API_CONFIG.esl[getEventServiceEnv()];
  const raw = JSON.stringify(venueData);
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/venues/${venueId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to replace venue. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data.espProvider || data;
  } catch (error) {
    window.lana?.log('Failed to replace venue. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getClouds() {
  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  try {
    const response = await safeFetch(`${host}/v1/clouds`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get clouds. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data.clouds;
  } catch (error) {
    window.lana?.log('Failed to get clouds. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getCloud(cloudType) {
  if (!cloudType || typeof cloudType !== 'string') throw new Error('Invalid cloud ID');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  try {
    const response = await safeFetch(`${host}/v1/clouds/${cloudType}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get cloud. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to get cloud. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function updateCloud(cloudType, cloudData) {
  if (!cloudType || typeof cloudType !== 'string') throw new Error('Invalid cloud Type');
  if (!cloudData || typeof cloudData !== 'object') throw new Error('Invalid cloud data');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify(cloudData);

  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await safeFetch(`${host}/v1/clouds/${cloudType}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to update cloud. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to update cloud. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function createEvent(payload, locale = 'en-US') {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid event payload');

  const { host } = API_CONFIG.esl[getEventServiceEnv()];
  const raw = JSON.stringify({
    ...payload,
    liveUpdate: false,
    published: false,
    defaultLocale: locale,
  });
  const options = await constructRequestOptions('POST', raw);

  try {
    const response = await safeFetch(`${host}/v1/events`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to create event. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data.espProvider || data;
  } catch (error) {
    window.lana?.log('Failed to create event. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function createSpeaker(profile, seriesId) {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');
  if (!profile || typeof profile !== 'object') throw new Error('Invalid speaker profile');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify(profile);
  const options = await constructRequestOptions('POST', raw);

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}/speakers`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to create speaker. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to create speaker. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function createSponsor(sponsorData, seriesId, locale = 'en-US') {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');
  if (!sponsorData || typeof sponsorData !== 'object') throw new Error('Invalid sponsor data');
  if (!locale || typeof locale !== 'string') throw new Error('Invalid locale');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify(sponsorData);
  const options = await constructRequestOptions('POST', raw);

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}/sponsors`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to create sponsor. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to create sponsor. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function updateSponsor(sponsorData, sponsorId, seriesId, locale = 'en-US') {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');
  if (!sponsorId || typeof sponsorId !== 'string') throw new Error('Invalid sponsor ID');
  if (!sponsorData || typeof sponsorData !== 'object') throw new Error('Invalid sponsor data');
  if (!locale || typeof locale !== 'string') throw new Error('Invalid locale');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify(sponsorData);
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}/sponsors/${sponsorId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to update sponsor. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to update sponsor. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function addSponsorToEvent(sponsorData, eventId) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!sponsorData || typeof sponsorData !== 'object') throw new Error('Invalid sponsor data');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify(sponsorData);
  const options = await constructRequestOptions('POST', raw);

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/sponsors`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to add sponsor to event. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to add sponsor to event. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function updateSponsorInEvent(sponsorData, sponsorId, eventId) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!sponsorId || typeof sponsorId !== 'string') throw new Error('Invalid sponsor ID');
  if (!sponsorData || typeof sponsorData !== 'object') throw new Error('Invalid sponsor data');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify(sponsorData);
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/sponsors/${sponsorId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to update sponsor in event. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to update sponsor in event. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function removeSponsorFromEvent(sponsorId, eventId) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!sponsorId || typeof sponsorId !== 'string') throw new Error('Invalid sponsor ID');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('DELETE');

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/sponsors/${sponsorId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to delete sponsor from event. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to delete sponsor from event. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getSponsor(seriesId, sponsorId) {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');
  if (!sponsorId || typeof sponsorId !== 'string') throw new Error('Invalid sponsor ID');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}/sponsors/${sponsorId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get sponsor. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to get sponsor. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getSponsors(seriesId) {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}/sponsors`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get sponsors. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to get sponsors. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getSponsorImages(seriesId, sponsorId) {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');
  if (!sponsorId || typeof sponsorId !== 'string') throw new Error('Invalid sponsor ID');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}/sponsors/${sponsorId}/images`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get sponsor images. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to get sponsor images. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function addSpeakerToEvent(speakerData, eventId) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!speakerData || typeof speakerData !== 'object') throw new Error('Invalid speaker data');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify(speakerData);
  const options = await constructRequestOptions('POST', raw);

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/speakers`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to add speaker to event. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to add speaker to event. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function updateSpeakerInEvent(speakerData, speakerId, eventId) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!speakerId || typeof speakerId !== 'string') throw new Error('Invalid speaker ID');
  if (!speakerData || typeof speakerData !== 'object') throw new Error('Invalid speaker data');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify(speakerData);
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/speakers/${speakerId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to update speaker in event. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to update speaker in event. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function removeSpeakerFromEvent(speakerId, eventId) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!speakerId || typeof speakerId !== 'string') throw new Error('Invalid speaker ID');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('DELETE');

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/speakers/${speakerId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to delete speaker from event. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to delete speaker from event. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getSpeaker(seriesId, speakerId) {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');
  if (!speakerId || typeof speakerId !== 'string') throw new Error('Invalid speaker ID');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}/speakers/${speakerId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get speaker details. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to get speaker details. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getEventSpeaker(seriesId, eventId, speakerId) {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!speakerId || typeof speakerId !== 'string') throw new Error('Invalid speaker ID');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  const seriesSpeaker = await getSpeaker(seriesId, speakerId);

  if (seriesSpeaker.error) {
    window.lana?.log('Failed to get event speaker details. Status:', seriesSpeaker.status, 'Error:', seriesSpeaker);
    return { status: seriesSpeaker.status, error: seriesSpeaker.error.message };
  }

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/speakers/${speakerId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get event speaker details. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return { ...seriesSpeaker, type: data.speakerType };
  } catch (error) {
    window.lana?.log('Failed to get event speaker details. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function updateSpeaker(profile, seriesId) {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');
  if (!profile || typeof profile !== 'object') throw new Error('Invalid speaker profile');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify(profile);
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}/speakers/${profile.speakerId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to update speaker. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to update speaker. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function updateEvent(eventId, payload) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!payload || typeof payload !== 'object') throw new Error('Invalid event payload');

  const { host } = API_CONFIG.esl[getEventServiceEnv()];
  const raw = JSON.stringify({ ...payload, liveUpdate: false, forceSpWrite: false });
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to update event ${eventId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data.espProvider || data;
  } catch (error) {
    window.lana?.log(`Failed to update event ${eventId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function publishEvent(eventId, payload) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!payload || typeof payload !== 'object') throw new Error('Invalid event payload');

  const { host } = API_CONFIG.esl[getEventServiceEnv()];
  const raw = JSON.stringify({
    ...payload,
    published: true,
    liveUpdate: true,
    forceSpWrite: false,
  });
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to publish event ${eventId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data.espProvider || data;
  } catch (error) {
    window.lana?.log(`Failed to publish event ${eventId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function unpublishEvent(eventId, payload) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!payload || typeof payload !== 'object') throw new Error('Invalid event payload');

  const { host } = API_CONFIG.esl[getEventServiceEnv()];
  const raw = JSON.stringify({
    ...payload,
    published: false,
    liveUpdate: true,
    forceSpWrite: false,
  });
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to unpublish event ${eventId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data.espProvider || data;
  } catch (error) {
    window.lana?.log(`Failed to unpublish event ${eventId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function previewEvent(eventId, payload) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!payload || typeof payload !== 'object') throw new Error('Invalid event payload');

  const { host } = API_CONFIG.esl[getEventServiceEnv()];
  const raw = JSON.stringify({
    ...payload,
    liveUpdate: false,
    forceSpWrite: true,
  });
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to preview event ${eventId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data.espProvider || data;
  } catch (error) {
    window.lana?.log(`Failed to preview event ${eventId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function deleteEvent(eventId) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');

  const { host } = API_CONFIG.esl[getEventServiceEnv()];
  const options = await constructRequestOptions('DELETE');

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}`, options);

    if (!response.ok) {
      const data = await response.json();
      window.lana?.log(`Failed to delete event ${eventId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    // 204 no content. Return true if no error.
    return true;
  } catch (error) {
    window.lana?.log(`Failed to delete event ${eventId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getEvents() {
  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  try {
    const response = await safeFetch(`${host}/v1/events`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get list of events. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to get list of events. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getEventsForUser() {
  const user = await getUser();

  if (!user) return [];

  const resp = await getEvents();
  if (!resp.error) {
    const { role } = user;

    if (role === 'admin') return resp.events;

    if (role === 'manager') return resp.events.filter((e) => userHasAccessToBU(user, e.cloudType));

    if (role === 'creator') {
      return resp.events
        .filter((e) => userHasAccessToBU(user, e.cloudType))
        .filter((e) => userHasAccessToSeries(user, e.seriesId));
    }

    if (role === 'editor') {
      return resp.events
        .filter((e) => userHasAccessToBU(user, e.cloudType))
        .filter((e) => userHasAccessToSeries(user, e.seriesId))
        .filter((e) => userHasAccessToEvent(user, e.eventId));
    }
  }

  return [];
}

export async function getEvent(eventId) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid eventId');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');
  const url = `${host}/v1/events/${encodeURIComponent(eventId)}`;

  try {
    const response = await safeFetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to get details for event ${eventId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    if (data.speakers) {
      const promises = data.speakers.map((spkr) => getSpeaker(data.seriesId, spkr.speakerId));
      const speakers = await Promise.all(promises);
      data.speakers = speakers;
    }
    return data;
  } catch (error) {
    window.lana?.log(`Failed to get details for event ${eventId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getVenue(eventId) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid eventId');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/venues`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get venue details. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to get venue details. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getAllSeries() {
  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  try {
    const response = await safeFetch(`${host}/v1/series`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to fetch series. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to fetch series. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getSeriesById(seriesId) {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to fetch series ${seriesId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to fetch series ${seriesId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function createSeries(seriesData) {
  if (!seriesData || typeof seriesData !== 'object') throw new Error('Invalid series data');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify({ ...seriesData, seriesStatus: 'draft' });
  const options = await constructRequestOptions('POST', raw);

  try {
    const response = await safeFetch(`${host}/v1/series`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to create series. Status:', response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to create series. Error:', error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function updateSeries(seriesId, seriesData) {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');
  if (!seriesData || typeof seriesData !== 'object') throw new Error('Invalid series data');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify({ ...seriesData, seriesId });
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to update series ${seriesId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to update series ${seriesId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function publishSeries(seriesId, seriesData) {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');
  if (!seriesData || typeof seriesData !== 'object') throw new Error('Invalid series data');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify({ ...seriesData, seriesId, seriesStatus: 'published' });
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to publish series ${seriesId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to publish series ${seriesId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function unpublishSeries(seriesId, seriesData) {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');
  if (!seriesData || typeof seriesData !== 'object') throw new Error('Invalid series data');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify({ ...seriesData, seriesId, seriesStatus: 'draft' });
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to unpublish series ${seriesId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to unpublish series ${seriesId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function archiveSeries(seriesId, seriesData) {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');
  if (!seriesData || typeof seriesData !== 'object') throw new Error('Invalid series data');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify({ ...seriesData, seriesId, seriesStatus: 'archived' });
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to archive series ${seriesId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to archive series ${seriesId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getSeriesForUser() {
  const user = await getUser();

  if (!user) return [];

  const { series } = await getAllSeries();

  if (series) {
    const { role } = user;

    if (role === 'admin') return series;
    if (role === 'manager') return series.filter((s) => userHasAccessToBU(user, s.cloudType));
    if (role === 'creator' || role === 'editor') {
      return series
        .filter((s) => userHasAccessToBU(user, s.cloudType))
        .filter((s) => userHasAccessToSeries(user, s.seriesId));
    }
  }

  return [];
}

export async function deleteSeries(seriesId) {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('DELETE');

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}`, options);

    if (!response.ok) {
      const data = await response.json();
      window.lana?.log(`Failed to delete series ${seriesId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    // 204 no content. Return true if no error.
    return true;
  } catch (error) {
    window.lana?.log(`Failed to delete series ${seriesId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function createAttendee(eventId, attendeeData) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!attendeeData || typeof attendeeData !== 'object') throw new Error('Invalid attendee data');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify(attendeeData);
  const options = await constructRequestOptions('POST', raw);

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/attendees`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to create attendee for event ${eventId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to create attendee for event ${eventId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function updateAttendee(eventId, attendeeId, attendeeData) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!attendeeId || typeof attendeeId !== 'string') throw new Error('Invalid attendee ID');
  if (!attendeeData || typeof attendeeData !== 'object') throw new Error('Invalid attendee data');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const raw = JSON.stringify(attendeeData);
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/attendees/${attendeeId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to update attendee ${attendeeId} for event ${eventId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to update attendee ${attendeeId} for event ${eventId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function removeAttendeeFromEvent(eventId, attendeeId) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!attendeeId || typeof attendeeId !== 'string') throw new Error('Invalid attendee ID');

  const { host } = API_CONFIG.esl[getEventServiceEnv()];
  const options = await constructRequestOptions('DELETE');

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/attendees/${attendeeId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to delete attendee ${attendeeId} for event ${eventId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to delete attendee ${attendeeId} for event ${eventId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getEventAttendees(eventId) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/attendees`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to fetch attendees for event ${eventId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to fetch attendees for event ${eventId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getAllEventAttendees(eventId) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');

  const recurGetAttendees = async (fullAttendeeArr = [], nextPageToken = null) => {
    const { host } = API_CONFIG.esp[getEventServiceEnv()];
    const options = await constructRequestOptions('GET');
    const fetchUrl = nextPageToken ? `${host}/v1/events/${eventId}/attendees?nextPageToken=${nextPageToken}` : `${host}/v1/events/${eventId}/attendees`;

    return safeFetch(fetchUrl, options)
      .then((response) => {
        if (!response.ok) {
          window.lana?.log(`Failed to fetch attendees for event ${eventId}. Status:`, response.status);
          return { status: response.status, error: response.statusText };
        }

        return response.json();
      })
      .then((data) => {
        if (data.nextPageToken) {
          return recurGetAttendees(fullAttendeeArr.concat(data.attendees), data.nextPageToken);
        }

        return fullAttendeeArr.concat(data.attendees || []);
      })
      .catch((error) => {
        window.lana?.log(`Failed to fetch attendees for event ${eventId}. Error:`, error);
        return { status: 'Network Error', error: error.message };
      });
  };

  return recurGetAttendees();
}

export async function getAttendee(eventId, attendeeId) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');
  if (!attendeeId || typeof attendeeId !== 'string') throw new Error('Invalid attendee ID');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/attendees/${attendeeId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to get details of attendee ${attendeeId} for event ${eventId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to get details of attendee ${attendeeId} for event ${eventId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getSpeakers(seriesId) {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}/speakers`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to get details of speakers for series ${seriesId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to get details of speakers for series ${seriesId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function getEventImages(eventId) {
  if (!eventId || typeof eventId !== 'string') throw new Error('Invalid event ID');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('GET');

  try {
    const response = await safeFetch(`${host}/v1/events/${eventId}/images`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to get event images for event ${eventId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to get event images for event ${eventId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}

export async function deleteSpeakerImage(speakerId, seriesId, imageId) {
  if (!seriesId || typeof seriesId !== 'string') throw new Error('Invalid series ID');
  if (!speakerId || typeof speakerId !== 'string') throw new Error('Invalid speaker ID');
  if (!imageId || typeof imageId !== 'string') throw new Error('Invalid image ID');

  const { host } = API_CONFIG.esp[getEventServiceEnv()];
  const options = await constructRequestOptions('DELETE');

  try {
    const response = await safeFetch(`${host}/v1/series/${seriesId}/speakers/${speakerId}/images/${imageId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to delete speaker images for speaker ${speakerId}. Status:`, response.status, 'Error:', data);
      return { status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to delete speaker images for speaker ${speakerId}. Error:`, error);
    return { status: 'Network Error', error: error.message };
  }
}
