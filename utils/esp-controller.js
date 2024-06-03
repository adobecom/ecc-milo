function constructRequestOptions(method, body = null) {
  const headers = new Headers();
  headers.append('Authorization', 'Bearer');
  headers.append('content-type', 'application/json');

  const options = {
    method,
    headers,
  };

  if (body) options.body = body;

  return options;
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  await fetch('http://localhost:8000/upload', {
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
  const headers = new Headers();
  headers.append('x-image-kind', configs.type);
  headers.append('x-image-alt-text', configs.altText);
  headers.append('Authorization', 'Bearer');

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

export async function createVenue(payload) {
  const raw = JSON.stringify(payload);
  const options = constructRequestOptions('POST', raw);

  const resp = await fetch('http://localhost:8500/v1/venues', options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function createEvent(payload) {
  const raw = JSON.stringify(payload);
  const options = constructRequestOptions('POST', raw);

  const resp = await fetch('http://localhost:8500/v1/events', options).then((res) => res.json()).catch((error) => console.log(error));
  console.log('attempted to create event', payload, resp);
  return resp;
}

export async function createSpeaker(profile, seriesId) {
  const raw = JSON.stringify({ ...profile, seriesId });
  console.log(raw);
  const options = constructRequestOptions('POST', raw);

  const resp = await fetch('http://localhost:8500/v1/speakers', options).then((res) => res.json()).catch((error) => console.log(error));
  console.log('attempted to create speaker', raw, resp);
  return resp;
}

export async function updateEvent(eventId, payload) {
  const raw = JSON.stringify(payload);
  const options = constructRequestOptions('PUT', raw);

  const resp = fetch(`http://localhost:8500/v1/events/${eventId}`, options).then((res) => res.json()).catch((error) => console.log(error));
  console.log(payload, resp);
  return resp;
}

export async function publishEvent(eventId, payload) {
  const raw = JSON.stringify({ ...payload, published: true });
  const options = constructRequestOptions('PUT', raw);

  const resp = fetch(`http://localhost:8500/v1/events/${eventId}`, options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function getEvents() {
  const options = constructRequestOptions('GET');

  const resp = fetch('http://localhost:8500/v1/events', options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function getEvent(eventId) {
  const options = constructRequestOptions('GET');

  const resp = fetch(`http://localhost:8500/v1/events/${eventId}`, options).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function getVenue(venueId) {
  const options = constructRequestOptions('GET');

  const resp = fetch(`http://localhost:8500/v1/venues/${venueId}`, options).then((res) => res.json()).catch((error) => console.log(error));
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
  const resp = await fetch(
    'http://localhost:8500/v1/series',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer',
      },
    },
  ).then((res) => res.json()).catch((error) => error);

  if (!resp.error) {
    const { series } = resp;
    return series;
  }

  return null;
}
