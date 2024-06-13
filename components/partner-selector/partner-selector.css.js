/* stylelint-disable selector-class-pattern */
import { getLibs } from '../../scripts/utils.js';

const { css } = await import(`${getLibs()}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
  fieldset {
    position: relative;
    border: none;
    padding: 32px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  fieldset image-dropzone {
    display: block;
    width: 280px;
    height: 164px;
  }

  .partner-input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 32px;
    flex-wrap: wrap;
  }

  .partner-input {
    display: flex;
    flex-direction: column;
  }

  .partner-input-wrapper label {
    font-weight: 700;
  }

  .action-area {
    display: flex;
    align-items: center;
    gap: 32px;
  }
`;
