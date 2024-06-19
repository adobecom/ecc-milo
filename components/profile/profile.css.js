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
    gap: 30px;
}

.social-media-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin-left: 20px;
}

.social-media-input {
  width: 100%;
}

.profile-action-button {
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
    margin-left: auto;
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

.feds-social-icon {
    display: block;
    width: 24px;
    height: 24px;
    color: #808080;
}

.feds-footer-icons {
    display: none;
}

.last-updated {
    width: 100%;
}

.profile-footer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
}

.save-profile-button {
  width: fit-content;
  align-self: end;
}

.profile-save-footer {
    display: flex;
    flex-direction: row-reverse;
}

.footer-button-group {
    margin-left: auto;
}

.profile-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
}

.edit-profile-title {
    color: var(--color-red);
}
`;
