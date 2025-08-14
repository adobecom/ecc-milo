import { LIBS } from '../../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #333;
    background: #f8f9fa;
    min-height: 100vh;
  }

  .dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
  }

  /* Toolbar Styles */
  .toolbar {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .toolbar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: #f8f9fa;
    border-bottom: 1px solid #e1e5e9;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .toolbar-header:hover {
    background: #e9ecef;
  }

  .toolbar-title {
    font-weight: 600;
    color: #333;
    font-size: 16px;
    margin: 0;
  }

  .toolbar-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
    color: #666;
  }

  .toolbar-toggle:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #333;
  }

  .toolbar-toggle-icon {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
  }

  .toolbar-toggle-icon.rotated {
    transform: rotate(180deg);
  }

  .toolbar-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .toolbar-content.expanded {
    max-height: 200px;
  }

  .toolbar-body {
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
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

  /* Main Score Styles */
  .main-score-container {
    margin-bottom: 32px;
  }

  .main-score {
    background: white;
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border-left: 8px solid;
    transition: all 0.3s ease;
  }

  .main-score.green {
    border-left-color: #28a745;
    background: linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%);
  }

  .main-score.yellow {
    border-left-color: #ffc107;
    background: linear-gradient(135deg, #fffdf8 0%, #fff8e8 100%);
  }

  .main-score.orange {
    border-left-color: #fd7e14;
    background: linear-gradient(135deg, #fff8f5 0%, #ffe8e0 100%);
  }

  .main-score.red {
    border-left-color: #dc3545;
    background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  }

  .score-value {
    font-size: 4rem;
    font-weight: 700;
    margin-bottom: 8px;
    line-height: 1;
  }

  .main-score.green .score-value {
    color: #28a745;
  }

  .main-score.yellow .score-value {
    color: #ffc107;
  }

  .main-score.orange .score-value {
    color: #fd7e14;
  }

  .main-score.red .score-value {
    color: #dc3545;
  }

  .score-label {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .score-subtitle {
    font-size: 1rem;
    color: #666;
    font-weight: 500;
  }

  .score-details {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .score-detail {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 4px;
  }

  /* Meter Styles */
  .meter-container {
    margin: 16px 0;
    text-align: center;
  }

  .meter {
    width: 100%;
    height: 12px;
    background: #e9ecef;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    margin: 8px 0;
  }

  .meter-fill {
    height: 100%;
    border-radius: 6px;
    transition: width 0.8s ease-in-out;
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

  .meter-label {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 4px;
  }

  .meter-value {
    font-size: 0.75rem;
    color: #999;
    margin-top: 4px;
  }

  /* Main Score Meter */
  .main-score .meter {
    height: 16px;
    margin: 20px 0;
  }

  .main-score .meter-fill {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Dashboard Grid */
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .grid-left {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .grid-right {
    display: flex;
    flex-direction: column;
  }

  /* Card Styles */
  .key-metrics-card,
  .ai-suggestions-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .key-metrics-card h3,
  .ai-suggestions-card h3 {
    margin: 0 0 20px 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
  }

  .key-metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .key-metric {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    text-align: center;
  }

  .key-metric-label {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 4px;
    font-weight: 500;
  }

  .key-metric-value {
    font-size: 1.125rem;
    font-weight: 600;
    color: #333;
  }

  /* AI Suggestions */
  .suggestion {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .suggestion:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .suggestion-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .suggestion-content {
    font-size: 0.875rem;
    line-height: 1.5;
    color: #555;
  }

  .suggestion-content strong {
    color: #333;
  }

  /* Sub-Scores Section */
  .sub-scores-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .sub-scores-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
  }

  /* View Mode Toggle */
  .view-mode-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toggle-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #666;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    cursor: pointer;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.3s;
    border-radius: 24px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }

  .toggle-switch input:checked + .toggle-slider {
    background-color: #007bff;
  }

  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(20px);
  }

  .toggle-switch:hover .toggle-slider {
    background-color: #999;
  }

  .toggle-switch input:checked:hover + .toggle-slider {
    background-color: #0056b3;
  }

  .sub-scores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  /* Metric Cards */
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
  }

  /* Loading State */
  .loading {
    text-align: center;
    padding: 60px 20px;
    font-size: 1.125rem;
    color: #666;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
    
    .toolbar {
      flex-direction: column;
      align-items: stretch;
    }
    
    .toolbar-section {
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    .dashboard-container {
      padding: 16px;
    }
    
    .main-score {
      padding: 24px;
    }
    
    .score-value {
      font-size: 3rem;
    }
    
    .score-label {
      font-size: 1.25rem;
    }
    
    .key-metrics-grid {
      grid-template-columns: 1fr;
    }
    
    .sub-scores-grid {
      grid-template-columns: 1fr;
    }
    
    .toolbar-section {
      flex-direction: column;
      gap: 8px;
    }

    .sub-scores-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .view-mode-toggle {
      align-self: flex-end;
    }
  }

  @media (max-width: 480px) {
    .main-score {
      padding: 20px;
    }
    
    .score-value {
      font-size: 2.5rem;
    }
    
    .metric-card {
      padding: 16px;
    }
    
    .metric-value {
      font-size: 1.25rem;
    }
  }
`;
