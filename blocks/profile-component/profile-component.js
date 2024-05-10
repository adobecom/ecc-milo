import { getLibs } from '../../scripts/utils.js';
import '../../components/image-dropzone/image-dropzone.js'
import { addRepeater, decorateTextfield } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function decorateProfileImageDropzone(element){
    element.classList.add('profile-image');
    const dropzone = createTag('image-dropzone', {'inputid' : 'alpha-beta'});

    const inputLabel = createTag('div', { slot: 'img-label' , class : 'img-upload-text'});
    const paragraphs = element.querySelectorAll(':scope > p');
    paragraphs.forEach((p) => {
        inputLabel.append(p);
      });
    dropzone.append(inputLabel);
    element.append(dropzone);
}

function decorateTitle(element){

}


function decorateHeader(element){
    element.classList.add('profile-header-wrapper');

    const cols = element.querySelectorAll(':scope > div');

    cols.forEach((col, i) => {
        switch(i){
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

function decorateBio(element){
    const socialTag = createTag('div');
    element.replaceWith(socialTag);

    socialTag.append(element);

    decorateTextfield(element);
    addRepeater(socialTag, 'Add social media');
}

function decorateProfile(element) {
    const rows = element.querySelectorAll(':scope > div');
    rows.forEach((row, i) => {
        switch(i){
            case 0:
                decorateHeader(row);
                break;
            case 1:
            case 2:
                decorateTextfield(row);
                break;
            case 3:
                decorateTextfield(row, 'textarea');
                break;
            case 4:
                decorateBio(row);
                break;
        }
    });
}

export default function init(element){
    element.classList.add('form-component');

    decorateProfile(element);
}