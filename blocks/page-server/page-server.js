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

// metadata -> dom blades
async function autoUpdatePage(main) {
  if (!main) {
    window.lana?.log('page server block cannot find it\'s parent main');
    return;
  }

  const metaTags = document.head.querySelectorAll('meta');

  await Promise.all(Array.from(metaTags).map((meta) => sanitizeMeta(meta)));

  // main.innerHTML = main.innerHTML.replaceAll(regex, (_match, p1) => {
  //   console.log(getMetadata(p1), p1);
  //   return getMetadata(p1);
  // });

  // Select all elements in the document
  const allElements = main.querySelectorAll('*');

  // Define a regular expression to find [[ ]] content
  const bracketRegex = /\[\[(.*?)\]\]/g;

  // Iterate over all elements
  allElements.forEach((element) => {
    // Check if the element has text nodes
    if (element.childNodes.length) {
      element.childNodes.forEach((child) => {
        // Make sure we're dealing with a text node
        if (child.nodeType === 3) {
          const originalText = child.nodeValue;
          // Replace the content inside [[ ]] with the replacementText
          const replacedText = originalText.replace(bracketRegex, (_match, p1) => {
            console.log(getMetadata(p1), p1);
            return getMetadata(p1);
          });
          if (replacedText !== originalText) {
            // Update the text node only if changes were made
            child.nodeValue = replacedText;
          }
        }
      });
    }
  });

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
