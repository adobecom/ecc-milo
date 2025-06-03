import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

export default css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
    background: var(--spectrum-global-color-gray-50);
  }

  .form-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: var(--spectrum-global-dimension-size-400);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spectrum-global-dimension-size-400);
  }

  .header h1 {
    margin: 0;
    font-size: var(--spectrum-global-dimension-size-500);
    color: var(--spectrum-global-color-gray-900);
  }

  .change-status {
    display: flex;
    align-items: center;
    gap: var(--spectrum-global-dimension-size-100);
  }

  .status {
    display: flex;
    align-items: center;
    gap: var(--spectrum-global-dimension-size-100);
    font-size: var(--spectrum-global-dimension-size-200);
    color: var(--spectrum-global-color-gray-700);
  }

  .content {
    flex: 1;
    display: flex;
    gap: var(--spectrum-global-dimension-size-400);
    max-height: 100vh;
    height: max-content;
  }

  .form-section {
    background: var(--spectrum-global-color-gray-50);
    border: 1px solid var(--spectrum-global-color-gray-200);
    border-radius: var(--spectrum-global-dimension-size-100);
    padding: var(--spectrum-global-dimension-size-400);
    flex-grow: 1;
    overflow: auto;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spectrum-global-dimension-size-400);
  }

  .section-header h2 {
    margin: 0;
    font-size: var(--spectrum-global-dimension-size-400);
    color: var(--spectrum-global-color-gray-900);
  }

  .section-header .button-container {
    display: flex;
    align-items: center;
    gap: var(--spectrum-global-dimension-size-200);
  }

  .fields-table {
    width: 100%;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: var(--spectrum-global-dimension-size-200);
    text-align: left;
    border-bottom: 1px solid var(--spectrum-global-color-gray-200);
  }

  th {
    font-weight: var(--spectrum-global-font-weight-bold);
    color: var(--spectrum-global-color-gray-700);
  }

  .field-row {
    background: var(--spectrum-global-color-gray-50);
  }

  .field-row:hover {
    background: var(--spectrum-global-color-gray-100);
  }

  .actions {
    display: flex;
    gap: var(--spectrum-global-dimension-size-100);
  }

  .action-bar {
    display: flex;
    justify-content: flex-end;
    gap: var(--spectrum-global-dimension-size-200);
    padding: var(--spectrum-global-dimension-size-400);
    background: var(--spectrum-global-color-gray-50);
    border-top: 1px solid var(--spectrum-global-color-gray-200);
  }

  .form-container {
    display: flex;
    flex-direction: column;
    gap: var(--spectrum-global-dimension-size-400);
  }

  .field-container {
    display: flex;
    flex-direction: column;
    gap: var(--spectrum-global-dimension-size-100);
  }

  span.divider {
    display: inline-block;
    width: 1px;
    height: 40px;
    background: var(--color-black);
  }
`;
