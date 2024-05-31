import { getLibs } from '../../scripts/utils.js';

const { css } = await import(`${getLibs()}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
agenda-fieldset {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 16px;
}
`;
