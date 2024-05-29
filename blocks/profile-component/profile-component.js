import { getLibs } from '../../scripts/utils.js';
import '../../components/image-dropzone/image-dropzone.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function extractFieldLabels(element) {
  const rows = Array.from(element.children);
  const headingDiv = rows.shift();

  const payload = {
    heading: headingDiv.querySelector('h2, h3, h4, h5, h6')?.textContent?.trim(),
    chooseType: rows[0].querySelector('div')?.textContent?.trim(),
    name: rows[1].querySelector('div')?.textContent?.trim(),
    nameSubText: rows[1].querySelector('div > div:nth-of-type(1)')?.textContent?.trim(),
    image: rows[2].querySelector('div'),
    title: rows[3].querySelector('div')?.textContent?.trim(),
    titleSubText: rows[3].querySelector('div > div:nth-of-type(1)')?.textContent?.trim(),
    bio: rows[4].querySelector('div')?.textContent?.trim(),
    bioSubText: rows[4].querySelector('div > div')?.textContent?.trim(),
    socialMedia: rows[5].querySelector('div')?.textContent?.trim(),
    addSocialMedia: rows[6].querySelector('div')?.textContent?.trim(),
    addSocialMediaRepeater: rows[7].querySelector('div')?.textContent?.trim(),
    addProfileRepeater: rows[8].querySelector('div')?.textContent?.trim(),
  };

  payload.image.setAttribute('slot', 'img-label');
  return payload;
}

async function decorateProfile(element) {
  const fieldlabels = extractFieldLabels(element);
  element.innerHTML = '';

  const profileContainer = createTag('profile-container', { class: 'profile-component' });
  profileContainer.fieldlabels = fieldlabels;
  profileContainer.profiles = [{ socialMedia: [{ url: '' }] }];
  element.append(profileContainer);
}

export default async function init(element, proxyProps) {
  await decorateProfile(element);
  element.parentNode.classList.remove('section');
}
