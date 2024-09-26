import { getLibs } from '../../scripts/utils.js';

const { css } = await import(`${getLibs()}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
  :host {
    display: block;
    position: relative;
    margin-bottom: 1rem;
  }

  sp-textfield {
    width: 100%;
  }

  sp-menu {
    width: 190px;
  }
`;
