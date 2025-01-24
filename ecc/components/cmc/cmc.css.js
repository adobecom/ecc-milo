import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

const style = css`
  :host {
    display: block;
    position: relative;
    box-sizing: border-box;
    margin: 0 auto;
    --color-white: #ffffff;
    --color-black: #000000;
    --color-red: #EB1000;
  }

  .header {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 0 20px;
    max-width: 1440px;
    margin: 0 auto 10px;
  }

  .header h1 {
    color: var(--color-red);
    font-weight: 900;
  }

  .header .status {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header .icon {
    height: 10px;
    width: 10px;
    display: block;
  }

  .header > div {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .header .back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-red);
    font-size: 24px;
    font-weight: 900;
    text-decoration: none;
  }

  .header .back-button .icon {
    height: 16px;
    width: 16px;
    display: block;
  }

  .tag-manager {
    background-color: var(--color-white);
    padding: 44px 67px;
    box-shadow: 0px 4px 4px 0px rgb(0 0 0 / 25%);
    border-radius: 8px;
    margin: 0 auto;
    box-sizing: border-box;
    max-width: 1400px;
  }

  .cloud-type-picker {
    margin-bottom: 18px;
  }

  .tag-manager h2 {
    color: var(--color-gray-600)
  }

  .tags-pool {
    min-height: 189px;
    padding: 10px;
    border: 1px solid var(--color-gray-300);
    border-radius: 10px;
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

  .millar-menu {
    background-color: var(--color-gray-100);
    border-radius: 10px;
    overflow: hidden;
  }

  .menu-breadcrumbs {
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: var(--color-gray-200);
    overflow-x: auto;
  }

  .menu-breadcrumbs a {
    cursor: pointer;
    border-radius: 8px;
    margin: 0 4px;
    white-space: nowrap;
  }

  .menu-breadcrumbs a img {
    display: block;
    height: 27px;
    width: 18px;
  }

  .menu-breadcrumbs a:last-of-type:not(:first-of-type) {
    font-weight: 700;
  }

  .menu-group {
    display: flex;
    align-items: flex-start;
    padding: 20px;
    overflow-x: auto;
    max-height: 348px;
  }

  .menu {
    background-color: var(--color-white);
    border-radius: 4px;
    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 10%);
    padding: 8px;
    max-width: 220px;
    min-width: 220px;
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

  .action-bar {
    position: sticky;
    bottom: 0;
    background-color: #EB1000;
    margin-top: 40px;
    padding: 12px 24px;
    gap: 16px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  sp-toast {
    position: absolute;
    top: -100%;
  }
`;

export default style;
