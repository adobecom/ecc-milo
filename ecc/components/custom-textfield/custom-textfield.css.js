/* stylelint-disable selector-class-pattern */
import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
sp-textfield {
    width: 100%;
}

.helper-text {
    display: flex;
    flex-direction: row-reverse;
`;
