/* eslint-disable indent */
/* eslint-disable max-len */
import { LIBS } from '../../scripts/scripts.js';
import style from './cmc.css.js';
import { getIcon } from '../../scripts/utils.js';
import { getCloud, updateCloud } from '../../scripts/esp-controller.js';
import { deepGetTagByPath, deepGetTagByTagID } from '../../scripts/caas.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

const traversalBase = '/content/cq:tags/caas';
const startingPath = '';
const addSvg = html`<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18"><defs><style>.fill-shaded {fill: #464646;}</style></defs><title>S Add 18 N</title><rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" /><path class="fill-shaded" d="M14.5,8H10V3.5A.5.5,0,0,0,9.5,3h-1a.5.5,0,0,0-.5.5V8H3.5a.5.5,0,0,0-.5.5v1a.5.5,0,0,0,.5.5H8v4.5a.5.5,0,0,0,.5.5h1a.5.5,0,0,0,.5-.5V10h4.5a.5.5,0,0,0,.5-.5v-1A.5.5,0,0,0,14.5,8Z" /></svg>`;
const checkSvg = html`<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18"><defs><style>.fill-white {fill: #ffffff;}</style></defs><title>S Checkmark 18 N</title><rect id="Canvas" fill="#ffffff" opacity="0" width="18" height="18" /><path class="fill-white" d="M15.656,3.8625l-.7275-.5665a.5.5,0,0,0-.7.0875L7.411,12.1415,4.0875,8.8355a.5.5,0,0,0-.707,0L2.718,9.5a.5.5,0,0,0,0,.707l4.463,4.45a.5.5,0,0,0,.75-.0465L15.7435,4.564A.5.5,0,0,0,15.656,3.8625Z" /></svg>`;

export default class CloudManagementConsole extends LitElement {
  static styles = style;

  static properties = {
    clouds: { type: Array },
    currentCloud: { type: String },
    tags: { type: Object },
    currentPath: { type: String },
    selectedTags: { type: Set },
    savedTags: { type: Object },
    langs: { type: Array },
    selectedLocales: { type: Set },
    savedLocales: { type: Object },
    pendingChanges: { type: Boolean },
    toastState: { type: Object },
    config: { type: Object },
  };

  constructor() {
    super();
    this.currentCloud = '';
    this.tags = {};
    this.locales = {};
    this.savedLocales = {};
    this.currentPath = startingPath;
    this.selectedTags = new Set();
    this.selectedLocales = new Set();
    this.pendingChanges = false;
    this.config = { 'series-dashboard-location': '/ecc/dashboard/t3/series' };
  }

  firstUpdated() {
    this.toast = this.shadowRoot.querySelector('sp-toast');
  }

  static getParsedTitle(tag) {
    const { title } = tag;

    if (!title) return nothing;

    const textarea = document.createElement('textarea');
    textarea.innerHTML = title;

    return html`<span>${textarea.value}</span>`;
  }

  static getChevRight() {
    return html`${getIcon('chev-right')}`;
  }

  togglePendingChanges() {
    const hasTagChanges = JSON.stringify(Array.from(this.selectedTags.values())) !== JSON.stringify(this.savedTags[this.currentCloud]);
    const hasLocaleChanges = JSON.stringify(Array.from(this.selectedLocales.values())) !== JSON.stringify(this.savedLocales[this.currentCloud]);

    this.pendingChanges = hasTagChanges || hasLocaleChanges;
  }

  handleTagSelect(tag) {
    if (this.selectedTags.has(tag)) {
      this.selectedTags.delete(tag);
    } else {
      this.selectedTags.add(tag);
    }

    this.togglePendingChanges();

    this.requestUpdate();
  }

  handleItemClick(e, tag) {
    if (e.target.tagName === 'SP-CHECKBOX') return;

    if (!tag.tags || !Object.keys(tag.tags).length) {
      this.handleTagSelect(tag);
    } else {
      const { path } = tag;
      const trimmedPath = path.replace(traversalBase, '');
      this.currentPath = trimmedPath;
    }

    this.requestUpdate();
  }

