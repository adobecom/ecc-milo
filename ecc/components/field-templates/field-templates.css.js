import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

const style = css`
  .templates-container {
    width: 300px;
    background: white;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--spectrum-global-dimension-size-100);
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .templates-header {
    padding: 16px;
    border-bottom: 1px solid var(--color-gray-200);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .templates-header h2 {
    margin: 0;
    font-size: var(--type-heading-m-size);
  }

  .search-container {
    padding: 16px;
    border-bottom: 1px solid var(--color-gray-200);
  }

  .templates-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .template-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .template-item:hover {
    background-color: var(--color-gray-50);
  }

  .template-item.selected {
    background-color: var(--color-gray-100);
  }

  .template-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .template-name {
    font-weight: 600;
    font-size: var(--type-body-s-size);
  }

  .template-date {
    font-size: var(--type-body-xs-size);
    color: var(--color-gray-600);
  }

  .template-actions {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .template-item:hover .template-actions {
    opacity: 1;
  }
`;
export default style;
