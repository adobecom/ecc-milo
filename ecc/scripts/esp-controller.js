import { ECC_ENV } from './scripts.js';

export const getCaasTags = (() => {
  let cache;
  let promise;

  return () => {
    if (cache) {
      return cache;
    }

    if (!promise) {
      promise = fetch('https://www.adobe.com/chimera-api/tags')
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          }

          throw new Error('Failed to load tags');
        })
        .then((data) => {
          cache = data;
          return data;
        })
        .catch((err) => {
          window.lana?.log(`Failed to load products map JSON. Error: ${err}`);
          throw err;
        });
    }

    return promise;
  };
})();

function getAPIConfig() {
  return {
    esl: {
      local: { host: 'http://localhost:8499' },
      dev: { host: 'https://wcms-events-service-layer-deploy-ethos102-stage-va-9c3ecd.stage.cloud.adobe.io' },
      stage: { host: 'https://events-service-layer-stage.adobe.io' },
      prod: { host: 'https://events-service-layer.adobe.io' },
    },
    esp: {
      local: { host: 'http://localhost:8500' },
      dev: { host: 'https://wcms-events-service-platform-deploy-ethos102-stage-caff5f.stage.cloud.adobe.io' },
      stage: { host: 'https://events-service-platform-stage.adobe.io' },
      prod: { host: 'https://events-service-platform.adobe.io' },
    },
  };
}

