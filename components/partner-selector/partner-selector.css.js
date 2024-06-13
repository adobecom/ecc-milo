/* stylelint-disable selector-class-pattern */
import { getLibs } from '../../scripts/utils.js';

const { css } = await import(`${getLibs()}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
fieldset {
  margin-bottom: 32px;
  border: none;
  padding: 0;
}

.partner-field-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.partner-input-wrapper {
  display: flex;
  flex-direction: column;
}

.partner-input-wrapper label {
  font-weight: 700;
}
`;
