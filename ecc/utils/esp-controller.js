import { MILO_CONFIG } from '../scripts/scripts.js';

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
      dev: { host: 'https://wcms-events-service-layer-deploy-ethos102-dev-va-9c3ecd.dev.cloud.adobe.io' },
      stage: { host: 'https://wcms-events-service-layer-deploy-ethos102-stage-va-9c3ecd.stage.cloud.adobe.io' },
      prod: { host: 'https://wcms-events-service-layer-deploy-ethos102-stage-va-9c3ecd.stage.cloud.adobe.io' },
    },
    esp: {
      local: { host: 'http://localhost:8500' },
      dev: { host: 'https://wcms-events-service-platform-deploy-ethos102-dev-caff5f.dev.cloud.adobe.io' },
      stage: { host: 'https://wcms-events-service-platform-deploy-ethos102-stage-caff5f.stage.cloud.adobe.io' },
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

export async function uploadBinaryFile(file, configs) {
  await waitForAdobeIMS();

  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const authToken = window.adobeIMS?.getAccessToken()?.token;
  const headers = new Headers();
  headers.append('x-image-alt-text', configs.altText || '');
  headers.append('x-image-kind', configs.type);
  headers.append('Authorization', `Bearer ${authToken}`);

  let respJson = null;

  try {
    const response = await fetch(`${host}${configs.targetUrl}`, {
      method: 'POST',
      headers,
      body: file,
    });

    if (response.ok) {
      respJson = await response.json();
    } else {
      window.lana?.log('Unexpected image upload server response. Reponse:', response.status);
    }
  } catch (error) {
    window.lana?.log('Failed to upload image. Error:', error);
  }

  return respJson;
}

export async function createVenue(eventId, venueData) {
  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const raw = JSON.stringify(venueData);
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/venues`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to create venue. Error:', error));

  return resp;
}

export async function createEvent(payload) {
  const { host } = getAPIConfig().esl[MILO_CONFIG.env.name];
  const raw = JSON.stringify(payload);
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/events`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to create event. Error:', error));

  return resp;
}

export async function createSpeaker(profile, seriesId) {
  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const raw = JSON.stringify({ ...profile, seriesId });
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/series/${seriesId}/speakers`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to create speaker. Error:', error));

  return resp;
}

export async function createPartner(partner, eventId) {
  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const raw = JSON.stringify(partner);
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/partners`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log('Failed to create partner. Error:', error));

  return resp;
}

export async function addSpeakerToEvent(speakerData, eventId) {
  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const raw = JSON.stringify(speakerData);
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/speakers`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to add speaker to event. Error: ${error}`));

  return resp;
}

export async function updateSpeaker(profile, seriesId) {
  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const nProfile = { ...profile, photo: undefined };
  const raw = JSON.stringify({ ...nProfile, seriesId });
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/series/${seriesId}/speakers/${profile.speakerId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to update speaker. Error: ${error}`));

  return resp;
}

export async function updateEvent(eventId, payload) {
  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const raw = JSON.stringify(payload);
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to update event ${eventId}. Error: ${error}`));

  return resp;
}

export async function publishEvent(eventId, payload) {
  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const raw = JSON.stringify({ ...payload, published: true });
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to publish event ${eventId}. Error: ${error}`));
  return resp;
}

export async function unpublishEvent(eventId, payload) {
  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const raw = JSON.stringify({ ...payload, published: false });
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to unpublish event ${eventId}. Error: ${error}`));
  return resp;
}

export async function deleteEvent(eventId) {
  const { host } = getAPIConfig().esl[MILO_CONFIG.env.name];
  const options = await constructRequestOptions('DELETE');

  const resp = await fetch(`${host}/v1/events/${eventId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to delete event ${eventId}. Error: ${error}`));
  return resp;
}

export async function getEvents() {
  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to get list of events. Error: ${error}`));
  return resp;
}

export async function getEvent(eventId) {
  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events/${eventId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to get details for event ${eventId}. Error: ${error}`));
  return resp;
}

export async function getVenue(eventId) {
  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events/${eventId}/venues`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to get venue details. Error: ${error}`));

  return resp;
}

export async function getSpeaker(seriesId, speakerId) {
  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/series/${seriesId}/speakers/${speakerId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to get venue details. Error: ${error}`));

  return resp;
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
  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
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

  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const raw = JSON.stringify(attendeeData);
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/attendees`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to create attendee for event ${eventId}. Error: ${error}`));
  return resp;
}

export async function updateAttendee(eventId, attendeeId, attendeeData) {
  if (!eventId || !attendeeData) return false;

  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const raw = JSON.stringify(attendeeData);
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/attendees/${attendeeId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to update attendee ${attendeeId} for event ${eventId}. Error: ${error}`));
  return resp;
}

export async function deleteAttendee(eventId, attendeeId) {
  if (!eventId || !attendeeId) return false;

  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const options = await constructRequestOptions('DELETE');

  const resp = await fetch(`${host}/v1/events/${eventId}/attendees/${attendeeId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to delete attendee ${attendeeId} for event ${eventId}. Error: ${error}`));
  return resp;
}

export async function getAttendees(eventId) {
  if (!eventId) return false;

  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events/${eventId}/attendees`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to fetch attendees for event ${eventId}. Error: ${error}`));
  return resp;
}

export async function getAttendee(eventId, attendeeId) {
  if (!eventId || !attendeeId) return false;

  const { host } = getAPIConfig().esp[MILO_CONFIG.env.name];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events/${eventId}/attendees/${attendeeId}`, options)
    .then((res) => res.json())
    .catch((error) => window.lana?.log(`Failed to get details of attendee ${attendeeId} for event ${eventId}. Error: ${error}`));
  return resp;
}
