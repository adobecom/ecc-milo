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
    position: relative;
    overflow: hidden;
  }

  .templates-header {
    padding: 16px;
    border-bottom: 1px solid var(--color-gray-200);
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex-shrink: 0;
  }

  .templates-header h2 {
    margin: 0;
    font-size: var(--type-heading-m-size);
  }

  .search-container {
    padding: 16px;
    border-bottom: 1px solid var(--color-gray-200);
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  .templates-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    position: relative;
  }

  .template-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    transition: background-color 0.2s ease;
    border-left: 3px solid var(--spectrum-accent-color-1000);
    position: relative;
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
    position: relative;
    z-index: 2;
  }

  .template-item:hover .template-actions {
    opacity: 1;
  }

  .search-container sp-textfield {
    position: relative;
    z-index: 1;
  }
`;
export default style;