  handleItemCheck(tag) {
    this.handleTagSelect(tag);
    this.requestUpdate();
  }

  determineCheckboxState(tag) {
    // if selectedTags has tag.tagID, return checked
    if (this.selectedTags.has(tag)) {
      return html`<sp-checkbox checked @click=${() => this.handleItemCheck(tag)}/>`;
    }

    // if currentPath starts with the tag tr, return indeterminate
    const trimmedPathSegments = tag.path.replace(traversalBase, '').split('/');
    if ([...this.selectedTags].some((t) => {
      const { path } = t;
      const trimmedSelectedTagPathSegments = path.replace(traversalBase, '').split('/');

      return trimmedPathSegments.every((segment, i) => trimmedSelectedTagPathSegments[i] === segment);
    })) {
      return html`<sp-checkbox indeterminate @click=${() => this.handleItemCheck(tag)}/>`;
    }

    return html`<sp-checkbox @click=${() => this.handleItemCheck(tag)}/>`;
  }

  buildItem(tag) {
    const { tags, tagID } = tag;
    const currentPathSegments = `${traversalBase}${this.currentPath}`.split('/');
    const tagPathSegments = tag.path.split('/');

    return html`
      <div class="menu-item" aria-selected="${tagPathSegments.every((segment) => currentPathSegments.includes(segment))}" data-tagid=${tagID} @click=${(e) => this.handleItemClick(e, tag)}>
        <div class="menu-item-inner">
          ${this.determineCheckboxState(tag)}
          ${this.constructor.getParsedTitle(tag)}
        </div>
        ${tags && Object.keys(tags).length ? this.constructor.getChevRight() : ''}
      </div>
    `;
  }

  buildDeleteBtn(tag) {
    const crossIcon = getIcon('cross');
    const btnHTML = html`${crossIcon}`;

    crossIcon.addEventListener('click', () => {
      this.selectedTags.delete(tag);
      this.togglePendingChanges();
      this.requestUpdate();
    });

    return btnHTML;
  }

  getSelectedTags() {
    return Array.from(this.selectedTags);
  }

  switchCloudType(cloudType) {
    if (cloudType === this.currentCloud) return;
    const savedCloudTags = this.savedTags[cloudType] || [];
    const savedCloudLocales = this.savedLocales[cloudType] || [];

    this.currentCloud = cloudType;
    this.selectedTags = new Set(savedCloudTags.map((tag) => deepGetTagByTagID(tag.tagID, this.tags)));
    this.selectedLocales = new Set(savedCloudLocales.filter((locale) => {
      const [key] = Object.entries(this.locales).find(([ietf]) => ietf === locale);
      return key;
    }));
    this.togglePendingChanges();

    this.requestUpdate();
  }

  resetForm() {
    const fullSavedTags = this.savedTags[this.currentCloud]?.map((tag) => deepGetTagByTagID(tag.tagID, this.tags)) || [];
    this.selectedTags = new Set(fullSavedTags);
    this.selectedLocales = new Set(this.savedLocales[this.currentCloud] || []);
    this.togglePendingChanges();
  }

  async save() {
    this.savedTags[this.currentCloud] = this.getSelectedTags();
    this.savedLocales[this.currentCloud] = this.selectedLocales;

    this.togglePendingChanges();

    const cloudData = await getCloud(this.currentCloud);

    const locales = Array.from(this.selectedLocales).map((locale) => locale);

    const payload = {
      cloudTags: this.getSelectedTags().map((tag) => ({
        caasId: tag.tagID,
        name: tag.title,
      })),
      locales,
    };

    const newCloudData = await updateCloud(this.currentCloud, { ...cloudData, ...payload });

    if (newCloudData && !newCloudData.error) {
      if (this.toast) this.toast.open = true;
    }
  }

