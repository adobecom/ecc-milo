/* stylelint-disable selector-class-pattern */
import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
fieldset {
  margin-bottom: 32px;
  border: none;
  padding: 0;
}

.product-field-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product-field-wrapper img.product-img {
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: contain;
}
`;
