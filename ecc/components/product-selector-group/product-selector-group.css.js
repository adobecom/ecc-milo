/* stylelint-disable selector-class-pattern */
import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
  .icon-remove-circle {
    display: block;
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
