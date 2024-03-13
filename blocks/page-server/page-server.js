import HtmlSanitizer from '../../deps/html-sanitizer.js';
import { getMetadata, yieldToMain } from '../../utils/utils.js';

const ignoredMeta = [
  'serp-content-type',
  'description',
  'primaryproductname',
  'theme',
  'show-free-plan',
  'sheet-powered',
  'viewport',
];

async function sanitizeMeta(meta) {
  if (meta.property || meta.name.includes(':') || ignoredMeta.includes(meta.name)) return;
  await yieldToMain();
  meta.content = HtmlSanitizer.SanitizeHtml(meta.content);
}

export function titleCase(str) {
  const splitStr = str.toLowerCase().split('-');
  for (let i = 0; i < splitStr.length; i += 1) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(' ');
}

// metadata -> dom blades
async function autoUpdatePage(main) {
  if (!main) {
    window.lana?.log('page server block cannot find it\'s parent main');
    return;
  }

  const regex = /\[\[([a-zA-Z0-9_-]+)]]/g;

  const metaTags = document.head.querySelectorAll('meta');

  await Promise.all(Array.from(metaTags).map((meta) => sanitizeMeta(meta)));

  main.innerHTML = main.innerHTML.replaceAll(regex, (_match, p1) => getMetadata(p1));

  // handle link replacement
  main.querySelectorAll('a[href*="#"]').forEach((a) => {
    try {
      let url = new URL(a.href);
      if (getMetadata(url.hash.replace('#', ''))) {
        a.href = getMetadata(url.hash.replace('#', ''));
        url = new URL(a.href);
      }
    } catch (e) {
      window.lana?.log(`Error while attempting to replace link ${a.href}: ${e}`);
    }
  });
}

export default function init(el) {
  autoUpdatePage(el.closest('main'));
}
