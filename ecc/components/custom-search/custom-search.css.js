import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
  :host {
    display: block;
    position: relative;
  }

  .menu-overlay {
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    z-index: 10;
    width: 100%;
    max-width: 320px;
    max-height: 200px;
    overflow-y: auto;
    display: none;
    top: 100%;
    left: 0;
  }

  .menu-overlay.open {
    display: block;
  }

  sp-menu {
    width: 100%;
  }

  sp-popover {
    padding: 0;
    max-height: 200px;
  }

  search-row {
    display: flex;
  }

  search-row-image {
    width: 20px;
  }
`;
