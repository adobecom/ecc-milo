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
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e1e5e9;
    transition: all 0.3s ease;
  }

  :host(.dark-mode) .date-range-picker {
    background: #2d2d2d;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    border-color: #404040;
  }

  .picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .picker-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }

  :host(.dark-mode) .picker-title {
    color: #e1e5e9;
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

  :host(.dark-mode) .custom-toggle {
    border-color: #404040;
    background: #2d2d2d;
    color: #b0b0b0;
  }

  .custom-toggle:hover {
    border-color: #007bff;
    color: #007bff;
  }

  :host(.dark-mode) .custom-toggle:hover {
    border-color: #4dabf7;
    color: #4dabf7;
  }

  .custom-toggle.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
  }

  :host(.dark-mode) .custom-toggle.active {
    background: #4dabf7;
    border-color: #4dabf7;
  }

  /* Preset Buttons */
  .preset-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .preset-btn {
    padding: 6px 12px;
    border: 2px solid #e1e5e9;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.2s ease;
    color: #555;
    flex: 1;
    min-width: 100px;
  }

  :host(.dark-mode) .preset-btn {
    border-color: #404040;
    background: #2d2d2d;
    color: #b0b0b0;
  }

  .preset-btn:hover {
    border-color: #007bff;
    color: #007bff;
  }

  :host(.dark-mode) .preset-btn:hover {
    border-color: #4dabf7;
    color: #4dabf7;
  }

  .preset-btn.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
  }

  :host(.dark-mode) .preset-btn.active {
    background: #4dabf7;
    border-color: #4dabf7;
  }

  /* Custom Range */
  .custom-range {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .date-inputs {
    display: flex;
    align-items: end;
    gap: 12px;
  }

  .date-input-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .date-inputs .range-summary {
    flex: 0 0 auto;
    margin-left: 8px;
  }

  .date-input-group label {
    font-size: 0.8rem;
    font-weight: 500;
    color: #555;
  }

  .date-input-group input {
    padding: 6px 10px;
    border: 2px solid #e1e5e9;
    border-radius: 6px;
    font-size: 0.8rem;
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
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 6px;
    font-size: 0.8rem;
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
      flex-direction: column;
      align-items: stretch;
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
