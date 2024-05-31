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
    padding: 24px;
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

.form-component {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-component > div:first-of-type > div > h2,
.form-component > div:first-of-type > div > h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 24px 0;
}

.icon-delete {
    position: relative;
}
`;
