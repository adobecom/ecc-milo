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
    min-width: 420px;
    max-width: 600px;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
    padding: 0;
    --mod-dialog-confirm-padding-grid: 2rem;
  }

  sp-dialog:not([open]) {
    display: none;
  }


  .modal-content {

  }

  .input-container {
    position: relative;
  }

  sp-textfield {
    width: 100%;
    font-size: 16px;
    --mod-textfield-border-radius: 8px;
    --mod-textfield-padding-inline: 16px;
    --mod-textfield-font-size: 16px;
  }

  sp-textfield::part(input) {
    font-size: 16px;
  }

  .error-message {
    margin-top: 4px;
    font-size: 14px;
    color: #d73027;
    font-weight: 600;
  }

  .button-container {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
  }

  .button-container sp-button {
    min-width: 100px;
  }


  .button-container sp-button[variant="secondary"]:hover:not([disabled]) {
    background-color: var(--spectrum-gray-300, #e1e1e1);
    border-color: var(--spectrum-gray-400, #bcbcbc);
  }  

  .button-container sp-button[variant="cta"]:disabled {
    background-color: var(--spectrum-gray-300, #e1e1e1);
    border-color: var(--spectrum-gray-300, #e1e1e1);
    color: var(--spectrum-gray-500, #9f9f9f);
    cursor: not-allowed;
  }
  .loader {
    width: 48px;
    height: 48px;
    border: 4px solid #ccc;
    border-top-color: #007bff;
    border-radius: 50%;
    animation: spin 1s 
    linear infinite;
    margin-bottom: 1rem;
    position: fixed;
    z-index: 999;
    opacity: 1;
    margin: auto;
    left: 0;
    right: 0;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
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
