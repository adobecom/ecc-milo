import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
.rsvp-checkboxes {
  padding: 32px 64px;
  background-color: #f8f8f8;
  border-radius: 6px;
  margin: 0 auto 40px;
}

 .field-config-table {
  width: 100%;
  border-collapse: collapse;
}

 .cat-text,
 .table-heading {
  font-weight: 700;
  font-size: var(--type-body-xxs-size);
}

 .field-row {
  height: 54px;
  padding-bottom: 50px;
}

 .form-type {
    margin-inline: 0px;
    border-width: 0px;
    padding-inline: 0px;
  }
  
  .field-label {
    width: 520px;
  }
`;
