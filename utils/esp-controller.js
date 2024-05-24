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

export function uploadBinaryFile(file) {
  // TODO: replace with real endpoint
  const url = 'http://localhost:8000/upload';

  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);

  // TODO: set required headers

  // xhr.setRequestHeader('imageType', 'event-hero-image');
  // xhr.setRequestHeader('imageType', 'event-card-image');
  // xhr.setRequestHeader('imageType', 'venue-image');
  // xhr.setRequestHeader('imageType', 'speaker-photo');

  xhr.onload = function () {
    if (xhr.status === 200) {
      console.log('Success:', xhr.responseText);
    } else {
      console.error('Error Status:', xhr.status);
    }
  };

  xhr.onerror = function () {
    console.error('Network error');
  };

  xhr.send(file);
}

export async function createVenue(payload) {
  const myHeaders = new Headers();
  myHeaders.append('Authorization', 'Bearer');
  myHeaders.append('content-type', 'application/json');

  const raw = JSON.stringify(payload);

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
  };

  const resp = await fetch('http://localhost:8500/v1/venues', requestOptions).then((res) => res.json()).catch((error) => console.log(error));
  console.log(payload, resp);
  return resp;
}

export async function createEvent(payload) {
  const myHeaders = new Headers();
  myHeaders.append('Authorization', 'Bearer');
  myHeaders.append('content-type', 'application/json');

  const raw = JSON.stringify(payload);

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
  };

  const resp = await fetch('http://localhost:8500/v1/events', requestOptions).then((res) => res.json()).catch((error) => console.log(error));
  console.log(payload, resp);
  return resp;
}

export async function updateEvent(eventId, payload) {
  const myHeaders = new Headers();
  myHeaders.append('Authorization', 'Bearer');
  myHeaders.append('content-type', 'application/json');

  const raw = JSON.stringify(payload);

  const requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    body: raw,
  };

  const resp = fetch(`http://localhost:8500/v1/events/${eventId}`, requestOptions).then((res) => res.json()).catch((error) => console.log(error));
  console.log(payload, resp);
  return resp;
}

export async function publishEvent(eventId, payload) {
  const myHeaders = new Headers();
  myHeaders.append('Authorization', 'Bearer');
  myHeaders.append('content-type', 'application/json');

  const raw = JSON.stringify({ ...payload, published: true });

  const requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    body: raw,
  };

  const resp = fetch(`http://localhost:8500/v1/events/${eventId}`, requestOptions).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function getEvents() {
  const myHeaders = new Headers();
  myHeaders.append('Authorization', 'Bearer');
  myHeaders.append('content-type', 'application/json');

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };

  const resp = fetch('http://localhost:8500/v1/events', requestOptions).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function getVenue(venueId) {
  const myHeaders = new Headers();
  myHeaders.append('Authorization', 'Bearer');
  myHeaders.append('content-type', 'application/json');

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };

  const resp = fetch(`http://localhost:8500/v1/venues/${venueId}`, requestOptions).then((res) => res.json()).catch((error) => console.log(error));
  return resp;
}

export async function getClouds() {
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
