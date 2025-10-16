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
    min-width: 360px;
    max-width: 420px;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
    padding: 0;
    --mod-dialog-confirm-buttongroup-padding-top: 0;
    --mod-dialog-confirm-padding-grid: 2rem;
    --spectrum-dialog-confirm-divider-block-spacing-end: 0px;
    --mod-dialog-confirm-title-text-size: 20px;
    display: flex;
  }

  sp-dialog:not([open]) {
    display: none;
  }

  sp-dialog h1 {
   --type-heading-s-size: 20px;
  }

  .modal-content {
    padding-bottom: 1.5rem
  }

  .modal-description {
    font-size: var(--type-body-s-size, 16px);
    line-height: 1.5;
    margin: 0;
    color: var(--spectrum-gray-700, #5c5c5c);
  }

  #button-container {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
  }

  .button-container sp-button {
    min-width: 80px;
  }

  .button-container sp-button[variant="secondary"] {
    background-color: transparent;
    border: 1px solid var(--spectrum-gray-400, #bcbcbc);
    color: var(--spectrum-gray-800, #464646);
  }

  .button-container sp-button[variant="secondary"]:hover {
    background-color: var(--spectrum-gray-200, #f0f0f0);
    border-color: var(--spectrum-gray-500, #9f9f9f);
  }

  .button-container sp-button[variant="cta"] {
    background-color: var(--spectrum-blue-600, #1473e6);
    border: 1px solid var(--spectrum-blue-600, #1473e6);
    color: var(--spectrum-gray-50, #ffffff);
  }

  .button-container sp-button[variant="cta"]:hover {
    background-color: var(--spectrum-blue-700, #0d66d0);
    border-color: var(--spectrum-blue-700, #0d66d0);
  }

  @media (max-width: 600px) {
    sp-dialog {
      min-width: 320px;
      max-width: calc(100vw - 32px);
      margin: 16px;
    }

    sp-dialog h1 {
      font-size: var(--type-heading-xs-size, 20px);
      padding: 24px 24px 12px;
    }

    .modal-content {
      padding: 0 24px 16px;
    }

    .modal-description {
      font-size: var(--type-body-xs-size, 14px);
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
