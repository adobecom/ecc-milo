import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
:host {
  display: flex;
  align-items: center;
  gap: 16px;
}
.agenda-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 42px;
}

.field-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.time-picker {
  display: flex;
  align-items: center;
  gap: 16px;
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
  background-image: url('/ecc/icons/clock.svg');
  background-repeat: no-repeat;
  background-position: center;
  width: 32px;
  height: 16px;
}
 
.time-picker .time-picker-wrapper {
  flex: 1;
  min-width: 150px;
  display: flex;
  gap: 8px;
}

.time-picker .time-picker-wrapper sp-picker.period-picker-input {
  width: max-content;
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

@media screen and (min-width: 900px) {
  .field-container {
    flex-direction: row;
    align-items: center;
    gap: 32px;
  }
}
`;
