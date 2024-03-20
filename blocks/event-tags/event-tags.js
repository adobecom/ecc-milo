import { getLibs } from '../../scripts/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function handleToTitle(str) {
  const splitStr = str.toLowerCase().trim().split('-');
  for (let i = 0; i < splitStr.length; i += 1) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(' ');
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

  tags.forEach((tag) => {
    const tagEl = createTag('div', { class: 'tag' });
    // TODO: use localized text
    const text = handleToTitle(tag);
    const icon = getTagIcon(tag.trim());

    tagEl.append(icon, text);

    el.append(tagEl);
  });
}
