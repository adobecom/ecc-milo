import { LIBS } from '../../scripts/scripts.js';
import style from './field-management-table.css.js';
import { getIcon } from '../../scripts/utils.js';

const { LitElement, html, repeat, render } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class FieldManagementTable extends LitElement {
  static styles = style;

  static properties = {
    config: { type: Object },
    fields: { type: Array },
    pendingChanges: { type: Boolean },
    toastState: { type: Object },
  };

  constructor() {
    super();
    this.fields = [];
    this.pendingChanges = false;
    this.config = {};
  }

  firstUpdated() {
    this.toast = this.shadowRoot.querySelector('sp-toast');
    // Load initial fields from mock-fields.json
    this.loadFields();
  }

  async loadFields() {
    try {
      const response = await fetch('/ecc/components/rsvp-form/mock-fields.json');
      const data = await response.json();
      this.fields = data[0].localization['en-US'].map((field, index) => ({
        ...field,
        ordinal: index,
      }));
      this.requestUpdate();
    } catch (error) {
      window.lana?.log(`Error loading fields: ${JSON.stringify(error)}`);
    }
  }

  togglePendingChanges() {
    // Implement change detection logic here
    this.pendingChanges = true;
    this.requestUpdate();
  }

  handleFieldEdit(field) {
    const spTheme = this.closest('sp-theme');
    if (!spTheme) return;

    const underlay = spTheme.querySelector('sp-underlay');
    const dialog = spTheme.querySelector('sp-dialog');

    // Clear any existing content
    dialog.innerHTML = '';

    // Create the dialog content
    const heading = document.createElement('h1');
    heading.setAttribute('slot', 'heading');
    heading.textContent = 'Edit Field';
    dialog.appendChild(heading);

    const dialogContent = html`
      <div class="form-container">
        <div class="field-container">
          <sp-field-label size="l">Field Name</sp-field-label>
          <sp-textfield
            value=${field.name}
            style="width: 100%"
            required
          ></sp-textfield>
        </div>

        <div class="field-container">
          <sp-field-label size="l">Field Type</sp-field-label>
          <sp-textfield
            value=${field.type}
            style="width: 100%"
            disabled
          ></sp-textfield>
        </div>

        <div class="field-container inline">
          <sp-field-label size="l">Mandatory Field (Must be included in RSVP forms using this template)</sp-field-label>
          <sp-switch ?checked=${field.mandatory}></sp-switch>
        </div>

        <div class="field-container">
          <sp-field-label size="l">Placeholder Text</sp-field-label>
          <sp-textfield
            value=${field.placeholder || ''}
            style="width: 100%"
          ></sp-textfield>
        </div>

        ${field.type === 'list' ? html`
          <div class="field-container">
            <sp-field-label size="l">List Options</sp-field-label>
            ${(field.values || []).map((option) => html`
              <div class="option-row">
                <div class="option-row-container">
                  <div class="option-row-container-item">
                    <sp-field-label size="l">Option Value</sp-field-label>
                    <sp-textfield
                      value=${option.value}
                      placeholder="Option value"
                    ></sp-textfield>
                  </div>
                  <div class="option-row-container-item">
                    <sp-field-label size="l">Option Label</sp-field-label>
                    <sp-textfield
                      value=${option.label}
                      placeholder="Option label"
                    ></sp-textfield>
                  </div>
                </div>
                <sp-action-button variant="negative" @click=${(e) => e.target.closest('.option-row').remove()}>
                  ${getIcon('delete-wire-round')}
                </sp-action-button>
              </div>
            `)}
            <sp-button
              variant="secondary"
              size="m"
              @click=${() => {
    const optionRow = document.createElement('div');
    optionRow.className = 'option-row';
    optionRow.innerHTML = `
                  <div class="option-row-container">
                    <div class="option-row-container-item">
                      <sp-field-label size="l">Option Value</sp-field-label>
                      <sp-textfield placeholder="Option value"></sp-textfield>
                    </div>
                    <div class="option-row-container-item">
                      <sp-field-label size="l">Option Label</sp-field-label>
                      <sp-textfield placeholder="Option label"></sp-textfield>
                    </div>
                  </div>
                  <sp-action-button variant="negative">${getIcon('delete-wire-round')}</sp-action-button>
                `;
    optionRow.querySelector('sp-action-button').addEventListener('click', () => optionRow.remove());
    dialog.querySelector('.field-container:last-child').appendChild(optionRow);
  }}
            >Add Option</sp-button>
          </div>
        ` : ''}

        <div class="button-container">
          <sp-button variant="secondary" slot="button" @click=${() => {
    underlay.open = false;
    dialog.innerHTML = '';
  }}>Cancel</sp-button>
          <sp-button variant="primary" slot="button" @click=${() => {
    // Update field properties
    field.name = dialog.querySelector('sp-textfield').value;
    field.mandatory = dialog.querySelector('sp-switch').checked;
    field.placeholder = dialog.querySelectorAll('sp-textfield')[2].value;

    if (field.type === 'list') {
      const optionRows = dialog.querySelectorAll('.option-row');
      field.values = Array.from(optionRows).map((row, index) => {
        const [valueInput, labelInput] = row.querySelectorAll('sp-textfield');
        return {
          value: valueInput.value,
          label: labelInput.value,
          ordinal: index,
        };
      });
    }

    this.togglePendingChanges();
    underlay.open = false;
    dialog.innerHTML = '';
  }}>Save Changes</sp-button>
        </div>
      </div>
    `;

    // Create a container for the dialog content
    const contentContainer = document.createElement('div');
    dialog.appendChild(contentContainer);
    render(dialogContent, contentContainer);
    underlay.open = true;
  }

  handleFieldDelete(field) {
    const spTheme = this.closest('sp-theme');
    if (!spTheme) return;

    const underlay = spTheme.querySelector('sp-underlay');
    const dialog = spTheme.querySelector('sp-dialog');

    // Clear any existing content
    dialog.innerHTML = '';

    // Create the dialog content
    const heading = document.createElement('h2');
    heading.setAttribute('slot', 'heading');
    heading.textContent = 'Delete Field';
    dialog.appendChild(heading);

    const dialogContent = html`
      <p>Are you sure you want to delete "${field.name}"? This cannot be undone.</p>
      <div class="button-container">
        <sp-button variant="secondary" slot="button" @click=${() => {
    this.fields = this.fields.filter((f) => f.name !== field.name);
    this.togglePendingChanges();
    underlay.open = false;
    dialog.innerHTML = '';
  }}>Yes, delete this field</sp-button>
        <sp-button variant="cta" slot="button" @click=${() => {
    underlay.open = false;
    dialog.innerHTML = '';
  }}>Do not delete</sp-button>
      </div>
    `;

    // Create a container for the dialog content
    const contentContainer = document.createElement('div');
    dialog.appendChild(contentContainer);
    render(dialogContent, contentContainer);
    underlay.open = true;
  }

  handleFieldAdd() {
    const spTheme = this.closest('sp-theme');
    if (!spTheme) return;

    const underlay = spTheme.querySelector('sp-underlay');
    const dialog = spTheme.querySelector('sp-dialog');

    // Clear any existing content
    dialog.innerHTML = '';

    // Create the dialog content
    const heading = document.createElement('h1');
    heading.setAttribute('slot', 'heading');
    heading.textContent = 'Add New Field';
    dialog.appendChild(heading);

    const dialogContent = html`
      <div class="form-container">
        <div class="field-container">
          <sp-field-label size="l">Field Name</sp-field-label>
          <sp-textfield
            placeholder="Enter field name"
            style="width: 100%"
            required
          ></sp-textfield>
        </div>

        <div class="field-container">
          <sp-field-label size="l">Field Type</sp-field-label>
          <sp-picker
            style="width: 100%"
            @change=${(e) => {
    const type = e.target.value;
    const listOptionsContainer = dialog.querySelector('.list-options-container');
    if (listOptionsContainer) {
      listOptionsContainer.style.display = type === 'list' ? 'block' : 'none';
    }
  }}
          >
            <sp-menu-item value="text">Text</sp-menu-item>
            <sp-menu-item value="number">Number</sp-menu-item>
            <sp-menu-item value="email">Email</sp-menu-item>
            <sp-menu-item value="tel">Phone</sp-menu-item>
            <sp-menu-item value="list">List</sp-menu-item>
          </sp-picker>
        </div>

        <div class="field-container inline">
          <sp-field-label size="l">Mandatory Field</sp-field-label>
          <sp-switch></sp-switch>
        </div>

        <div class="field-container">
          <sp-field-label size="l">Placeholder Text</sp-field-label>
          <sp-textfield
            placeholder="Enter placeholder text"
            style="width: 100%"
          ></sp-textfield>
        </div>

        <div class="field-container list-options-container" style="display: none;">
          <sp-field-label size="l">List Options</sp-field-label>
          <div class="list-options">
            <div class="option-row">
              <div class="option-row-container">
                <div class="option-row-container-item">
                  <sp-field-label size="l">Option Value</sp-field-label>
                  <sp-textfield placeholder="Option value"></sp-textfield>
                </div>
                <div class="option-row-container-item">
                  <sp-field-label size="l">Option Label</sp-field-label>
                  <sp-textfield placeholder="Option label"></sp-textfield>
                </div>
              </div>
              <sp-action-button variant="negative" @click=${(e) => e.target.closest('.option-row').remove()}>
                ${getIcon('delete-wire-round')}
              </sp-action-button>
            </div>
          </div>
          <sp-button
            variant="secondary"
            size="m"
            @click=${() => {
    const optionRow = document.createElement('div');
    optionRow.className = 'option-row';
    optionRow.innerHTML = `
                <div class="option-row-container">
                  <div class="option-row-container-item">
                    <sp-field-label size="l">Option Value</sp-field-label>
                    <sp-textfield placeholder="Option value"></sp-textfield>
                  </div>
                  <div class="option-row-container-item">
                    <sp-field-label size="l">Option Label</sp-field-label>
                    <sp-textfield placeholder="Option label"></sp-textfield>
                  </div>
                </div>
                <sp-action-button variant="negative">${getIcon('delete-wire-round')}</sp-action-button>
              `;
    optionRow.querySelector('sp-action-button').addEventListener('click', () => optionRow.remove());
    dialog.querySelector('.list-options').appendChild(optionRow);
  }}
          >Add Option</sp-button>
        </div>

        <div class="button-container">
          <sp-button
            variant="secondary"
            slot="button"
            @click=${() => {
    underlay.open = false;
    dialog.innerHTML = '';
  }}
          >Cancel</sp-button>
          <sp-button
            variant="primary"
            slot="button"
            @click=${() => {
    const name = dialog.querySelector('sp-textfield').value.trim();
    const type = dialog.querySelector('sp-picker').value;
    const mandatory = dialog.querySelector('sp-switch').checked;
    const placeholder = dialog.querySelectorAll('sp-textfield')[1].value.trim();

    if (name) {
      const newField = {
        name,
        type,
        placeholder,
        mandatory,
        ordinal: this.fields.length,
      };

      if (type === 'list') {
        const optionRows = dialog.querySelectorAll('.option-row');
        newField.values = Array.from(optionRows).map((row, index) => {
          const [valueInput, labelInput] = row.querySelectorAll('sp-textfield');
          return {
            value: valueInput.value,
            label: labelInput.value,
            ordinal: index,
          };
        });
      }

      this.fields = [...this.fields, newField];
      this.togglePendingChanges();
      underlay.open = false;
      dialog.innerHTML = '';
    }
  }}
          >Add Field</sp-button>
        </div>
      </div>
    `;

    // Create a container for the dialog content
    const contentContainer = document.createElement('div');
    dialog.appendChild(contentContainer);
    render(dialogContent, contentContainer);
    underlay.open = true;
  }

  handleTemplateSelect(e) {
    const { template } = e.detail;
    if (template) {
      this.fields = template.fields.map((field, index) => ({
        ...field,
        ordinal: index,
      }));
      this.togglePendingChanges();
    }
  }

  showToast(message, variant = 'positive') {
    const spTheme = this.closest('sp-theme');
    if (!spTheme) return;

    const toastContent = html`
      <sp-toast
        variant=${variant}
        size="m"
        timeout="6000"
        open
        @close=${(e) => e.target.remove()}
      >${message}</sp-toast>
    `;

    render(toastContent, spTheme);
  }

  async save() {
    // Implement save logic here
    this.showToast('Changes saved successfully');
    this.pendingChanges = false;
    this.requestUpdate();
  }

  resetForm() {
    this.loadFields();
    this.pendingChanges = false;
  }

  render() {
    return html`
      <div class="form-container">
        <div class="header">
          <div>
            <h1>RSVP Form Management</h1>
            <div class="change-status">
              ${this.pendingChanges
    ? html`<span class="status" size="s">${getIcon('dot-orange')} Unsaved changes</span>`
    : html`<span class="status" size="s">${getIcon('dot-green')} Up-to-date</span>`}
            </div>
          </div>
        </div>

        <div class="content">
          <field-templates
            @template-select=${this.handleTemplateSelect}
            .fields=${this.fields}
            .spTheme=${this.closest('sp-theme')}
          ></field-templates>

          <div class="form-section">
            <div class="section-header">
              <h2>Form Fields</h2>
              <div class="button-container">
                <sp-button variant="secondary" size="m" ?disabled=${!this.pendingChanges} @click=${this.resetForm}>
                  Cancel
                </sp-button>
                <sp-button variant="primary" size="m" ?disabled=${!this.pendingChanges} @click=${this.save}>
                  Save
                </sp-button>
                <span class="divider"></span>
                <sp-button variant="primary" size="m" @click=${this.handleFieldAdd}>
                  Add Field
                </sp-button>
              </div>  
            </div>

            <div class="fields-table">
              <table>
                <thead>
                  <tr>
                    <th>Field Name</th>
                    <th>Type</th>
                    <th>Mandatory</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${repeat(this.fields, (field) => field.name, (field) => html`
                    <tr class="field-row">
                      <td>${field.name}</td>
                      <td>${field.type}</td>
                      <td>
                        <sp-switch
                          ?checked=${field.mandatory}
                          @change=${(e) => {
    field.mandatory = e.target.checked;
    this.togglePendingChanges();
  }}
                        ></sp-switch>
                      </td>
                      <td>
                        <div class="actions">
                          <sp-action-button @click=${() => this.handleFieldEdit(field)}>
                            ${getIcon('edit-pencil')}
                          </sp-action-button>
                          <sp-action-button @click=${() => this.handleFieldDelete(field)}>
                            ${getIcon('delete-wire-round')}
                          </sp-action-button>
                        </div>
                      </td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
