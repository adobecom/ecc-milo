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
          window.lana?.log(`Failed to load products map JSON: ${err}`);
          throw err;
        });
    }

    return promise;
  };
})();

function getESLConfig() {
  return {
    // FIXME: stage and local are swapped for demo
    local: { host: 'http://localhost:8499' },
    stage: { host: 'https://wcms-events-service-layer-deploy-ethos102-stage-va-9c3ecd.stage.cloud.adobe.io' },
    prod: { host: 'https://wcms-events-service-layer-deploy-ethos102-stage-va-9c3ecd.stage.cloud.adobe.io' },
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

export async function uploadImage(file) {
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const formData = new FormData();
  formData.append('file', file);

  await fetch(`${host}/upload`, {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

export async function uploadBinaryFile(file, configs) {
  await waitForAdobeIMS();
  const authToken = window.adobeIMS.getAccessToken().token;
  const headers = new Headers();
  headers.append('x-image-kind', configs.type);
  headers.append('Authorization', `Bearer ${authToken}`);

  try {
    const response = await fetch(configs.targetUrl, {
      method: 'POST',
      headers,
      body: file,
    });

    if (response.ok) {
      const responseData = await response.text();
      console.log('Success:', responseData);
    } else {
      console.error('Error Status:', response.status);
    }
  } catch (error) {
    console.error('Network error', error);
  }
}

export async function createVenue(eventId, venueData) {
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const raw = JSON.stringify(venueData);
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/venues`, options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function createEvent(payload) {
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const raw = JSON.stringify(payload);
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/events`, options).then((res) => res.json()).catch((error) => console.log(error));
  console.log('attempted to create event', payload, resp);
  return resp;
}

export async function createSpeaker(profile, seriesId) {
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const raw = JSON.stringify({ ...profile, seriesId });
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/series/${seriesId}/speakers`, options).then((res) => res.json()).catch((error) => console.log(error));
  console.log('attempted to create speaker', raw, resp);
  return resp;
}

export async function updateSpeaker(profile, seriesId, speakerId) {
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const raw = JSON.stringify({ ...profile, seriesId });
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/series/${seriesId}/speakers/${speakerId}`, options).then((res) => res.json()).catch((error) => console.log(error));
  console.log('attempted to update speaker', raw, resp);
  return resp;
}

export async function updateEvent(eventId, payload) {
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const raw = JSON.stringify(payload);
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}`, options).then((res) => res.json()).catch((error) => console.log(error));
  console.log(payload, resp);
  return resp;
}

export async function publishEvent(eventId, payload) {
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const raw = JSON.stringify({ ...payload, published: true });
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}`, options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function unpublishEvent(eventId, payload) {
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const raw = JSON.stringify({ ...payload, published: false });
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}`, options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function deleteEvent(eventId) {
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const options = await constructRequestOptions('DELETE');

  const resp = await fetch(`${host}/v1/events/${eventId}`, options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function getEvents() {
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events`, options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function getEvent(eventId) {
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events/${eventId}`, options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function getVenue(eventId) {
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events/${eventId}/venues`, options).then((res) => res.json()).catch((error) => console.log(error));
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
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const options = await constructRequestOptions('GET');
  const resp = await fetch(`${host}/v1/series`, options).then((res) => res.json()).catch((error) => error);

  if (!resp.error) {
    const { series } = resp;
    return series;
  }

  return null;
}

export async function createAttendee(eventId, attendeeData) {
  if (!eventId || !attendeeData) return false;

  const { host } = getESLConfig()[window.miloConfig.env.name];
  const raw = JSON.stringify(attendeeData);
  const options = await constructRequestOptions('POST', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/attendees`, options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function updateAttendee(eventId, attendeeId, attendeeData) {
  if (!eventId || !attendeeData) return false;

  const { host } = getESLConfig()[window.miloConfig.env.name];
  const raw = JSON.stringify(attendeeData);
  const options = await constructRequestOptions('PUT', raw);

  const resp = await fetch(`${host}/v1/events/${eventId}/attendees/${attendeeId}`, options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function deleteAttendee(eventId, attendeeId) {
  if (!eventId || !attendeeId) return false;

  const { host } = getESLConfig()[window.miloConfig.env.name];
  const options = await constructRequestOptions('DELETE');

  const resp = await fetch(`${host}/v1/events/${eventId}/attendees/${attendeeId}`, options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function getAttendees(eventId) {
  if (!eventId) return false;

  const { host } = getESLConfig()[window.miloConfig.env.name];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events/${eventId}/attendees`, options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function getAttendee(eventId, attendeeId) {
  if (!eventId || !attendeeId) return false;

  const { host } = getESLConfig()[window.miloConfig.env.name];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/events/${eventId}/attendees/${attendeeId}`, options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}
