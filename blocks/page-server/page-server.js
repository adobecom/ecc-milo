import HtmlSanitizer from '../../deps/html-sanitizer.js';
import { getMetadata, yieldToMain } from '../../utils/utils.js';

const ignoredMeta = [
  'serp-content-type',
  'description',
  'primaryproductname',
  'theme',
  'viewport',
];

async function sanitizeMeta(meta) {
  if (meta.property || meta.name.includes(':') || ignoredMeta.includes(meta.name)) return;
  await yieldToMain();
  meta.content = HtmlSanitizer.SanitizeHtml(meta.content);
}

// metadata -> dom blades
async function autoUpdatePage(main) {
  if (!main) {
    window.lana?.log('page server block cannot find it\'s parent main');
    return;
  }

  const metaTags = document.head.querySelectorAll('meta');

  await Promise.all(Array.from(metaTags).map((meta) => sanitizeMeta(meta)));
  const allElements = main.querySelectorAll('*');
  const bracketRegex = /\[\[(.*?)\]\]/g;
  allElements.forEach((element) => {
    if (element.childNodes.length) {
      element.childNodes.forEach((child) => {
        if (child.nodeType === 3) {
          const originalText = child.nodeValue;
          const replacedText = originalText.replace(bracketRegex, (_match, p1) => getMetadata(p1));
          if (replacedText !== originalText) {
            child.nodeValue = replacedText;
          }
        }
      });
    }
  });

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
