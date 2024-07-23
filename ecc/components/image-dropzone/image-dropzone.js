/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { LIBS } from '../../scripts/scripts.js';
import { style } from './image-dropzone.css.js';

const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);

export class ImageDropzone extends LitElement {
  static properties = {
    file: { type: Object, reflect: true },
    handleImage: { type: Function },
    handleDelete: { type: Function },
  };

  static styles = style;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.file = null;
    this.handleImage = () => {};
    this.handleDelete = this.handleDelete || null;
  }

  setFile(files) {
    const [file] = files;
    if (file.size > 26214400) {
      this.dispatchEvent(new CustomEvent('show-error-toast', { detail: { message: 'File size should be less than 25MB' }, bubbles: true, composed: true }));
      return;
    }
    if (file.type.startsWith('image/')) {
      this.file = file;
      this.file.url = URL.createObjectURL(file);
      this.requestUpdate();
    }
  }

  getFile() {
    return this.file;
  }

  handleImageDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const { files } = e.dataTransfer;

    if (files.length > 0) {
      this.setFile(files);
      this.handleImage();
    }
  }

  onImageChange(e) {
    const { files } = e.currentTarget;

    if (files.length > 0) {
      this.setFile(files);
      this.handleImage();
    }

    this.dispatchEvent(new CustomEvent('image-change', { detail: { file: this.file } }));
  }

  handleDragover(e) {
    e.preventDefault();
    e.stopPropagation();

    e.currentTarget.classList.add('dragover');
  }

  handleDragleave(e) {
    e.preventDefault();
    e.stopPropagation();

    e.currentTarget.classList.remove('dragover');
  }

  deleteImage() {
    this.file = null;
  }

  render() {
    return this.file?.url ? html`
      <div class="img-file-input-wrapper solid-border">
        <div class="preview-wrapper">
          <div class="preview-img-placeholder">
            <img src="${this.file.url}" alt="preview image">
          </div>
          <img src="/ecc/icons/delete.svg" alt="delete icon" class="icon icon-delete" @click=${this.handleDelete ? this.handleDelete : this.deleteImage}>
        </div>
      </div>`
      : html`
    <div class="img-file-input-wrapper">
      <label class="img-file-input-label" @dragover=${this.handleDragover} @dragleave=${this.handleDragleave} @drop=${this.handleImageDrop}>
        <input type="file" class="img-file-input" accept="image/png, image/jpeg" @change=${this.onImageChange}>
        <img src="/ecc/icons/image-add.svg" alt="add image icon" class="icon icon-image-add"}>
        <slot name="img-label"></slot>
      </label>
    </div>`;
  }
}
