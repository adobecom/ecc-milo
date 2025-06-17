import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
  .agenda-group-container {
    display: flex;
    flex-direction: column;
    gap: 56px;
  }

  agenda-fieldset {
    display: flex;
    width: 100%;
    gap: 16px;
    transition: all 0.2s ease;
  }

  agenda-fieldset.dragging {
    opacity: 0.5;
    cursor: move;
  }

  agenda-fieldset.drop-target {
    border-bottom: 2px solid #378ef0;
    margin-bottom: -2px;
  }

  .icon-remove-circle {
    height: 24px;
    width: 24px;
    opacity: 0.3;
    transition: opacity 0.2s;
    cursor: pointer;
  }
  
  .icon-remove-circle:hover {
    opacity: 1;
  }
  
  repeater-element {
    margin-top: 0px;
    margin-bottom: 0px;
  }
`;
