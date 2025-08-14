import { LIBS } from '../../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

export default css`
  :host {
    display: block;
  }

  .chart-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
    transition: all 0.3s ease;
  }

  :host(.dark-mode) .chart-card {
    background: #2d2d2d;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .chart-card h3 {
    margin: 0 0 8px 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
  }

  :host(.dark-mode) .chart-card h3 {
    color: #e1e5e9;
  }

  .chart-description {
    margin: 0 0 20px 0;
    font-size: 0.875rem;
    color: #666;
    line-height: 1.4;
  }

  :host(.dark-mode) .chart-description {
    color: #b0b0b0;
  }

  .chart-container {
    width: 100%;
    height: 400px;
    margin-bottom: 20px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chart-container svg {
    width: 400px;
    height: 100%;
  }

  .chart-container svg text {
    pointer-events: none;
  }

  .no-data {
    text-align: center;
    padding: 60px 20px;
    color: #666;
    font-size: 1rem;
  }

  :host(.dark-mode) .no-data {
    color: #999;
  }

  /* Legend Styles */
  .legend {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 0;
    border-top: 1px solid #f0f0f0;
  }

  :host(.dark-mode) .legend {
    border-top-color: #404040;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-radius: 6px;
    transition: all 0.2s ease;
    font-size: 0.875rem;
  }

  .legend-item:hover {
    background: #f8f9fa;
  }

  :host(.dark-mode) .legend-item:hover {
    background: #404040;
  }

  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    flex-shrink: 0;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  :host(.dark-mode) .legend-color {
    border-color: rgba(255, 255, 255, 0.2);
  }

  .legend-content {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .legend-label {
    color: #333;
    font-weight: 500;
    flex: 1;
  }

  :host(.dark-mode) .legend-label {
    color: #e1e5e9;
  }

  .legend-details {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 0.8rem;
    color: #666;
  }

  :host(.dark-mode) .legend-details {
    color: #999;
  }

  .legend-score {
    font-weight: 600;
    color: #333;
    min-width: 30px;
    text-align: right;
  }

  :host(.dark-mode) .legend-score {
    color: #e1e5e9;
  }

  .legend-weight {
    color: #999;
    font-style: italic;
  }

  :host(.dark-mode) .legend-weight {
    color: #b0b0b0;
  }

  .legend-contribution {
    font-weight: 600;
    color: #007bff;
    min-width: 40px;
    text-align: right;
  }

  :host(.dark-mode) .legend-contribution {
    color: #4dabf7;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .chart-container {
      height: 300px;
    }

    .legend {
      gap: 6px;
    }

    .legend-item {
      padding: 6px 0;
      font-size: 0.8rem;
    }

    .legend-details {
      font-size: 0.75rem;
      gap: 6px;
    }

    .legend-score {
      min-width: 25px;
    }

    .legend-contribution {
      min-width: 35px;
    }
  }

  @media (max-width: 480px) {
    .chart-card {
      padding: 16px;
    }

    .chart-container {
      height: 250px;
    }

    .legend-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .legend-details {
      justify-content: flex-start;
    }
  }
`;
