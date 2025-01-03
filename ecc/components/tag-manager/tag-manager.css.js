import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
  :host {
    display: block;
    position: relative;
  }

  .menu-group {
    display: flex;
    align-items: flex-start;
  }

  .menu {
    background-color: var(--color-white);
    border: 1px solid var(--color-gray-300);
    border-radius: 4px;
    box-shadow: 0 2px 4px 0 rgb(0 0 0 / 10%);
    padding: 8px;
  }

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 4px 12px;
    cursor: pointer;
    border-radius: 4px;
  }

  .menu-item:hover {
    background-color: var(--color-gray-100);
  }

  .menu .menu-item-inner {
    display: flex;
    gap: 8px;
    align-items: center;
  }
`;
