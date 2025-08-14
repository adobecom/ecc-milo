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
  }

  .chart-card h3 {
    margin: 0 0 8px 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
  }

  .chart-description {
    margin: 0 0 20px 0;
    font-size: 0.875rem;
    color: #666;
    line-height: 1.4;
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

  /* Legend Styles */
  .legend {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 0;
    border-top: 1px solid #f0f0f0;
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

  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    flex-shrink: 0;
    border: 1px solid rgba(0, 0, 0, 0.1);
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

  .legend-details {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 0.8rem;
    color: #666;
  }

  .legend-score {
    font-weight: 600;
    color: #333;
    min-width: 30px;
    text-align: right;
  }

  .legend-weight {
    color: #999;
    font-style: italic;
  }

  .legend-contribution {
    font-weight: 600;
    color: #007bff;
    min-width: 40px;
    text-align: right;
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
