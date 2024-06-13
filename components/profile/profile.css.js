/* stylelint-disable selector-class-pattern */
import { getLibs } from '../../scripts/utils.js';

const { css } = await import(`${getLibs()}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
image-dropzone {
  width: 40%;
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

sp-textfield {
    width: 100%;
}

p {
    margin: 0px;
}

h2 {
  font-size: var(--type-heading-xl-size);
  line-height: var(--type-heading-xl-lh);
  margin-top: 0;
  margin-bottom: 16px;
}

h5 {
  margin-bottom: 0px;
}

.social-media {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.social-media-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.social-media-input {
  width: 100%;
}

.save-profile-button {
  width: fit-content;
  align-self: end;
}

.icon-remove-circle {
  height: 24px;
  width: 24px;
  opacity: 0.3;
  transition: opacity 0.2s;
  cursor: pointer;
}

.icon-remove-circle:hover {
  opacity: 1;
}

.edit-profile {
    align-self: end;
}

modal{
    width: 1000px;
}

.profile-view {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.social-media h3 {
    margin: 0;
}

.speaker-image {
    width: 300px;
    height: 200px;
}
`;
