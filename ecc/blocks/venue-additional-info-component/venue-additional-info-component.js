import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';
import '../../components/image-dropzone/image-dropzone.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function buildImageDropZone(row) {
  row.classList.add('venue-additional-info-image');
  const venueAdditionalImage = createTag('image-dropzone', { class: 'venu-additional-info-image' });
  row.append(venueAdditionalImage);
}

function buildRTE(row) {
   
}

function buildAdditionalInfo(row) {
  console.log(row);
  row.classList.add('venue-additional-info-checkbox');
  const fieldSet = createTag('fieldset', { class: 'checkboxes' });
  const [inputLabel, comment] = [...row.querySelectorAll(':scope  p')];
  const labelText = inputLabel.textContent.trim();
  const checkbox = createTag('sp-checkbox', { id: 'checkbox-venue-additional-info-visible' }, labelText);
  const wrapper = createTag('div', { class: 'checkbox-wrapper' });

  wrapper.append(checkbox);
  fieldSet.append(wrapper);

  const additionComment = createTag('div', { class: 'additional-comment' });
  additionComment.append(comment.textContent.trim());
  row.innerHTML = '';
  fieldSet.append(additionComment);
  row.append(fieldSet);
  row.classList.add('venue-additional-info-checkbox-wrapper');
}

async function decorateProfile(element) {
  const fieldlabels = extractFieldLabels(element);
  element.innerHTML = '';

  const profileContainer = createTag('profile-container', { class: 'profile-component' });
  profileContainer.fieldlabels = fieldlabels;
  profileContainer.profiles = [{ socialMedia: [{ link: '' }], isPlaceholder: true }];
  element.append(profileContainer);
}

export default async function init(el) {
  el.classList.add('form-component');
  
  const rows = el.querySelectorAll(':scope > div');
  rows.forEach((r, i) => {
    switch (i) {
      case 0:
        generateToolTip(r);
        break;
      case 1:
        buildImageDropZone(r);
        break;
      case 2:
        buildRTE(r);
        break;
      case 3:
        buildAdditionalInfo(r);
        break;
      default:
        break;
    }
  });
}

