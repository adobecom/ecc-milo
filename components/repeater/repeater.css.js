/* stylelint-disable selector-class-pattern */
import { getLibs } from '../../scripts/utils.js';

const { css } = await import(`${getLibs()}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
.repeater-element {
    max-width: 100%;
    height: var(--spectrum-spacing-700, 48px);
    flex-shrink: 0;
    border-radius: 10px;
    border: 1px dashed var(--color-gray-500);
    display: flex;
    align-items: center;
    padding: 0 32px;
    cursor: pointer;
  }
  
.repeater-element:hover .icon-add-circle,
.icon-remove-circle:hover {
    opacity: 1;
}

.icon-add-circle{
  height: 24px;
  width: 24px;
  opacity: 0.3;
  transition: opacity 0.2s;
  cursor: pointer;
}

.repeater-element-title {
  width: 100%;
  color: var(--color-gray-500);
  font-family: var(--body-font-family);
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  margin: 0;
}

`;
