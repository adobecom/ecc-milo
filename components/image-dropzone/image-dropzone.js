import { getLibs } from '../../scripts/utils.js';
import { styles } from './image-dropzone.css.js';
import { getIcon } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

class ImageDropzone extends HTMLElement {
  constructor() {
    super();

    // Create a shadow root
    const shadowRoot = this.attachShadow({ mode: 'open' });

    const div = this.decorateImageDropzone();
    shadowRoot.append(div);

    // init Shadow DOM specific CSS
    this.initStyles();
  }

  decorateImageDropzone() {
    // const inputId = this.getAttribute('input-id');

    const previewImg = createTag('div', { class: 'preview-img-placeholder' });
    const previewDeleteButton = getIcon('delete');

    const previewWrapper = createTag('div', { class: 'preview-wrapper hidden' });
    previewWrapper.append(previewImg, previewDeleteButton);

    const inputDiv = createTag('label', { class: 'img-file-input-label' });
    const inputLabel = createTag('slot', { name: 'img-label' });
    const fileInput = createTag('input', { type: 'file', class: 'img-file-input' });
    inputDiv.append(fileInput, getIcon('image-add'));
    inputDiv.append(inputLabel);

    const inputWrapper = createTag('div', { class: 'img-file-input-wrapper' });
    inputWrapper.append(previewWrapper, inputDiv);
    return inputWrapper;
  }

  initStyles() {
    const styleElement = createTag('style');
    styleElement.textContent = styles;

    this.shadowRoot.appendChild(styleElement);
  }
}

customElements.define('image-dropzone', ImageDropzone);
