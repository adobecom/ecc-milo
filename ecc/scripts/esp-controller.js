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
      prod: { host: 'https://wcms-events-service-layer-deploy-ethos102-stage-va-9c3ecd.stage.cloud.adobe.io' },
    },
    esp: {
      local: { host: 'http://localhost:8500' },
      dev: { host: 'https://wcms-events-service-platform-deploy-ethos102-stage-caff5f.stage.cloud.adobe.io' },
      stage: { host: 'https://events-service-platform-stage.adobe.io' },
      prod: { host: 'https://wcms-events-service-platform-deploy-ethos102-stage-caff5f.stage.cloud.adobe.io' },
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

export async function uploadImage(file, configs, progressBar, imageId = null) {
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
    // xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        if (progressBar) {
          progressBar.progress = percentComplete;
        }
      }
    };

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

export async function createVenue(eventId, venueData) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(venueData);
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/venues`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to create venue. Error:', error));

  return resp;
}

export async function replaceVenue(eventId, venueId, venueData) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(venueData);
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/venues/${venueId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to replace venue. Error:', error));

  return resp;
}

export async function createEvent(payload) {
  const { host } = getAPIConfig().esl[ECC_ENV];
  const raw = JSON.stringify(payload);
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/events`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to create event. Error:', error));

  return resp;
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

export async function createSpeaker(profile, seriesId) {
  const nSpeaker = convertToNSpeaker(profile);

  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify({ ...nSpeaker, seriesId });
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/series/${seriesId}/speakers`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to create speaker. Error:', error));

  return resp;
}

export async function createSponsor(data, seriesId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(data);
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/series/${seriesId}/sponsors`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to create sponsor. Error:', error));

  return resp;
}

export async function updateSponsor(data, sponsorId, seriesId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(data);
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/series/${seriesId}/sponsors/${sponsorId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to update sponsor. Error:', error));

  return resp;
}

export async function addSponsorToEvent(data, eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(data);
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/sponsors`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to add sponsor to event. Error:', error));

  return resp;
}

export async function updateSponsorInEvent(data, sponsorId, eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(data);
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/sponsors/${sponsorId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to update sponsor in event. Error:', error));

  return resp;
}

export async function removeSponsorFromEvent(sponsorId, eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('DELETE');

  const resp = await fetch(`${host}/v1/events/${eventId}/sponsors/${sponsorId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to delete sponsor from event. Error:', error));

  return resp;
}

export async function getSponsor(seriesId, sponsorId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/series/${seriesId}/sponsors/${sponsorId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to get sponsor. Error:', error));

  return resp;
}

export async function getSponsorImages(seriesId, sponsorId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/series/${seriesId}/sponsors/${sponsorId}/images`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to get sponsor images. Error:', error));

  return resp;
}

export async function addSpeakerToEvent(speakerData, eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(speakerData);
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/speakers`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to add speaker to event. Error: ${error}`));

  return resp;
}

export async function updateSpeakerInEvent(data, speakerId, eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(data);
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/speakers/${speakerId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to update speaker in event. Error:', error));

  return resp;
}

export async function removeSpeakerFromEvent(speakerId, eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('DELETE');

  const resp = await fetch(`${host}/v1/events/${eventId}/speakers/${speakerId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to delete speaker from event. Error:', error));

  return resp;
}

export async function updateSpeaker(profile, seriesId) {
  const nSpeaker = convertToNSpeaker(profile);
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify({ ...nSpeaker, seriesId });
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/series/${seriesId}/speakers/${profile.speakerId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to update speaker. Error: ${error}`));

  return resp;
}

export async function updateEvent(eventId, payload) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(payload);
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to update event ${eventId}. Error: ${error}`));

  return resp;
}

export async function publishEvent(eventId, payload) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify({ ...payload, published: true });
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to publish event ${eventId}. Error: ${error}`));
  return resp;
}

export async function unpublishEvent(eventId, payload) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify({ ...payload, published: false });
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to unpublish event ${eventId}. Error: ${error}`));
  return resp;
}

export async function deleteEvent(eventId) {
  const { host } = getAPIConfig().esl[ECC_ENV];
  const options = await constructRequestOptions('DELETE');

  const resp = await fetch(`${host}/v1/events/${eventId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to delete event ${eventId}. Error: ${error}`));
  return resp;
}

export async function getEvents() {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to get list of events. Error: ${error}`));
  return resp;
}

export async function getEvent(eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events/${eventId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to get details for event ${eventId}. Error: ${error}`));
  return resp;
}

export async function getVenue(eventId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events/${eventId}/venues`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to get venue details. Error: ${error}`));

  return resp;
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

export async function getSpeaker(seriesId, speakerId) {
  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/series/${seriesId}/speakers/${speakerId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to get venue details. Error: ${error}`));

  return convertToSpeaker(resp);
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
  const resp = await fetch(`${host}/v1/series`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to fetch series. Error: ${error}`));

  if (!resp || resp.error) {
    return null;
  }

  const { series } = resp;
  return series;
}

export async function createAttendee(eventId, attendeeData) {
  if (!eventId || !attendeeData) return false;

  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(attendeeData);
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/attendees`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to create attendee for event ${eventId}. Error: ${error}`));
  return resp;
}

export async function updateAttendee(eventId, attendeeId, attendeeData) {
  if (!eventId || !attendeeData) return false;

  const { host } = getAPIConfig().esp[ECC_ENV];
  const raw = JSON.stringify(attendeeData);
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/attendees/${attendeeId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to update attendee ${attendeeId} for event ${eventId}. Error: ${error}`));
  return resp;
}

export async function deleteAttendee(eventId, attendeeId) {
  if (!eventId || !attendeeId) return false;

  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('DELETE');

  const resp = await fetch(`${host}/v1/events/${eventId}/attendees/${attendeeId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to delete attendee ${attendeeId} for event ${eventId}. Error: ${error}`));
  return resp;
}

export async function getAttendees(eventId) {
  if (!eventId) return false;

  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events/${eventId}/attendees`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to fetch attendees for event ${eventId}. Error: ${error}`));
  return resp;
}

export async function getAttendee(eventId, attendeeId) {
  if (!eventId || !attendeeId) return false;

  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events/${eventId}/attendees/${attendeeId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to get details of attendee ${attendeeId} for event ${eventId}. Error: ${error}`));
  return resp;
}

export async function getSpeakers(seriesId) {
  if (!seriesId) return false;

  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/series/${seriesId}/speakers`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to get details of speakers for series ${seriesId}. Error: ${error}`));

  return { speakers: resp.speakers.map(convertToSpeaker) };
}

export async function getEventImages(eventId) {
  if (!eventId) return false;

  const { host } = getAPIConfig().esp[ECC_ENV];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events/${eventId}/images`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to get event images for event ${eventId}. Error: ${error}`));
  return resp;
}
