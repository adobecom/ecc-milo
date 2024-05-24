/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { getLibs } from '../../scripts/utils.js';
import { style } from './image-dropzone.css.js';
import { uploadImage } from '../../utils/esp-controller.js';

const { LitElement, html } = await import(`${getLibs()}/deps/lit-all.min.js`);

export class ImageDropzone extends LitElement {
  properties = { file: { type: Object, reflect: true } };

  static styles = style;

  constructor() {
    super();

    this.file = null;
  }

  async handleImageFiles(files) {
    if (files.length > 0) {
      [this.file] = files;
      if (this.file.type.startsWith('image/')) {
        this.file.url = URL.createObjectURL(this.file);
        this.requestUpdate();

        await uploadImage(this.file);
      }
    }
  }

  handleImageDrop(e) {
    const { files } = e.dataTransfer;
    this.handleImageFiles(files);
  }

  handleImageUpload(event) {
    const { files } = event.currentTarget;
    this.handleImageFiles(files);
  }

  handleDragover(e) {
    e.currentTarget.classList.add('dragover');
  }

  handleDragleave(e) {
    e.currentTarget.classList.remove('dragover');
  }

  deleteImage() {
    this.file = null;
    this.requestUpdate();
  }

  render() {
    return html`
    <div class="img-file-input-wrapper">
    ${this.file?.url ? html`
    <div class="preview-wrapper">
      <div class="preview-img-placeholder">
      <img src="${this.file.url}" alt="preview image">
      </div>
      <img src="/icons/delete.svg" alt="delete icon" class="icon icon-delete" @click=${this.deleteImage}>
    </div>`
    : html`<label class="img-file-input-label">
      <input type="file" class="img-file-input" @change=${this.handleImageUpload} @dragover=${this.handleDragover} @dragleave=${this.handleDragleave} @drop=${this.handleImageDrop}>
      <img src="/icons/image-add.svg" alt="add image icon" class="icon icon-image-add"}>
      <slot name="img-label"></slot>
    </label>`}
    </div>
    `;
  }
}
