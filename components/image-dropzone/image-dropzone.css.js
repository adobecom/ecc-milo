/* stylelint-disable selector-class-pattern */
export const styles = `
.image-dropzones {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

.img-file-input-wrapper {
  border: 2px dashed var(--color-gray-400);
  border-radius: 8px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  align-items: center;
}

.img-file-input-wrapper .preview-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.img-file-input-wrapper .preview-wrapper .icon-delete {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
}

.img-file-input-wrapper .preview-img-placeholder {
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
}

.img-file-input-wrapper .preview-img-placeholder img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.img-file-input-wrapper div {
  border-radius: 8px;
  display: block;
  box-sizing: border-box;
  padding: 24px;
  height: 100%;
  width: 100%;
}

.img-file-input-wrapper div:hover {
  background-color: var(--color-gray-100);
}

.img-file-input-wrapper div input.img-file-input {
  display: none;
}

.img-file-input-wrapper div img.icon {
  width: 40px;
  opacity: 0.5;
  margin-bottom: 24px;
}

.img-file-input-wrapper div p {
  margin: 0;
  font-size: var(--type-body-xs-size);;
}

.img-file-input-wrapper .hidden {
  display: none;
}

@media (min-width: 900px) {
  .image-dropzones {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .img-upload-component.hero .image-dropzones {
    grid-template-columns: 2fr 1fr;
  }
}
`