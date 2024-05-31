import { getLibs } from '../../scripts/utils.js';

const { css } = await import(`${getLibs()}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
.field-container {
  display: flex;
  align-items: center;
  gap: 24px;
  width: 100%;
}

.time-picker {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 13px;
}
 
.time-picker > p {
  font-size: var(--type-heading-m-size);
  font-weight: 700;
  min-width: max-content;
  margin: 0;
}

.time-picker > p::before {
  content: '';
  display: inline-block;
  background-image: url('../../icons/clock.svg');
  background-repeat: no-repeat;
  background-position: center;
  width: 32px;
  height: 16px;
}
 
.time-picker .time-picker-wrapper {
  flex: 1;
  min-width: 150px;
}

.text-field-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}
 
.text-field-wrapper sp-textfield {
  width: 100%;
  margin-bottom: 0;
}
 
.text-field-wrapper .attr-text {
  font-size: var(--type-body-xs-size);
  color: var(--color-secondary);
  text-align: right;
}
`;
