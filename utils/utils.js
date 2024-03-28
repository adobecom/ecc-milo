export const REG = /\[\[(.*?)\]\]/g;

export function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const meta = document.head.querySelector(`meta[${attr}="${name}"]`);
  return (meta && meta.content) || '';
}

export function yieldToMain() {
  return new Promise((r) => {
    setTimeout(r, 0);
  });
}

export function decorateTemplate() {
  const pageServer = document.body.querySelector('div.page-server');

  if (pageServer) {
    document.body.classList.add('loading', 'has-page-server');
  }

  if (getMetadata('event-template')) {
    document.body.querySelectorAll('a[href*="#event-template"]').forEach((a) => {
      try {
        a.href = getMetadata('event-template');
      } catch (e) {
        window.lana?.log(`Error while attempting to replace link ${a.href}: ${e}`);
      }
    });
  }
}
