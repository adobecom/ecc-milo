import { LIBS } from '../../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
  :host {
    display: block;
  }

  .metric-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid;
    transition: all 0.2s ease;
  }

  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .metric-card.green {
    border-left-color: #28a745;
  }

  .metric-card.yellow {
    border-left-color: #ffc107;
  }

  .metric-card.orange {
    border-left-color: #fd7e14;
  }

  .metric-card.red {
    border-left-color: #dc3545;
  }

  .metric-card.neutral {
    border-left-color: #6c757d;
  }

  .metric-card.empty {
    border-left-color: #dee2e6;
    color: #6c757d;
    text-align: center;
    font-style: italic;
  }

  .metric-card.error {
    border-left-color: #dc3545;
    color: #dc3545;
    text-align: center;
  }

  .metric-header {
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .metric-title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #333;
    line-height: 1.3;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .metric-icon {
    font-size: 1rem;
  }

  .metric-weight {
    font-size: 0.75rem;
    color: #666;
    font-weight: 500;
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }

  .metric-footer {
    font-size: 0.75rem;
    color: #666;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .metric-description {
    font-size: 0.75rem;
    color: #888;
    line-height: 1.4;
  }

  /* Meter Styles */
  .meter-container {
    margin: 12px 0;
    text-align: center;
  }

  .meter {
    width: 100%;
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    margin: 6px 0;
  }

  .meter-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.6s ease-in-out;
    position: relative;
  }

  .meter-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .meter.green .meter-fill {
    background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
  }

  .meter.yellow .meter-fill {
    background: linear-gradient(90deg, #ffc107 0%, #ffca2c 100%);
  }

  .meter.orange .meter-fill {
    background: linear-gradient(90deg, #fd7e14 0%, #ff8c42 100%);
  }

  .meter.red .meter-fill {
    background: linear-gradient(90deg, #dc3545 0%, #e74c3c 100%);
  }

  .meter.neutral .meter-fill {
    background: linear-gradient(90deg, #6c757d 0%, #868e96 100%);
  }

  .meter-value {
    font-size: 0.625rem;
    color: #999;
    margin-top: 2px;
  }
`;
