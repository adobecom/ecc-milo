import HtmlSanitizer from '../../deps/html-sanitizer.js';
import { getMetadata, yieldToMain } from '../../utils/utils.js';

const ignoredMeta = [
  'serp-content-type',
  'description',
  'primaryproductname',
  'theme',
  'viewport',
];

const preserveFormatKeys = [
  'event-description',
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

  const getContent = (_match, p1, n) => {
    const content = getMetadata(p1) || '';
    if (preserveFormatKeys.includes(p1)) {
      n.parentNode?.classList.add('preserve-format');
    }
    return content;
  };

  const metaTags = document.head.querySelectorAll('meta');

  await Promise.all(Array.from(metaTags).map((meta) => sanitizeMeta(meta)));
  const allElements = main.querySelectorAll('*');
  const reg = /\[\[(.*?)\]\]/g;

  allElements.forEach((element) => {
    if (element.childNodes.length) {
      element.childNodes.forEach((n) => {
        if (n.tagName === 'IMG' && n.nodeType === 1) {
          const parentPic = n.closest('picture');
          const originalAlt = n.alt;
          const replacedSrc = originalAlt.replace(reg, (_match, p1) => getContent(_match, p1, n));

          if (replacedSrc && parentPic && replacedSrc !== originalAlt) {
            parentPic.querySelectorAll('source').forEach((el) => {
              try {
                el.srcset = el.srcset.replace(/.*\?/, `${replacedSrc}?`);
              } catch (e) {
                window.lana?.log(`failed to convert optimized picture source from ${el} with dynamic data: ${e}`);
              }
            });

            parentPic.querySelectorAll('img').forEach((el) => {
              try {
                el.src = el.src.replace(/.*\?/, `${replacedSrc}?`);
              } catch (e) {
                window.lana?.log(`failed to convert optimized img from ${el} with dynamic data: ${e}`);
              }
            });
          }
        }

        if (n.nodeType === 3) {
          const originalText = n.nodeValue;
          const replacedText = originalText.replace(reg, (_match, p1) => getContent(_match, p1, n));
          if (replacedText !== originalText) n.nodeValue = replacedText;
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
