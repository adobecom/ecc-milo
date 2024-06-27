/* stylelint-disable selector-class-pattern */
import { getLibs } from '../../scripts/utils.js';

const { css } = await import(`${getLibs()}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
.img-upload-text p {
    margin: 0;
    font-size: var(--type-body-xs-size);
    line-height: normal;
}

.profile-container {
    padding: 40px 72px;
    border-radius: 10px;
    margin: 24px;
    box-shadow: 0 3px 6px 0 rgb(0 0 0 / 16%);
    display: flex;
}

profile-ui {
    width: 100%;
}

repeater-element {
    margin: 24px;
}

.form-component > div:first-of-type > div > h2,
.form-component > div:first-of-type > div > h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 24px 0;
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
`;
