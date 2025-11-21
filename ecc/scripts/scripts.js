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

export const LOCALES = {
  '': { ietf: 'en-US', tk: 'jdq5hay.css', longName: 'English, United States' },
  ae_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl', longName: 'Arabic, United Arab Emirates' },
  ae_en: { ietf: 'en', tk: 'hah7vzn.css', longName: 'English, United Arab Emirates' },
  africa: { ietf: 'en', tk: 'hah7vzn.css', longName: 'English, Africa' },
  ar: { ietf: 'es-AR', tk: 'hah7vzn.css', longName: 'Spanish, Argentina' },
  at: { ietf: 'de-AT', tk: 'hah7vzn.css', longName: 'German, Austria' },
  au: { ietf: 'en-AU', tk: 'hah7vzn.css', longName: 'English, Australia' },
  be_en: { ietf: 'en-BE', tk: 'hah7vzn.css', longName: 'English, Belgium' },
  be_fr: { ietf: 'fr-BE', tk: 'hah7vzn.css', longName: 'French, Belgium' },
  be_nl: { ietf: 'nl-BE', tk: 'qxw8hzm.css', longName: 'Dutch, Belgium' },
  bg: { ietf: 'bg-BG', tk: 'qxw8hzm.css', longName: 'Bulgarian, Bulgaria' },
  br: { ietf: 'pt-BR', tk: 'hah7vzn.css', longName: 'Portuguese, Brazil' },
  ca_fr: { ietf: 'fr-CA', tk: 'hah7vzn.css', longName: 'French, Canada' },
  ca: { ietf: 'en-CA', tk: 'hah7vzn.css', longName: 'English, Canada' },
  ch_de: { ietf: 'de-CH', tk: 'hah7vzn.css', longName: 'German, Switzerland' },
  ch_fr: { ietf: 'fr-CH', tk: 'hah7vzn.css', longName: 'French, Switzerland' },
  ch_it: { ietf: 'it-CH', tk: 'hah7vzn.css', longName: 'Italian, Switzerland' },
  cl: { ietf: 'es-CL', tk: 'hah7vzn.css', longName: 'Spanish, Chile' },
  cn: { ietf: 'zh-CN', tk: 'qxw8hzm', longName: 'Chinese (Simplified), China' },
  co: { ietf: 'es-CO', tk: 'hah7vzn.css', longName: 'Spanish, Colombia' },
  cr: { ietf: 'es-419', tk: 'hah7vzn.css', longName: 'Spanish, Costa Rica' },
  cy_en: { ietf: 'en-CY', tk: 'hah7vzn.css', longName: 'English, Cyprus' },
  cz: { ietf: 'cs-CZ', tk: 'qxw8hzm.css', longName: 'Czech, Czech Republic' },
  de: { ietf: 'de-DE', tk: 'hah7vzn.css', longName: 'German, Germany' },
  dk: { ietf: 'da-DK', tk: 'qxw8hzm.css', longName: 'Danish, Denmark' },
  ec: { ietf: 'es-419', tk: 'hah7vzn.css', longName: 'Spanish, Ecuador' },
  ee: { ietf: 'et-EE', tk: 'qxw8hzm.css', longName: 'Estonian, Estonia' },
  eg_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl', longName: 'Arabic, Egypt' },
  eg_en: { ietf: 'en-GB', tk: 'hah7vzn.css', longName: 'English, Egypt' },
  el: { ietf: 'el', tk: 'qxw8hzm.css', longName: 'Greek' },
  es: { ietf: 'es-ES', tk: 'hah7vzn.css', longName: 'Spanish, Spain' },
  fi: { ietf: 'fi-FI', tk: 'qxw8hzm.css', longName: 'Finnish, Finland' },
  fr: { ietf: 'fr-FR', tk: 'hah7vzn.css', longName: 'French, France' },
  gr_el: { ietf: 'el', tk: 'qxw8hzm.css', longName: 'Greek, Greece' },
  gr_en: { ietf: 'en-GR', tk: 'hah7vzn.css', longName: 'English, Greece' },
  gt: { ietf: 'es-419', tk: 'hah7vzn.css', longName: 'Spanish, Guatemala' },
  hk_en: { ietf: 'en-HK', tk: 'hah7vzn.css', longName: 'English, Hong Kong' },
  hk_zh: { ietf: 'zh-HK', tk: 'jay0ecd', longName: 'Chinese (Traditional), Hong Kong' },
  hu: { ietf: 'hu-HU', tk: 'qxw8hzm.css', longName: 'Hungarian, Hungary' },
  id_en: { ietf: 'en', tk: 'hah7vzn.css', longName: 'English, Indonesia' },
  id_id: { ietf: 'id', tk: 'qxw8hzm.css', longName: 'Indonesian, Indonesia' },
  ie: { ietf: 'en-GB', tk: 'hah7vzn.css', longName: 'English, Ireland' },
  il_en: { ietf: 'en-IL', tk: 'hah7vzn.css', longName: 'English, Israel' },
  il_he: { ietf: 'he', tk: 'qxw8hzm.css', dir: 'rtl', longName: 'Hebrew, Israel' },
  in_hi: { ietf: 'hi', tk: 'qxw8hzm.css', longName: 'Hindi, India' },
  in: { ietf: 'en-IN', tk: 'hah7vzn.css', longName: 'English, India' },
  it: { ietf: 'it-IT', tk: 'hah7vzn.css', longName: 'Italian, Italy' },
  jp: { ietf: 'ja-JP', tk: 'dvg6awq', longName: 'Japanese, Japan' },
  kr: { ietf: 'ko-KR', tk: 'qjs5sfm', longName: 'Korean, South Korea' },
  kw_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl', longName: 'Arabic, Kuwait' },
  kw_en: { ietf: 'en-GB', tk: 'hah7vzn.css', longName: 'English, Kuwait' },
  la: { ietf: 'es-LA', tk: 'hah7vzn.css', longName: 'Spanish, Latin America' },
  langstore: { ietf: 'en-US', tk: 'hah7vzn.css', longName: 'English, Language Store' },
  lt: { ietf: 'lt-LT', tk: 'qxw8hzm.css', longName: 'Lithuanian, Lithuania' },
  lu_de: { ietf: 'de-LU', tk: 'hah7vzn.css', longName: 'German, Luxembourg' },
  lu_en: { ietf: 'en-LU', tk: 'hah7vzn.css', longName: 'English, Luxembourg' },
  lu_fr: { ietf: 'fr-LU', tk: 'hah7vzn.css', longName: 'French, Luxembourg' },
  lv: { ietf: 'lv-LV', tk: 'qxw8hzm.css', longName: 'Latvian, Latvia' },
  mena_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl', longName: 'Arabic, Middle East and North Africa' },
  mena_en: { ietf: 'en', tk: 'hah7vzn.css', longName: 'English, Middle East and North Africa' },
  mt: { ietf: 'en-MT', tk: 'hah7vzn.css', longName: 'English, Malta' },
  mx: { ietf: 'es-MX', tk: 'hah7vzn.css', longName: 'Spanish, Mexico' },
  my_en: { ietf: 'en-GB', tk: 'hah7vzn.css', longName: 'English, Malaysia' },
  my_ms: { ietf: 'ms', tk: 'qxw8hzm.css', longName: 'Malay, Malaysia' },
  ng: { ietf: 'en-GB', tk: 'hah7vzn.css', longName: 'English, Nigeria' },
  nl: { ietf: 'nl-NL', tk: 'qxw8hzm.css', longName: 'Dutch, Netherlands' },
  no: { ietf: 'no-NO', tk: 'qxw8hzm.css', longName: 'Norwegian, Norway' },
  nz: { ietf: 'en-GB', tk: 'hah7vzn.css', longName: 'English, New Zealand' },
  pe: { ietf: 'es-PE', tk: 'hah7vzn.css', longName: 'Spanish, Peru' },
  ph_en: { ietf: 'en', tk: 'hah7vzn.css', longName: 'English, Philippines' },
  ph_fil: { ietf: 'fil-PH', tk: 'qxw8hzm.css', longName: 'Filipino, Philippines' },
  pl: { ietf: 'pl-PL', tk: 'qxw8hzm.css', longName: 'Polish, Poland' },
  pr: { ietf: 'es-419', tk: 'hah7vzn.css', longName: 'Spanish, Puerto Rico' },
  pt: { ietf: 'pt-PT', tk: 'hah7vzn.css', longName: 'Portuguese, Portugal' },
  qa_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl', longName: 'Arabic, Qatar' },
  qa_en: { ietf: 'en-GB', tk: 'hah7vzn.css', longName: 'English, Qatar' },
  ro: { ietf: 'ro-RO', tk: 'qxw8hzm.css', longName: 'Romanian, Romania' },
  ru: { ietf: 'ru-RU', tk: 'qxw8hzm.css', longName: 'Russian, Russia' },
  sa_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl', longName: 'Arabic, Saudi Arabia' },
  sa_en: { ietf: 'en', tk: 'hah7vzn.css', longName: 'English, Saudi Arabia' },
  se: { ietf: 'sv-SE', tk: 'qxw8hzm.css', longName: 'Swedish, Sweden' },
  sg: { ietf: 'en-SG', tk: 'hah7vzn.css', longName: 'English, Singapore' },
  si: { ietf: 'sl-SI', tk: 'qxw8hzm.css', longName: 'Slovenian, Slovenia' },
  sk: { ietf: 'sk-SK', tk: 'qxw8hzm.css', longName: 'Slovak, Slovakia' },
  th_en: { ietf: 'en', tk: 'hah7vzn.css', longName: 'English, Thailand' },
  th_th: { ietf: 'th', tk: 'lqo2bst.css', longName: 'Thai, Thailand' },
  tr: { ietf: 'tr-TR', tk: 'qxw8hzm.css', longName: 'Turkish, Turkey' },
  tw: { ietf: 'zh-TW', tk: 'jay0ecd', longName: 'Chinese (Traditional), Taiwan' },
  ua: { ietf: 'uk-UA', tk: 'qxw8hzm.css', longName: 'Ukrainian, Ukraine' },
  uk: { ietf: 'en-GB', tk: 'hah7vzn.css', longName: 'English, United Kingdom' },
  vn_en: { ietf: 'en-GB', tk: 'hah7vzn.css', longName: 'English, Vietnam' },
  vn_vi: { ietf: 'vi', tk: 'qxw8hzm.css', longName: 'Vietnamese, Vietnam' },
  za: { ietf: 'en-GB', tk: 'hah7vzn.css', longName: 'English, South Africa' },
};

// Add project-wide style path here.
const STYLES = '';

// Add any config options.
export const CONFIG = {
  codeRoot: '/ecc',
  contentRoot: '/ecc',
  imsClientId: 'acom_event_mgmt_console',
  // imsScope: 'AdobeID,openid,gnav',
  // geoRouting: 'off',
  // fallbackRouting: 'off',
  decorateArea,
  locales: LOCALES,
  adobeid: {
    onTokenExpired: () => {
      window.location.reload();
    },
    environment: getImsEnvironment(),
  },
};

const RELEASE_VERSION = 'T3-25.49';

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
