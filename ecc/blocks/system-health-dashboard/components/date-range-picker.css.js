import { LIBS } from '../../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
  :host {
    display: block;
  }

  .date-range-picker {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e1e5e9;
  }

  .picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .picker-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }

  .custom-toggle {
    padding: 6px 12px;
    border: 2px solid #e1e5e9;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    color: #555;
  }

  .custom-toggle:hover {
    border-color: #007bff;
    color: #007bff;
  }

  .custom-toggle.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
  }

  /* Preset Buttons */
  .preset-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .preset-btn {
    padding: 8px 16px;
    border: 2px solid #e1e5e9;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    color: #555;
    flex: 1;
    min-width: 120px;
  }

  .preset-btn:hover {
    border-color: #007bff;
    color: #007bff;
  }

  .preset-btn.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
  }

  /* Custom Range */
  .custom-range {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .date-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .date-input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .date-input-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #555;
  }

  .date-input-group input {
    padding: 8px 12px;
    border: 2px solid #e1e5e9;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: border-color 0.2s ease;
  }

  .date-input-group input:focus {
    outline: none;
    border-color: #007bff;
  }

  .range-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .range-days {
    font-weight: 600;
    color: #333;
  }

  .range-dates {
    color: #666;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .date-inputs {
      grid-template-columns: 1fr;
    }

    .preset-buttons {
      flex-direction: column;
    }

    .preset-btn {
      min-width: auto;
    }

    .range-summary {
      flex-direction: column;
      gap: 4px;
      text-align: center;
    }
  }
`;
