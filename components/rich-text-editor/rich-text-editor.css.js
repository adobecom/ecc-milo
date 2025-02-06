/* stylelint-disable selector-class-pattern */
import { getLibs } from '../../scripts/utils.js';

const { css } = await import(`${getLibs()}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
#toolbar button {
    margin: 2px;
}
#editor {
    border: 1px solid #ccc;
    padding: 10px;
    min-height: 200px;
    margin-top: 5px;
}
`;
