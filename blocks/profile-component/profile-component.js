import { getLibs } from '../../scripts/utils.js';
import '../../components/image-dropzone/image-dropzone.js';
import { addRepeater, decorateTextfield, decorateTextarea, getIcon } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function decorateProfileImageDropzone(element) {
  element.classList.add('profile-image');
  const dropzone = createTag('image-dropzone', { class: 'profile-image' });

  const inputLabel = createTag('div', { slot: 'img-label', class: 'img-upload-text' });
  const paragraphs = element.querySelectorAll(':scope > p');
  paragraphs.forEach((p) => {
    inputLabel.append(p);
  });
  dropzone.append(inputLabel);
  element.append(dropzone);
}

function decorateTitle(element) {
  const deleteButton = createTag('div', { class: 'repeater-delete-button profile-delete-button' });
  // eslint-disable-next-line no-undef
  deleteButton.append(getIcon('remove-circle'));
  deleteButton.classList.add('hidden');
  deleteButton.setAttribute('deleteHandler', () => { });

  element.parentNode.append(deleteButton);
}

function decorateHeader(element) {
  element.classList.add('profile-header-wrapper');

  const cols = element.querySelectorAll(':scope > div');

  cols.forEach((col, i) => {
    switch (i) {
      case 0:
        decorateProfileImageDropzone(col);
        break;
      case 1:
        decorateTitle(col);
        break;
      default:
        break;
    }
  });
}

async function decorateSocialMedia(element) {
  const socialTag = createTag('div');
  element.replaceWith(socialTag);

  socialTag.append(element);

  await decorateTextfield(element);
  addRepeater(socialTag, 'Add social media');
}

async function decorateProfile(element) {
  const rows = element.querySelectorAll(':scope > div');
  rows.forEach((row, i) => {
    switch (i) {
      case 0:
        decorateHeader(row);
        break;
      case 1:
        decorateTextfield(row, { id: 'profile-field-name' });
        break;
      case 2:
        decorateTextfield(row, { id: 'profile-field-title' });
        break;
      case 3:
        decorateTextarea(row, { id: 'profile-field-bio' });
        break;
      case 4:
        decorateSocialMedia(row);
        break;
      default:
        break;
    }
  });
}

export default async function init(element) {
  element.classList.add('form-component');

  await decorateProfile(element);

  addRepeater(element.parentNode.parentNode, 'Add Profile');
}
