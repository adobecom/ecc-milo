function getESLConfig() {
  return {
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
  // await waitForAdobeIMS();

  const headers = new Headers();
  // const authToken = window.adobeIMS.getAccessToken().token;
  const authToken = 'eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEtc3RnMS1rZXktYXQtMS5jZXIiLCJraWQiOiJpbXNfbmExLXN0ZzEta2V5LWF0LTEiLCJpdHQiOiJhdCJ9.eyJpZCI6IjE3MTgzMDY1NDkzMjhfMmFmMWFmOTYtOTgwMS00N2FmLTg5NTItM2E3M2ZjMTkxNTBiX3VlMSIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJhY29tX2V2ZW50X21nbXRfY29uc29sZSIsInVzZXJfaWQiOiJCOTA3MTlBNzY1QjI4ODY4MEE0OTQyMTlAYzYyZjI0Y2M1YjViN2UwZTBhNDk0MDA0IiwiYXMiOiJpbXMtbmExLXN0ZzEiLCJhYV9pZCI6IkI5MDcxOUE3NjVCMjg4NjgwQTQ5NDIxOUBjNjJmMjRjYzViNWI3ZTBlMGE0OTQwMDQiLCJjdHAiOjAsImZnIjoiWVE1NFZRNFc3WjY3QTZEWjNHWk1DMklBMkk9PT09PT0iLCJzaWQiOiIxNzE3Nzk2MDMxMzI0XzgxMDZiMDY4LWFiNTYtNDdmZi04MTYwLWNjYjU2MzUyMWQ0MF91ZTEiLCJtb2kiOiI3ZDhhN2NlNCIsInBiYSI6Ik1lZFNlY05vRVYsTG93U2VjIiwiZXhwaXJlc19pbiI6Ijg2NDAwMDAwIiwiY3JlYXRlZF9hdCI6IjE3MTgzMDY1NDkzMjgiLCJzY29wZSI6IkFkb2JlSUQsb3BlbmlkLGduYXYifQ.AJxHiqtg38cYeRTq9QNGXJuhnQQ7jrY_zfDeVz16WYB0KpUfIfVJwCaermgjSW18hVa3icJlnN0JHg0JNQR43Vgentt0WBU6c5p6nD-Ljhbmh4yTyGyf28Ah4njW0eMYge1ejHs0xgfszHlM4Fkpn9717BmuVFLD73wULzFx00DM9TV4HYu4ANtzFNnXGWgiMBchCy2LPzN4SqGDetL8v1yOaoC336K6hHKzy9xTfv97iLETHOfT1T2JEEKBEQsMFSllUYSR955yrW-CflEzNy_DV5eL6RA3DiQTvV-HxpHu78cN3PJW25YvzVpNUV3XV9a88tOaREfxiqASMktI-A';
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
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const authToken = window.adobeIMS.getAccessToken().token;
  const headers = new Headers();
  headers.append('x-image-kind', configs.type);
  headers.append('Authorization', `Bearer ${authToken}`);

  try {
    const response = await fetch(`${host}${configs.targetUrl}`, {
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
  console.log('attempted to create speaker with:', raw);
  const resp = await fetch(`${host}/v1/speakers`, options).then((res) => res.json()).catch((error) => console.log(error));
  console.log('create speaker response:', resp);
  return resp;
}

export async function createPartner(partner, eventId) {
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const raw = JSON.stringify(partner);
  const options = await constructRequestOptions('POST', raw);
  console.log('attempted to create partner with:', raw);
  const resp = await fetch(`${host}/v1/partners/${eventId}/partners`, options).then((res) => res.json()).catch((error) => console.log(error));
  console.log('create speaker partner:', resp);
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

export async function getVenue(venueId) {
  const { host } = getESLConfig()[window.miloConfig.env.name];
  const options = await constructRequestOptions('GET');

  const resp = await fetch(`${host}/v1/venues/${venueId}`, options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function getClouds() {
  // TODO: use ESP to fetch clouds rather than Chimera
  const resp = await fetch('https://www.adobe.com/chimera-api/tags').then((res) => res.json()).catch((error) => error);

  if (!resp.error) {
    const clouds = resp.namespaces.caas.tags['business-unit'].tags;
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
