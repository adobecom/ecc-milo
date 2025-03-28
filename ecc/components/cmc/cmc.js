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

export default class CloudManagementConsole extends LitElement {
  static styles = style;

  static properties = {
    clouds: { type: Array },
    currentCloud: { type: String },
    tags: { type: Object },
    currentPath: { type: String },
    selectedTags: { type: Set },
    savedTags: { type: Object },
    pendingChanges: { type: Boolean },
    toastState: { type: Object },
    config: { type: Object },
  };

  constructor() {
    super();
    this.currentCloud = '';
    this.tags = {};
    this.currentPath = startingPath;
    this.selectedTags = new Set();
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

  handleTagSelect(tag) {
    if (this.selectedTags.has(tag)) {
      this.selectedTags.delete(tag);
    } else {
      this.selectedTags.add(tag);
    }

    const selectedTags = Array.from(this.selectedTags).map((t) => t.tagID);
    const savedCloudTags = this.savedTags[this.currentCloud] || [];
    this.pendingChanges = JSON.stringify(selectedTags) !== JSON.stringify(savedCloudTags);

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
      this.pendingChanges = true;
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

    this.currentCloud = cloudType;
    this.currentPath = startingPath;
    this.selectedTags = new Set(savedCloudTags.map((tag) => deepGetTagByTagID(tag.tagID, this.tags)));
    this.pendingChanges = false;
    this.requestUpdate();
  }

  async save() {
    this.savedTags[this.currentCloud] = this.getSelectedTags();
    this.pendingChanges = false;

    const cloudData = await getCloud(this.currentCloud);

    // translate tagID to caasId, and title to name, and save to cloudData
    const payload = {
      cloudTags: this.getSelectedTags().map((tag) => ({
        caasId: tag.tagID,
        name: tag.title,
      })),
    };

    const newCloudData = await updateCloud(this.currentCloud, { ...cloudData, ...payload });

    if (newCloudData && !newCloudData.error) {
      if (this.toast) this.toast.open = true;
    }
  }

  render() {
    return html`
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
    <div class="tag-manager">
      <sp-picker class="cloud-type-picker" @change=${(e) => this.switchCloudType(e.target.value)} label="Selected a Cloud type">
        <sp-menu>
          ${repeat(this.clouds.values(), (cloud) => html`
            <sp-menu-item value="${cloud.cloudType}" ?active=${this.currentCloud === cloud.cloudType}>${cloud.cloudName}</sp-menu-item>
          `)}
        </sp-menu>
      </sp-picker>

      <h2>Cloud tags</h2>

      <div class="tags-pool">
        <div class="tags">
          ${repeat(this.selectedTags.values(), (tag) => {
            const decodedTitle = new DOMParser().parseFromString(tag.title, 'text/html').body.textContent;

            return html`
              <a class="tag" >${decodedTitle}${this.buildDeleteBtn(tag)}</a>
            `;
          })}
        </div>
      </div>
      <h2>Manage tags</h2>
      <div class="millar-menu">
        <div class="menu-breadcrumbs">
          ${this.currentPath.split('/').map((path, i, arr) => {
            const tag = deepGetTagByPath(arr, i, this.tags);

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
        ${this.currentCloud ? html`
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
        </div>` : nothing}
      </div>
    </div>
    <div class="action-bar">
        <sp-toast variant="positive" size="m" timeout="6000">Changes saved</sp-toast>
        <sp-button variant="secondary" size="l" ?disabled=${!this.pendingChanges || !this.currentCloud} @click=${() => {
          const fullSavedTags = this.savedTags[this.currentCloud]?.map((tag) => deepGetTagByTagID(tag.tagID, this.tags)) || [];
          this.selectedTags = new Set(fullSavedTags); this.pendingChanges = false;
        }}>Cancel</sp-button>
        <sp-button variant="primary" size="l" ?disabled=${!this.pendingChanges || !this.currentCloud} @click=${this.save}>Save</sp-button>
    </div>
    `;
  }
}
