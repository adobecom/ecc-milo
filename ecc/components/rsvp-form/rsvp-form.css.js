import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
.rsvp-fields {
  padding: 32px 64px;
  background-color: #f8f8f8;
  border-radius: 6px;
  margin: 0 auto 40px;
  width: 100%;
  box-sizing: border-box;
}

 .field-config-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

 .field-config-table th,
 .field-config-table td {
  width: 50%;
  padding: 8px;
  text-align: left;
}

 .cat-text,
 .table-heading {
  font-weight: 700;
  font-size: var(--type-body-xxs-size);
}

 .field-row {
  height: 54px;
  padding-bottom: 50px;
}

 .form-type {
    margin-inline: 0px;
    border-width: 0px;
    padding-inline: 0px;
  }
  
  .field-label {
    width: 520px;
  }
  
  .rsvp-form {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .field-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
  }

  .field-config-container {
    display: flex;
    align-items: center;
    gap: 28px;
  }

  .field-config-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .tooltip-trigger {
    padding: 0;
    background: none;
    border: none;
    cursor: help;
  }

  .edit-field-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

  .edit-field-modal[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .edit-field-modal > div {
    background-color: white;
    padding: 24px;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .header-row h2 {
    margin: 0;
    font-size: var(--type-heading-m-size);
  }

  .header-row-buttons {
    display: flex;
    gap: 12px;
  }

  .header-row-button {
    padding: 8px 16px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
  }

  .header-row-button:last-child {
    background: #1473e6;
    color: white;
    border-color: #1473e6;
  }

  .field-presentation-row {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }

  .field-required-toggle-row {
    margin-bottom: 24px;
  }

  .field-preview-row {
    border-top: 1px solid #eee;
    padding-top: 24px;
  }

  .field-preview-row h3 {
    margin: 0 0 16px 0;
    font-size: var(--type-heading-s-size);
  }

  .hidden {
    display: none;
  }

  .field-options-row {
    margin-bottom: 24px;
  }

  .field-option-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }

  .field-option-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    background-color: #f8f8f8;
    border-radius: 4px;
  }

  .field-option-item span {
    font-size: var(--type-body-s-size);
  }

  .field-option-item .field-config-button {
    opacity: 0.5;
  }

  .field-option-item:hover .field-config-button {
    opacity: 1;
  }
`;
