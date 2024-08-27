import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
  :host {
    display: block;
    position: relative;
  }

  sp-textfield {
    width: 100%;
  }

  .menu-overlay {
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    z-index: 10;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    display: none;
  }

  .menu-overlay.open {
    display: block;
  }

  sp-menu-item.focused {
    background-color: var(--highcontrast-menu-item-background-color-focus, var(--mod-menu-item-background-color-down, var(--spectrum-menu-item-background-color-down)));
  }
`;
