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

  // Public API methods
  addTemplate(template) {
    if (template) {
      this.templates = [...this.templates, template];
      this.selectedTemplate = template;
      this.requestUpdate();
      return true;
    }
    return false;
  }

  deleteTemplate(template) {
    if (!template) return false;
    this.templates = this.templates.filter((t) => t !== template);
    if (this.selectedTemplate === template) {
      this.selectedTemplate = null;
      // Notify parent component about template deselection
      this.dispatchEvent(new CustomEvent('template-select', {
        detail: { template: null },
        bubbles: true,
        composed: true,
      }));
    }
    this.requestUpdate();
    return true;
  }

  selectTemplate(template) {
    this.selectedTemplate = template;
    this.requestUpdate();
    return true;
  }

  getSelectedTemplate() {
    return this.selectedTemplate;
  }

  getTemplates() {
    return this.templates;
  }

  handleTemplateSelect(template) {
    this.selectTemplate(template);
    // Still dispatch event for backward compatibility
    this.dispatchEvent(new CustomEvent('template-select', {
      detail: { template },
      bubbles: true,
      composed: true,
    }));
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
    if (this.deleteTemplate(template)) {
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
    }
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
                <sp-action-button @click=${() => {
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
