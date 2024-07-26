import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
    sp-popover {
      padding: 0;
      max-height: 200px;
    }

    search-row {
      display: flex;
    }

    search-row-image {
      width: 20px;
    }
`;
