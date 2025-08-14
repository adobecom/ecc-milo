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
    margin: 0 0 20px 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
  }

  .chart-container {
    width: 100%;
    height: 400px;
    margin-bottom: 20px;
    position: relative;
  }

  .chart-container svg {
    width: 100%;
    height: 100%;
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
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px 0;
    border-top: 1px solid #f0f0f0;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .legend-item:hover {
    background: #f8f9fa;
  }

  .legend-item.active {
    background: #f8f9fa;
  }

  .legend-item.inactive {
    opacity: 0.5;
  }

  .legend-item.inactive .legend-color {
    opacity: 0.3;
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .legend-label {
    color: #333;
    white-space: nowrap;
  }

  .legend-toggle {
    font-size: 14px;
    color: #666;
    margin-left: 4px;
  }

  .legend-item.active .legend-toggle {
    color: #007bff;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .chart-card {
      padding: 16px;
    }

    .chart-container {
      height: 300px;
    }

    .legend {
      flex-direction: column;
      gap: 8px;
    }

    .legend-item {
      padding: 6px 8px;
    }
  }

  @media (max-width: 480px) {
    .chart-container {
      height: 250px;
    }

    .legend-item {
      font-size: 0.8rem;
    }
  }
`;
