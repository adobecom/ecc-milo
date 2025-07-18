/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { lazyCaptureProfile } from './profile.js';
import { getImsEnvironment } from './environment.js';

function convertEccIcon(n) {
  const createSVGIcon = (iconName) => {
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('width', '20');
    svgElement.setAttribute('height', '20');
    svgElement.setAttribute('class', 'ecc-icon');

    const useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    useElement.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `/ecc/icons/ecc-icons.svg#${iconName}`);

    svgElement.appendChild(useElement);

    return svgElement;
  };

  const text = n.innerHTML;
  const eccIcons = [
    'ecc-content',
    'ecc-star-wire',
    'ecc-webpage',
  ];

  const iconRegex = /@@(.*?)@@/g;
  return text.replace(iconRegex, (match, iconName) => {
    if (eccIcons.includes(iconName)) {
      return createSVGIcon(iconName).outerHTML;
    }

    return '';
  });
}

export function decorateArea(area = document) {
  const eagerLoad = (parent, selector) => {
    const img = parent.querySelector(selector);
    img?.removeAttribute('loading');
  };

  (async function loadLCPImage() {
    const marquee = area.querySelector('.marquee');
    if (!marquee) {
      eagerLoad(area, 'img');
      return;
    }

    // First image of first row
    eagerLoad(marquee, 'div:first-child img');
    // Last image of last column of last row
    eagerLoad(marquee, 'div:last-child > div:last-child img');
  }());

  const allElements = area.querySelectorAll('*');
  allElements.forEach((element) => {
    if (element.childNodes.length) {
      element.childNodes.forEach((n) => {
        if (n.tagName === 'P' || n.tagName === 'A' || n.tagName === 'LI') {
          n.innerHTML = convertEccIcon(n);
        }
      });
    }
  });
}

const locales = {
  '': { ietf: 'en-US', tk: 'jdq5hay.css' },
  br: { ietf: 'pt-BR', tk: 'inq1xob.css' },
  cn: { ietf: 'zh-Hans-CN', tk: 'puu3xkp' },
  de: { ietf: 'de-DE', tk: 'vin7zsi.css' },
  dk: { ietf: 'da-DK', tk: 'aaz7dvd.css' },
  es: { ietf: 'es-ES', tk: 'oln4yqj.css' },
  fi: { ietf: 'fi-FI', tk: 'aaz7dvd.css' },
  fr: { ietf: 'fr-FR', tk: 'vrk5vyv.css' },
  gb: { ietf: 'en-GB', tk: 'pps7abe.css' },
  in: { ietf: 'en-IN', tk: 'pps7abe.css' },
  it: { ietf: 'it-IT', tk: 'bbf5pok.css' },
  jp: { ietf: 'ja-JP', tk: 'dvg6awq' },
  kr: { ietf: 'ko-KR', tk: 'qjs5sfm' },
  nl: { ietf: 'nl-NL', tk: 'cya6bri.css' },
  no: { ietf: 'no-NO', tk: 'aaz7dvd.css' },
  se: { ietf: 'sv-SE', tk: 'fpk1pcd.css' },
  tw: { ietf: 'zh-Hant-TW', tk: 'jay0ecd' },
  uk: { ietf: 'en-GB', tk: 'pps7abe.css' },
  tr: { ietf: 'tr-TR', tk: 'ley8vds.css' },
  eg: { ietf: 'en-EG', tk: 'pps7abe.css' },
};

// Add project-wide style path here.
const STYLES = '';

// Add any config options.
const CONFIG = {
  codeRoot: '/ecc',
  contentRoot: '/ecc',
  imsClientId: 'acom_event_mgmt_console',
  // imsScope: 'AdobeID,openid,gnav',
  // geoRouting: 'off',
  // fallbackRouting: 'off',
  decorateArea,
  locales,
  adobeid: {
    onTokenExpired: () => {
      window.location.reload();
    },
    environment: getImsEnvironment(),
  },
};

const RELEASE_VERSION = 'T3-25.28';

// Decorate the page with site specific needs.
decorateArea();

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

export const LIBS = (() => {
  const { hostname, search } = window.location;
  if (!(hostname.includes('.hlx.') || hostname.includes('.aem.') || hostname.includes('local'))) return '/libs';
  const branch = new URLSearchParams(search).get('milolibs') || 'main';
  if (branch === 'local') return 'http://localhost:6456/libs';
  return branch.includes('--') ? `https://${branch}.aem.live/libs` : `https://${branch}--milo--adobecom.aem.live/libs`;
})();

(function loadStyles() {
  const paths = [`${LIBS}/styles/styles.css`];
  if (STYLES) { paths.push(STYLES); }
  paths.forEach((path) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', path);
    document.head.appendChild(link);
  });
}());

(async function loadPage() {
  const { loadArea, setConfig, loadLana } = await import(`${LIBS}/utils/utils.js`);
  setConfig({ ...CONFIG, miloLibs: LIBS });
  await loadLana({ clientId: 'ecc-milo' });
  await loadArea().then(() => {
    lazyCaptureProfile();
  });
}());

(async function logReleaseVersion() {
  console.log('Release version:', RELEASE_VERSION);
}());