function waitForAdobeIMS() {
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

async function constructRequestOptions(method, body = null) {
  await waitForAdobeIMS();

  const headers = new Headers();
  const authToken = window.adobeIMS?.getAccessToken()?.token;
  headers.append('Authorization', `Bearer ${authToken}`);
  headers.append('content-type', 'application/json');

  const options = {
    method,
    headers,
  };

  if (body) options.body = body;

  return options;
}

export async function uploadImage(file, configs, tracker, imageId = null) {
  await waitForAdobeIMS();

  const { host } = getAPIConfig().esp[ECC_ENV];
  const authToken = window.adobeIMS?.getAccessToken()?.token;

  let respJson = null;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = imageId ? 'PUT' : 'POST';
    const url = imageId ? `${host}${configs.targetUrl}/${imageId}` : `${host}${configs.targetUrl}`;

    xhr.open(method, url);
    xhr.setRequestHeader('x-image-alt-text', configs.altText || '');
    xhr.setRequestHeader('x-image-kind', configs.type);
    xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);

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

function convertToNSpeaker(profile) {
  const {
    // eslint-disable-next-line max-len
    speakerId, firstName, lastName, title, company, bio, socialMedia, creationTime, modificationTime,
  } = profile;

  return {
    speakerId,
    firstName,
    lastName,
    title,
    company,
    bio,
    socialLinks: socialMedia,
    creationTime,
    modificationTime,
  };
}

function convertToSpeaker(speaker) {
  const {
    // eslint-disable-next-line max-len
    speakerId, firstName, lastName, title, company, bio, socialLinks, creationTime, modificationTime, photo,
  } = speaker;

  return {
    speakerId,
    firstName,
    lastName,
    title,
    company,
    bio,
    photo,
    socialMedia: socialLinks || [],
    creationTime,
    modificationTime,
  };
}

export async function deleteImage(configs, imageId) {
  await waitForAdobeIMS();
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('DELETE');

  try {
    const response = await fetch(`${host}${configs.targetUrl}/${imageId}`, options);

    if (!response.ok) {
      const data = await response.json();
      window.lana?.log('Failed to delete image. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    // 204 no content. Return true if no error.
    return true;
  } catch (error) {
    window.lana?.log('Failed to delete image. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function createVenue(eventId, venueData) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(venueData);
  const options = await constructRequestOptions('POST', raw);

  try {
    const response = await fetch(`${host}/v1/events/${eventId}/venues`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to create venue. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to create venue. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function replaceVenue(eventId, venueId, venueData) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(venueData);
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await fetch(`${host}/v1/events/${eventId}/venues/${venueId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to replace venue. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to replace venue. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function createEvent(payload) {
  const { host } = getAPIConfig().esl[ECC_ENV];
  const raw = JSON.stringify(payload);
  const options = await constructRequestOptions('POST', raw);

  try {
    const response = await fetch(`${host}/v1/events`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to create event. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to create event. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function createSpeaker(profile, seriesId) {
  const nSpeaker = convertToNSpeaker(profile);

  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify({ ...nSpeaker, seriesId });
  const options = await constructRequestOptions('POST', raw);

  try {
    const response = await fetch(`${host}/v1/series/${seriesId}/speakers`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to create speaker. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to create speaker. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function createSponsor(sponsorData, seriesId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(sponsorData);
  const options = await constructRequestOptions('POST', raw);

  try {
    const response = await fetch(`${host}/v1/series/${seriesId}/sponsors`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to create sponsor. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to create sponsor. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function updateSponsor(sponsorData, sponsorId, seriesId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(sponsorData);
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await fetch(`${host}/v1/series/${seriesId}/sponsors/${sponsorId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to update sponsor. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to update sponsor. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function addSponsorToEvent(sponsorData, eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(sponsorData);
  const options = await constructRequestOptions('POST', raw);

  try {
    const response = await fetch(`${host}/v1/events/${eventId}/sponsors`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to add sponsor to event. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to add sponsor to event. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function updateSponsorInEvent(sponsorData, sponsorId, eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(sponsorData);
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await fetch(`${host}/v1/events/${eventId}/sponsors/${sponsorId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to update sponsor in event. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to update sponsor in event. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function removeSponsorFromEvent(sponsorId, eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('DELETE');

  try {
    const response = await fetch(`${host}/v1/events/${eventId}/sponsors/${sponsorId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to delete sponsor from event. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to delete sponsor from event. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function getSponsor(seriesId, sponsorId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  try {
    const response = await fetch(`${host}/v1/series/${seriesId}/sponsors/${sponsorId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get sponsor. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to get sponsor. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function getSponsors(seriesId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  try {
    const response = await fetch(`${host}/v1/series/${seriesId}/sponsors`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get sponsors. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to get sponsors. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function getSponsorImages(seriesId, sponsorId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  try {
    const response = await fetch(`${host}/v1/series/${seriesId}/sponsors/${sponsorId}/images`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get sponsor images. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to get sponsor images. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function addSpeakerToEvent(speakerData, eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(speakerData);
  const options = await constructRequestOptions('POST', raw);

  try {
    const response = await fetch(`${host}/v1/events/${eventId}/speakers`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to add speaker to event. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to add speaker to event. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function updateSpeakerInEvent(speakerData, speakerId, eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(speakerData);
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await fetch(`${host}/v1/events/${eventId}/speakers/${speakerId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to update speaker in event. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to update speaker in event. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function removeSpeakerFromEvent(speakerId, eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('DELETE');

  try {
    const response = await fetch(`${host}/v1/events/${eventId}/speakers/${speakerId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to delete speaker from event. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to delete speaker from event. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function updateSpeaker(profile, seriesId) {
  const nSpeaker = convertToNSpeaker(profile);
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify({ ...nSpeaker, seriesId });
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await fetch(`${host}/v1/series/${seriesId}/speakers/${profile.speakerId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to update speaker. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to update speaker. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function updateEvent(eventId, payload) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(payload);
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await fetch(`${host}/v1/events/${eventId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to update event ${eventId}. Status:`, response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to update event ${eventId}. Error:`, error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function publishEvent(eventId, payload) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify({ ...payload, published: true });
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await fetch(`${host}/v1/events/${eventId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to publish event ${eventId}. Status:`, response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to publish event ${eventId}. Error:`, error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function unpublishEvent(eventId, payload) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify({ ...payload, published: false });
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await fetch(`${host}/v1/events/${eventId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to unpublish event ${eventId}. Status:`, response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to unpublish event ${eventId}. Error:`, error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function deleteEvent(eventId) {
  const { host } = getAPIConfig().esl[ECC_ENV];
  const options = await constructRequestOptions('DELETE');

  try {
    const response = await fetch(`${host}/v1/events/${eventId}`, options);

    if (!response.ok) {
      const data = await response.json();
      window.lana?.log(`Failed to delete event ${eventId}. Status:`, response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    // 204 no content. Return true if no error.
    return true;
  } catch (error) {
    window.lana?.log(`Failed to delete event ${eventId}. Error:`, error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function getEvents() {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  try {
    const response = await fetch(`${host}/v1/events`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get list of events. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to get list of events. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function getEvent(eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  try {
    const response = await fetch(`${host}/v1/events/${eventId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to get details for event ${eventId}. Status:`, response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to get details for event ${eventId}. Error:`, error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function getVenue(eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  try {
    const response = await fetch(`${host}/v1/events/${eventId}/venues`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get venue details. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log('Failed to get venue details. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function getSpeaker(seriesId, speakerId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  try {
    const response = await fetch(`${host}/v1/series/${seriesId}/speakers/${speakerId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to get speaker details. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return convertToSpeaker(data);
  } catch (error) {
    window.lana?.log('Failed to get speaker details. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function getClouds() {
  // TODO: use ESP to fetch clouds rather than Chimera
  const tags = await getCaasTags();

  if (tags) {
    const clouds = tags.namespaces.caas.tags['business-unit'].tags;
    return clouds;
  }

  return null;
}

export async function getSeries() {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  try {
    const response = await fetch(`${host}/v1/series`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log('Failed to fetch series. Status:', response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data.series;
  } catch (error) {
    window.lana?.log('Failed to fetch series. Error:', error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function createAttendee(eventId, attendeeData) {
  if (!eventId || !attendeeData) return false;

  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(attendeeData);
  const options = await constructRequestOptions('POST', raw);

  try {
    const response = await fetch(`${host}/v1/events/${eventId}/attendees`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to create attendee for event ${eventId}. Status:`, response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to create attendee for event ${eventId}. Error:`, error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function updateAttendee(eventId, attendeeId, attendeeData) {
  if (!eventId || !attendeeData) return false;

  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(attendeeData);
  const options = await constructRequestOptions('PUT', raw);

  try {
    const response = await fetch(`${host}/v1/events/${eventId}/attendees/${attendeeId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to update attendee ${attendeeId} for event ${eventId}. Status:`, response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to update attendee ${attendeeId} for event ${eventId}. Error:`, error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function deleteAttendee(eventId, attendeeId) {
  if (!eventId || !attendeeId) return false;

  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('DELETE');

  try {
    const response = await fetch(`${host}/v1/events/${eventId}/attendees/${attendeeId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to delete attendee ${attendeeId} for event ${eventId}. Status:`, response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to delete attendee ${attendeeId} for event ${eventId}. Error:`, error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function getAttendees(eventId) {
  if (!eventId) return false;

  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  try {
    const response = await fetch(`${host}/v1/events/${eventId}/attendees`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to fetch attendees for event ${eventId}. Status:`, response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to fetch attendees for event ${eventId}. Error:`, error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function getAttendee(eventId, attendeeId) {
  if (!eventId || !attendeeId) return false;

  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  try {
    const response = await fetch(`${host}/v1/events/${eventId}/attendees/${attendeeId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to get details of attendee ${attendeeId} for event ${eventId}. Status:`, response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to get details of attendee ${attendeeId} for event ${eventId}. Error:`, error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function getSpeakers(seriesId) {
  if (!seriesId) return false;

  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  try {
    const response = await fetch(`${host}/v1/series/${seriesId}/speakers`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to get details of speakers for series ${seriesId}. Status:`, response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return { speakers: data.speakers.map(convertToSpeaker) };
  } catch (error) {
    window.lana?.log(`Failed to get details of speakers for series ${seriesId}. Error:`, error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function getEventImages(eventId) {
  if (!eventId) return false;

  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  try {
    const response = await fetch(`${host}/v1/events/${eventId}/images`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to get event images for event ${eventId}. Status:`, response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to get event images for event ${eventId}. Error:`, error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}

export async function deleteSpeakerImage(speakerId, seriesId, imageId) {
  if (!speakerId || !seriesId || !imageId) return false;

  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('DELETE');

  try {
    const response = await fetch(`${host}/v1/series/${seriesId}/speakers/${speakerId}/images/${imageId}`, options);
    const data = await response.json();

    if (!response.ok) {
      window.lana?.log(`Failed to delete speaker images for speaker ${speakerId}. Status:`, response.status, 'Error:', data);
      return { ok: response.ok, status: response.status, error: data };
    }

    return data;
  } catch (error) {
    window.lana?.log(`Failed to delete speaker images for speaker ${speakerId}. Error:`, error);
    return { ok: false, status: 'Network Error', error: error.message };
  }
}
