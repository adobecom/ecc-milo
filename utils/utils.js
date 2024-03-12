
export function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const $meta = document.head.querySelector(`meta[${attr}="${name}"]`);
  return ($meta && $meta.content) || '';
}

export function yieldToMain() {
  return new Promise((r) => {
    setTimeout(r, 0);
  });
}
