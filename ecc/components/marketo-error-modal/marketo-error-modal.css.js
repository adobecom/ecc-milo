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

  .modal-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 32px 32px 16px;
  }

  .warning-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    color: var(--spectrum-red-600, #d73027);
    margin-top: 4px;
  }

  .warning-icon svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .modal-header h1 {
    font-size: var(--type-heading-s-size, 24px);
    font-weight: 700;
    line-height: 1.25;
    margin: 0;
    color: var(--spectrum-gray-900, #2c2c2c);
    flex: 1;
  }

  .modal-content {
    padding: 0 32px 24px;
    padding-left: calc(32px + 24px + 16px); /* Align with heading text */
  }

  .modal-message {
    font-size: var(--type-body-s-size, 16px);
    line-height: 1.5;
    margin: 0;
    color: var(--spectrum-gray-700, #5c5c5c);
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

  @media (max-width: 600px) {
    sp-dialog {
      min-width: 320px;
      max-width: calc(100vw - 32px);
      margin: 16px;
    }

    .modal-header {
      padding: 24px 24px 12px;
      gap: 12px;
    }

    .modal-header h1 {
      font-size: var(--type-heading-xs-size, 20px);
    }

    .warning-icon {
      width: 20px;
      height: 20px;
    }

    .modal-content {
      padding: 0 24px 16px;
      padding-left: calc(24px + 20px + 12px); /* Align with heading text on mobile */
    }

    .modal-message {
      font-size: var(--type-body-xs-size, 14px);
    }

    .button-container {
      padding: 16px 24px 24px;
    }

    .button-container sp-button {
      width: 100%;
      min-width: unset;
    }
  }
`;
