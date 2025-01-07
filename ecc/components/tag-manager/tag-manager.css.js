import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

const style = css`
  :host {
    display: block;
    position: relative;
  }

  .tags-pool {
    min-height: 189px;
    padding: 10px;
    border: 1px solid var(--color-gray-500);
    width: 100%;
    margin-bottom: 36px;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background-color: var(--color-white);
    border: 1px solid var(--color-black);
    border-radius: 4px;
  }

  .tag .icon-cross {
    height: 8px;
    width: 8px;
    display: block;
    cursor: pointer;
  }

  .menu-breadcrumbs {
    display: flex;
    align-items: center;
    margin-bottom: 36px;
  }

  .menu-breadcrumbs a {
    cursor: pointer;
    border-radius: 8px;
    margin: 0 4px;
    padding: 8px;
  }

  .menu-breadcrumbs a:last-of-type:not(:first-of-type) {
    font-weight: 700;
    padding: 8px 24px;
    background-color: var(--color-gray-200);
  }

  .menu-group {
    display: flex;
    align-items: flex-start;
    margin-bottom: 36px;
  }

  .menu {
    background-color: var(--color-white);
    border-radius: 4px;
    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 10%);
    padding: 8px;
    width: 220px;
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
    background-color: var(--color-gray-200);
  }

  .menu .menu-item-inner {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  .menu .menu-item-inner sp-checkbox {
    margin-top: -2px;
  }
`;

export default style;
