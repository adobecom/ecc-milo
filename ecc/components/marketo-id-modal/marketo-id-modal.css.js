/* stylelint-disable selector-class-pattern */
import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
  :host {
    position: relative;
    z-index: 1000;
  }

  sp-underlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1001;
  }

  sp-underlay:not([open]) {
    display: none;
  }

  sp-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1002;
    background: var(--spectrum-gray-100, #ffffff);
    min-width: 480px;
    max-width: 600px;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
    padding: 0;
  }

  sp-dialog:not([open]) {
    display: none;
  }

  sp-dialog h1 {
    font-size: var(--type-heading-s-size, 24px);
    font-weight: 700;
    line-height: 1.25;
    margin: 0;
    padding: 32px 32px 24px;
    color: var(--spectrum-gray-900, #2c2c2c);
  }

  .modal-content {
    padding: 0 32px 24px;
  }

  .input-container {
    position: relative;
  }

  sp-textfield {
    width: 100%;
    font-size: 16px;
    --mod-textfield-border-radius: 8px;
    --mod-textfield-height: 48px;
    --mod-textfield-padding-inline: 16px;
    --mod-textfield-font-size: 16px;
  }

  sp-textfield::part(input) {
    font-size: 16px;
  }

  .error-message {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    font-size: 12px;
    color: var(--spectrum-red-600, #d73027);
    line-height: 1.3;
  }

  .button-container {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    padding: 24px 32px 32px;
    border-top: 1px solid var(--spectrum-gray-300, #e1e1e1);
    margin-top: 8px;
  }

  .button-container sp-button {
    min-width: 100px;
    height: 40px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 14px;
  }

  .button-container sp-button[variant="secondary"] {
    background-color: var(--spectrum-gray-200, #f0f0f0);
    border: 1px solid var(--spectrum-gray-300, #e1e1e1);
    color: var(--spectrum-gray-800, #464646);
  }

  .button-container sp-button[variant="secondary"]:hover:not([disabled]) {
    background-color: var(--spectrum-gray-300, #e1e1e1);
    border-color: var(--spectrum-gray-400, #bcbcbc);
  }

  .button-container sp-button[variant="cta"] {
    background-color: var(--spectrum-gray-800, #464646);
    border: 1px solid var(--spectrum-gray-800, #464646);
    color: var(--spectrum-gray-50, #ffffff);
  }

  .button-container sp-button[variant="cta"]:hover:not([disabled]) {
    background-color: var(--spectrum-gray-900, #2c2c2c);
    border-color: var(--spectrum-gray-900, #2c2c2c);
  }

  .button-container sp-button[variant="cta"]:disabled {
    background-color: var(--spectrum-gray-300, #e1e1e1);
    border-color: var(--spectrum-gray-300, #e1e1e1);
    color: var(--spectrum-gray-500, #9f9f9f);
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    sp-dialog {
      min-width: 320px;
      max-width: calc(100vw - 32px);
      margin: 16px;
    }

    sp-dialog h1 {
      font-size: var(--type-heading-xs-size, 20px);
      padding: 24px 24px 16px;
    }

    .modal-content {
      padding: 0 24px 16px;
    }

    .button-container {
      padding: 16px 24px 24px;
      flex-direction: column-reverse;
      gap: 12px;
    }

    .button-container sp-button {
      width: 100%;
      min-width: unset;
    }
  }
`;
