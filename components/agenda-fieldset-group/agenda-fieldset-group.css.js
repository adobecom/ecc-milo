import { getLibs } from '../../events/scripts/utils.js';

const { css } = await import(`${getLibs()}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
  agenda-fieldset {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 16px;
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
