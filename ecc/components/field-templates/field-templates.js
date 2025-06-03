import { LIBS } from '../../scripts/scripts.js';
import style from './field-templates.css.js';
import { getIcon } from '../../scripts/utils.js';

const { LitElement, html, repeat, render } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class FieldTemplates extends LitElement {
  static styles = style;

  static properties = {
    templates: { type: Array },
    selectedTemplate: { type: Object },
    searchQuery: { type: String },
    fields: { type: Array },
    spTheme: { type: Object },
  };

  constructor() {
    super();
    this.templates = [];
    this.selectedTemplate = null;
    this.searchQuery = '';
    this.fields = [];
    this.spTheme = null;
  }

  handleTemplateSelect(template) {
    this.selectedTemplate = template;
    this.dispatchEvent(new CustomEvent('template-select', {
      detail: { template },
      bubbles: true,
      composed: true,
    }));
  }

  handleTemplateSave(event) {
    event.preventDefault();
    if (!this.spTheme) return;

    const underlay = this.spTheme.querySelector('sp-underlay');
    const dialog = this.spTheme.querySelector('sp-dialog');

    // Clear any existing content
    dialog.innerHTML = '';

    // Create the dialog content
    const heading = document.createElement('h1');
    heading.setAttribute('slot', 'heading');
    heading.textContent = 'Save Template';
    dialog.appendChild(heading);

    const dialogContent = html`
      <div style="margin-bottom: 16px">
        <sp-textfield
          placeholder="Enter template name"
          style="width: 100%"
        ></sp-textfield>
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
    const templateName = dialog.querySelector('sp-textfield').value.trim();
    if (templateName) {
      // Create a deep copy of fields with preserved ordinal values
      const fieldsWithOrdinals = this.fields.map((field) => ({
        ...field,
        values: field.type === 'list' && field.values
          ? field.values.map((value, index) => ({
            ...value,
            ordinal: index,
          }))
          : field.values,
      }));

      const newTemplate = {
        name: templateName,
        fields: fieldsWithOrdinals,
        createdAt: new Date().toISOString(),
      };

      this.templates = [...this.templates, newTemplate];
      this.requestUpdate();

      const toastContent = html`
                <sp-toast
                  variant="positive"
                  size="m"
                  timeout="6000"
                  open
                  @close=${(e) => e.target.remove()}
                >Template saved successfully</sp-toast>
              `;

      render(toastContent, this.spTheme);

      underlay.open = false;
      dialog.innerHTML = '';
    }
  }}
        >Save</sp-button>
      </div>
    `;

    // Create a container for the dialog content
    const contentContainer = document.createElement('div');
    dialog.appendChild(contentContainer);
    render(dialogContent, contentContainer);
    underlay.open = true;
  }

  handleTemplateDelete(template) {
    if (!this.spTheme) return;

    const underlay = this.spTheme.querySelector('sp-underlay');
    const dialog = this.spTheme.querySelector('sp-dialog');

    // Clear any existing content
    dialog.innerHTML = '';

    // Create the dialog content
    const heading = document.createElement('h1');
    heading.setAttribute('slot', 'heading');
    heading.textContent = 'Delete Template';
    dialog.appendChild(heading);

    const dialogContent = html`
      <p>Are you sure you want to delete "${template.name}"?</p>
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
          variant="negative"
          slot="button"
          @click=${() => {
    this.templates = this.templates.filter((t) => t !== template);
    if (this.selectedTemplate === template) {
      this.selectedTemplate = null;
    }
    this.requestUpdate();

    const toastContent = html`
              <sp-toast
                variant="positive"
                size="m"
                timeout="6000"
                open
                @close=${(e) => e.target.remove()}
              >Template deleted successfully</sp-toast>
            `;

    render(toastContent, this.spTheme);

    underlay.open = false;
    dialog.innerHTML = '';
  }}
        >Delete</sp-button>
      </div>
    `;

    // Create a container for the dialog content
    const contentContainer = document.createElement('div');
    dialog.appendChild(contentContainer);
    render(dialogContent, contentContainer);
    underlay.open = true;
  }

  handleSearch(e) {
    this.searchQuery = e.target.value.toLowerCase();
    this.requestUpdate();
  }

  get filteredTemplates() {
    return this.templates.filter((tmplt) => tmplt.name.toLowerCase().includes(this.searchQuery));
  }

  render() {
    return html`
      <div class="templates-container">
        <div class="templates-header">
          <h2>Field Templates</h2>
          <sp-button variant="primary" size="m" @click=${(e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleTemplateSave(e);
          }}>
            Save as new template
          </sp-button>
        </div>

        <div class="search-container">
          <sp-textfield
            placeholder="Search templates..."
            value=${this.searchQuery}
            @input=${this.handleSearch}
          ></sp-textfield>
        </div>

        <div class="templates-list">
          ${repeat(this.filteredTemplates, (template) => template.name, (template) => html`
            <div class="template-item ${this.selectedTemplate === template ? 'selected' : ''}"
                 @click=${() => this.handleTemplateSelect(template)}>
              <div class="template-info">
                <span class="template-name">${template.name}</span>
                <span class="template-date">${new Date(template.createdAt).toLocaleDateString()}</span>
              </div>
              <div class="template-actions">
                <sp-action-button @click=${(e) => {
    e.stopPropagation();
    this.handleTemplateDelete(template);
  }}>
                  ${getIcon('delete-wire-round')}
                </sp-action-button>
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }
}
