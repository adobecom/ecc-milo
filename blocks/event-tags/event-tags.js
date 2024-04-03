import { getLibs } from '../../scripts/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function handlize(str) {
  return str.toLowerCase().trim().replace(' ', '-');
}

function getTagIcon(tag) {
  const availableIcons = [
    'illustrator',
    'graphic-design',
    'photography',
    'social',
    '3d-ar',
  ];

  const img = createTag('img', { class: 'icon icon-label', src: '/blocks/event-tags/icons/label.svg', alt: tag });

  if (availableIcons.includes(tag)) {
    img.className = `icon icon-${tag}`;
    img.src = `/blocks/event-tags/icons/${tag}.svg`;
    img.alt = tag;
  }

  return img;
}

export default function init(el) {
  const tags = el.textContent.split(',');
  el.innerHTML = '';
  const tagsWrapper = createTag('div', { class: 'tags-wrapper' });

  tags.forEach((tag) => {
    const tagEl = createTag('div', { class: 'tag' });
    // TODO: use localized text
    const text = tag;
    const icon = getTagIcon(handlize(tag));

    tagEl.append(icon, text);

    tagsWrapper.append(tagEl);
  });

  el.append(tagsWrapper);
}
