import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
:host * {
  font-family: var(--body-font-family);
}

.rsvp-fields {
  padding: 24px 16px;
  background-color: var(--color-gray-100);
  border-radius: 6px;
  margin: 0 auto 40px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
    justify-content: flex-end;
    gap: 28px;
  }

  .selected-fields .field-config-container,
  .selected-options .field-config-container button[aria-label="Remove option"] {
    display: none;
  }

  .selected-fields .field-row:hover .field-config-container,
  .selected-options .field-option-item:hover .field-config-container button[aria-label="Remove option"] {
    display: flex;
  }

  .unselected-fields {
    opacity: 0.5;
  }

  .field-config-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .field-config-button[aria-label="Drag and reorder field"] {
    cursor: grab;
  }

  .field-config-button[aria-label="Drag and reorder field"]:active {
    cursor: grabbing;
  }

  .selected-fields .field-row {
    transition: background-color 0.2s ease;
  }

  .selected-fields .field-row.dragging {
    box-shadow: 3px 3px 8px 3px var(--color-gray-200);
    cursor: grabbing;
  }

  .selected-fields .field-row:not(.dragging) {
    transition: background-color 0.2s ease;
  }

  .selected-fields .field-row:not(.dragging):hover {
    background: var(--color-gray-50);
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
    background-color: #90909070;
    z-index: 1000;
  }

  .edit-field-modal[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .edit-field-modal > div {
    background-color: white;
    padding: 32px;
    border-radius: 8px;
    width: 90%;
    max-width: 496px;
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
    border-radius: 24px;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
  }

  .header-row-button:last-child {
    background-color: var(--color-gray-800);
    border-color: var(--color-gray-800);
    color: white;
  }

  .field-presentation-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    border-radius: 4px;
    cursor: grab;
  }

  .field-option-item.dragging {
    opacity: 0.5;
    background: var(--color-gray-100);
    cursor: grabbing;
    box-shadow: 3px 3px 8px 3px var(--color-gray-200);
  }

  .field-option-item:not(.dragging) {
    transition: background-color 0.2s ease;
  }

  .field-option-item:not(.dragging):hover {
    background: var(--color-gray-50);
  }

  .field-option-item .field-config-button {
    opacity: 0.5;
  }

  .field-option-item:hover .field-config-button {
    opacity: 1;
  }

  .selected-fields,
  .unselected-fields {
    width: 100%;
  }

  .selected-options,
  .unselected-options {
    width: 100%;
  }

  .unselected-options {
    opacity: 0.5;
  }

  .selected-options .field-option-item,
  .unselected-options .field-option-item {
    height: 54px;
    transition: background-color 0.2s ease;
  }

  .selected-options .field-option-item:hover,
  .unselected-options .field-option-item:hover {
    background: var(--color-gray-50);
  }

  .selected-options .field-option-item.dragging {
    box-shadow: 3px 3px 8px 3px var(--color-gray-200);
    cursor: grabbing;
  }

  .selected-options .field-option-item:not(.dragging) {
    cursor: grab;
  }

  .selected-options .field-option-item:not(.dragging):active {
    cursor: grabbing;
  }

  /* Drop indicator styles */
  .field-row.drop-above {
    border-top: 3px solid #378ef0;
  }

  .field-row.drop-below {
    border-bottom: 3px solid #378ef0;
  }

  .field-option-item.drop-above {
    border-top: 3px solid #378ef0;
  }

  .field-option-item.drop-below {
    border-bottom: 3px solid #378ef0;
  }
`;
