import { LIBS } from '../../scripts/scripts.js';
import { style } from './rsvp-form.css.js';

const { LitElement, html, repeat } = await import(`${LIBS}/deps/lit-all.min.js`);

function convertString(input) {
  const parts = input.replace(/([a-z])([A-Z])/g, '$1 $2');
  const result = parts.toUpperCase();

  return result;
}

export default class RsvpForm extends LitElement {
  static properties = {
    data: { type: Array },
    formType: { type: String },
  };

  constructor() {
    super();
    this.data = [];
    this.formType = 'basic';
  }

  static styles = style;

  renderBasicForm() {
    const data = this.data.filter((f) => f.Required !== 'x' && f.Type !== 'submit');

    return html`
      <div class="rsvp-checkboxes">
        <table class="field-config-table">
          <thead>
            <tr class="table-header-row">
              <td class="table-heading">FIELD CATEGORIES</td>
              <td class="table-heading">INCLUDE ON FORM</td>
              <td class="table-heading">MAKE IT REQUIRED</td>
            </tr>
          </thead>
          <tbody>
            ${repeat(data, (item) => item.Field, (item) => html`<tr class="field-row">
              <td><div class="cat-text">${convertString(item.Field)}</div></td>
              <td>
                <sp-switch class="check-appear" name=${item.Field}>Appears on form</sp-switch>
              </td>
              <td>
                <sp-switch class="check-require" name=${item.Field}>Required field</sp-switch>
              </td>
            </tr>`)}
          </tbody>
        </table>
      </div>
    `;
  }

  renderMarketoForm() {
    return html`
        <div class="rsvp-checkboxes">
        <sp-field-label size="xl">Campaign ID *</sp-field-label>
        <sp-textfield @change=${(event) => {console.log(event)}} ></sp-textfield>
        </div>
        `;
  }

  renderForm() {
    if (this.formType === 'basic') {
      return this.renderBasicForm();
    }
    return this.renderMarketoForm();
  }

  render() {
    return html`
      <div class="rsvp-form">
      <fieldset class="form-type" @change=${(e) => { this.formType = e.target.value; }} >
    <input type="radio" id="basic" name="drone" value="basic" ?checked=${this.formType === 'basic'}/>
    <label for="basic">Basic form</label>
    <input type="radio" id="marketo" name="drone" value="marketo" ?checked=${this.formType === 'marketo'} />
    <label for="marketo">Marketo</label>
</fieldset>
      </div>
      ${this.renderForm()}
    `;
  }
}

/* <tr class="field-row">
              <td><div class="cat-text">MOBILE PHONE</div></td>
              <td>
                <sp-switch class="check-appear" name="mobilePhone">Appears on form</sp-switch>
              </td>
              <td>
                <sp-switch class="check-require" name="mobilePhone">Required field</sp-switch>
              </td>
            </tr>
            <tr class="field-row">
              <td><div class="cat-text">INDUSTRY</div></td>
              <td>
                <sp-switch class="check-appear" name="industry">Appears on form</sp-switch>
              </td>
              <td>
                <sp-switch class="check-require" name="industry">Required field</sp-switch>
              </td>
            </tr>
            <tr class="field-row">
              <td><div class="cat-text">PRODUCTS OF INTEREST</div></td>
              <td>
                <sp-switch class="check-appear" name="productsOfInterest">Appears on form</sp-switch>
              </td>
              <td>
                <sp-switch class="check-require" name="productsOfInterest">Required field</sp-switch>
              </td>
            </tr>
            <tr class="field-row">
              <td><div class="cat-text">COMPANY SIZE</div></td>
              <td>
                <sp-switch class="check-appear" name="companySize">Appears on form</sp-switch>
              </td>
              <td>
                <sp-switch class="check-require" name="companySize">Required field</sp-switch>
              </td>
            </tr>
            <tr class="field-row">
              <td><div class="cat-text">AGE</div></td>
              <td>
                <sp-switch class="check-appear" name="age">Appears on form</sp-switch>
              </td>
              <td>
                <sp-switch class="check-require" name="age">Required field</sp-switch>
              </td>
            </tr>
            <tr class="field-row">
              <td><div class="cat-text">JOB LEVEL</div></td>
              <td>
                <sp-switch class="check-appear" name="jobLevel">Appears on form</sp-switch>
              </td>
              <td>
                <sp-switch class="check-require" name="jobLevel">Required field</sp-switch>
              </td>
            </tr> */
