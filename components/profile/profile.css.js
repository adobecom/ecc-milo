/* stylelint-disable selector-class-pattern */
import { getLibs } from '../../scripts/utils.js';

const { css } = await import(`${getLibs()}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
image-dropzone {
    width: 40%;
}

.img-file-input-wrapper {
  border: 2px dashed var(--color-gray-400);
  border-radius: 8px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  align-items: center;
}

sp-textfield {
    width: 100%;
}

p {
    margin: 0px;
}

h5 {
    margin-bottom: 0px;
}
`;
