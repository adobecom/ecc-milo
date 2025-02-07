/* stylelint-disable selector-class-pattern */
import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
#toolbar button {
    margin: 2px;
}
#editor .tiptap {
    border: 1px solid #ccc;
    padding: 10px;
    min-height: 200px;
    margin-top: 5px;
}
`;
