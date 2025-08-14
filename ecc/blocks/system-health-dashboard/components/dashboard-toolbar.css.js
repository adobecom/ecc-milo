import { LIBS } from '../../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
  :host {
    display: block;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .toolbar-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .toolbar-label {
    font-weight: 600;
    color: #555;
    font-size: 14px;
  }

  .toolbar-btn {
    padding: 8px 16px;
    border: 2px solid #e1e5e9;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    color: #555;
  }

  .toolbar-btn:hover {
    border-color: #007bff;
    color: #007bff;
  }

  .toolbar-btn.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
  }

  @media (max-width: 768px) {
    .toolbar {
      flex-direction: column;
      align-items: stretch;
    }
    
    .toolbar-section {
      justify-content: center;
    }
  }
`;
