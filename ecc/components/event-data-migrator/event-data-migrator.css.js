/* stylelint-disable selector-class-pattern */
import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
  :host {
    display: block;
    padding: 20px;
  }

  .form-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .header h1 {
    margin: 0;
    font-size: 24px;
  }

  .change-status {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .picker-container {
    margin-bottom: 20px;
  }

  .pickers {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .migration-container {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
  }

  .events-list {
    background: #f5f5f5;
    border-radius: 4px;
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .events-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .events-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 32px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .loading-container span {
    color: #666;
    font-size: 14px;
  }

  .events {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
  }

  .event-item {
    padding: 12px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .event-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .event-title {
    flex: 1;
    font-size: 14px;
  }

  .status-icon {
    flex-shrink: 0;
  }

  .status-icon.success {
    color: #2d6830;
  }

  .status-icon.error {
    color: #e34850;
  }

  .error-message {
    margin-top: 8px;
    padding: 8px;
    background: #fce8e8;
    border-radius: 4px;
    color: #e34850;
    font-size: 12px;
  }

  .event-item.pending {
    background: #f8f8f8;
  }

  .event-item.success {
    background: #f0f7f0;
  }

  .event-item.error {
    background: #fce8e8;
  }

  .migrations-section {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 4px;
  }

  .migrations-section h2 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
  }

  .migrations {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 16px;
  }

  .migration-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr auto auto;
    gap: 16px;
    align-items: center;
    padding: 16px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    padding: 16px;
    background: white;
    box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
  }

  sp-picker {
    width: 100%;
  }

  sp-underlay:not([open]) + sp-dialog {
    display: none;
  }

  sp-underlay + sp-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
      background: var(--spectrum-gray-100);
  }

  sp-underlay + sp-dialog .button-container {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
  }

  .status-badge {
    padding: 0 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .status-badge.published {
    background-color: #e8f5e9;
    color: #2e7d32;
  }

  .status-badge.draft {
    background-color: #fff3e0;
    color: #ef6c00;
  }
`;
