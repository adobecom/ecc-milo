import { LIBS } from '../../scripts/scripts.js';
import '../../components/image-dropzone/image-dropzone.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function extractFieldLabels(element) {
  const rows = Array.from(element.children);
  const headingDiv = rows.shift();

  const payload = {
    heading: headingDiv.querySelector('h2, h3, h4, h5, h6')?.textContent?.trim(),
    tooltipMessage: headingDiv.querySelector('p > em')?.textContent?.trim(),
    chooseType: rows[0].querySelector('div')?.textContent?.trim(),
    firstName: rows[1].querySelector('div')?.textContent?.trim(),
    firstNameSubText: rows[1].querySelector('div > div:nth-of-type(2)')?.textContent?.trim(),
    lastName: rows[2].querySelector('div')?.textContent?.trim(),
    lastNameSubText: rows[2].querySelector('div > div:nth-of-type(2)')?.textContent?.trim(),
    image: rows[3].querySelector('div'),
    title: rows[4].querySelector('div')?.textContent?.trim(),
    titleSubText: rows[4].querySelector('div > div:nth-of-type(2)')?.textContent?.trim(),
    bio: rows[5].querySelector('div')?.textContent?.trim(),
    bioSubText: rows[5].querySelector('div > div:nth-of-type(2)')?.textContent?.trim(),
    socialMedia: rows[6].querySelector('div')?.textContent?.trim(),
    addSocialMedia: rows[7].querySelector('div')?.textContent?.trim(),
    addSocialMediaRepeater: rows[8].querySelector('div')?.textContent?.trim(),
    addProfileRepeater: rows[9].querySelector('div')?.textContent?.trim(),
  };

  payload.image.setAttribute('slot', 'img-label');
  return payload;
}

async function decorateProfile(element) {
  const fieldlabels = extractFieldLabels(element);
  element.innerHTML = '';

  const profileContainer = createTag('profile-container', { class: 'profile-component' });
  profileContainer.fieldlabels = fieldlabels;
  profileContainer.profiles = [{ socialMedia: [{ link: '' }] }];
  element.append(profileContainer);
}

export default async function init(element) {
  await decorateProfile(element);
  element.parentNode.classList.remove('section');
}
