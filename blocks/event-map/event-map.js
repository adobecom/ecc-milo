/* global mapboxgl */

import { getLibs } from '../../scripts/utils.js';

const { loadScript, loadStyle } = await import(`${getLibs()}/utils/utils.js`);

const MAPBOX_API_TOKEN = 'cGsuZXlKMUlqb2ljV2w1ZFc1a1lXa2lMQ0poSWpvaVkydHJOSEp3ZVdsMk1XczRaVEp2YjNSck5IcDBiVFl5WVNKOS5QZ25PR0NWcVluU3VnUlBYb2ZKYWtR';

function loadMapboxConfigs(el) {
  const configs = {};
  const configsDiv = el.querySelector(':scope > div:last-of-type');

  if (!configsDiv) return null;

  Array.from(configsDiv.children).forEach((col, i) => {
    if (i === 0) configs.mapStyle = col.textContent.trim();
    if (i === 1) configs.coordinates = col.textContent.split(',');
    if (i === 2) configs.zoom = parseInt(col.textContent.trim(), 10);
  });

  configs.mapContainer = configsDiv;
  return configs;
}

function decorateMapContainer(configs) {
  const { mapContainer } = configs;
  mapContainer.innerHTML = '';
  mapContainer.classList.add('mapbox-container');
  mapContainer.id = 'mapbox-container';
}

export default async function init(el) {
  const configs = loadMapboxConfigs(el);
  if (!configs) return;

  decorateMapContainer(configs);
  loadStyle('https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css');
  loadScript('https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.js').then(() => {
    window.mapboxgl.accessToken = window.atob(MAPBOX_API_TOKEN);
    const map = new mapboxgl.Map({
      container: 'mapbox-container',
      style: configs.mapStyle,
      center: configs.coordinates,
      zoom: configs.zoom,
    });

    const marker1 = new mapboxgl.Marker()
      .setLngLat(configs.coordinates)
      .addTo(map);

    console.log(marker1);
  });
}