  render() {
    return html`
    <div class="form-container">
      <div class="header">
        <div>
          <h1>Manage Clouds</h1>
          <div class="change-status">
            ${html`${this.pendingChanges
          ? html`<span class="status" size="s">${html`${getIcon('dot-orange')}`} Unsaved change</span>`
          : html`<span class="status" size="s">${html`${getIcon('dot-green')}`} Up-to-date</span>`}`}
          </div>
        </div>

        <div>
          <a href="${this.config['series-dashboard-location']}" class="back-button">${getIcon('left-arrow-wire')}Back to Series dashboard</a>
        </div>
      </div>

      <div class="picker-container">
        <sp-picker class="cloud-type-picker" @change=${(e) => this.switchCloudType(e.target.value)} label="Selected a Cloud type">
          <sp-menu>
            ${repeat(this.clouds.values(), (cloud) => html`
              <sp-menu-item value="${cloud.cloudType}" ?active=${this.currentCloud === cloud.cloudType}>${cloud.cloudName}</sp-menu-item>
            `)}
          </sp-menu>
        </sp-picker>
      </div>

      ${this.currentCloud ? html`
              <div class="tag-manager form-section">
        <h1>Manage tags</h1>
        <div class="pool">
          <div class="tags">
            ${repeat(this.selectedTags.values(), (tag) => {
              const decodedTitle = new DOMParser().parseFromString(tag.title, 'text/html').body.textContent;

              return html`
                <a class="tag" >${decodedTitle}${this.buildDeleteBtn(tag)}</a>
              `;
            })}
          </div>
        </div>

        <h3>Select tags</h3>
        <div class="millar-menu">
          <div class="menu-group">
            ${this.currentPath.split('/').map((_p, i, arr) => {
            const tag = deepGetTagByPath(arr, i, this.tags);

            if (tag && tag.tags && Object.keys(tag.tags).length) {
              return html`
                      <div class="menu">
                        ${repeat(Object.entries(tag.tags), ([, value]) => this.buildItem(value))}
                      </div>
                        `;
            }

            return nothing;
          })}
          </div>
                    <div class="menu-breadcrumbs">
            ${this.currentPath.split('/').map((path, i, arr) => {
            const tag = deepGetTagByPath(arr, i);

            if (tag) {
              return html`
                        <a @click=${() => { this.currentPath = arr.slice(0, i + 1).join('/'); }}>
                          ${i === 0 ? getIcon('home-wire') : tag.title}
                        </a>
                        ${i < arr.length - 1 ? this.constructor.getChevRight() : nothing}
                      `;
            }

            return nothing;
          })}
          </div>
        </div>
      </div>

      <div class="lang-manager form-section">
        <h1>Languages</h1>

        <div class="pool">
          <div class="langs">
            ${repeat(Object.entries(this.locales), ([key, value]) => html`
              <sp-action-button class="lang-btn" toggles ?selected=${this.selectedLocales.has(key)} @change=${() => {
                if (this.selectedLocales.has(key)) {
                  this.selectedLocales.delete(key);
                } else {
                  this.selectedLocales.add(key);
                }

                this.togglePendingChanges();
                this.requestUpdate();
              }}>
                <sp-icon size="s" slot="icon">${this.selectedLocales.has(key) ? checkSvg : addSvg}</sp-icon>
                ${value}
              </sp-action-button>
            `)}
          </div>
        </div>
      </div>
      ` : nothing}

    </div>
    <div class="action-bar">
        <sp-toast variant="positive" size="m" timeout="6000">Changes saved</sp-toast>
        <sp-button variant="secondary" size="l" ?disabled=${!this.pendingChanges || !this.currentCloud} @click=${this.resetForm}>Cancel</sp-button>
        <sp-button variant="primary" size="l" ?disabled=${!this.pendingChanges || !this.currentCloud} @click=${this.save}>Save</sp-button>
    </div>
    `;
  }
}
