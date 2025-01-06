/* eslint-disable max-len */
import { LIBS } from '../../scripts/scripts.js';
import style from './tag-manager.css.js';
import { getIcon } from '../../scripts/utils.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class TagManager extends LitElement {
  static styles = style;

  static properties = {
    tags: { type: Object },
    currentPath: { type: String },
    selectedTags: { type: Set },
  };

  constructor() {
    super();
    this.tags = {};
    this.currentPath = 'caas';
    this.selectedTags = new Set();
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

    this.dispatchEvent(new CustomEvent('tag-select', { detail: { selectedTags: Array.from(this.selectedTags) }, bubbles: true, composed: true }));
  }

  handleItemClick(e, tag) {
    if (e.target.tagName === 'SP-CHECKBOX') return;

    if (!tag.tags || !Object.keys(tag.tags).length) {
      this.handleTagSelect(tag);
    } else {
      const { path } = tag;
      const trimmedPath = path.replace('/content/cq:tags/', '');
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
    const trimmedPath = tag.path.replace('/content/cq:tags/', '');
    if ([...this.selectedTags].some((t) => {
      const { path } = t;
      const trimmedSelectedTagPath = path.replace('/content/cq:tags/', '');
      return trimmedSelectedTagPath.startsWith(trimmedPath);
    })) {
      return html`<sp-checkbox indeterminate @click=${() => this.handleItemCheck(tag)}/>`;
    }

    return html`<sp-checkbox @click=${() => this.handleItemCheck(tag)}/>`;
  }

  buildItem(tag) {
    const { tags, tagID } = tag;

    return html`
      <div class="menu-item" data-tagid=${tagID} @click=${(e) => this.handleItemClick(e, tag)}>
        <div class="menu-item-inner">
          ${this.determineCheckboxState(tag)}
          ${this.constructor.getParsedTitle(tag)}
        </div>
        ${tags && Object.keys(tags).length ? this.constructor.getChevRight() : ''}
      </div>
    `;
  }

  deepGetTag(tags, index) {
    let currentTag = this.tags;

    tags.forEach((tag, i) => {
      if (i <= index) {
        currentTag = currentTag.tags[tag];
      }
    });

    return currentTag;
  }

  buildDeleteBtn(tag) {
    const crossIcon = getIcon('cross');
    const btnHTML = html`${crossIcon}`;

    crossIcon.addEventListener('click', () => {
      this.selectedTags.delete(tag);
      this.requestUpdate();
    });

    return btnHTML;
  }

  getSelectedTags() {
    return Array.from(this.selectedTags);
  }

  render() {
    return html`
    <div class="tags-pool">
      <div class="tags">
        ${repeat(this.selectedTags.values(), (tag) => html`
          <a class="tag" >${tag.title}${this.buildDeleteBtn(tag)}</a>
        `)}
      </div>
    </div>
    <div class="menu-breadcrumbs">
      ${this.currentPath.split('/').map((path, i, arr) => {
    const tag = this.deepGetTag(arr, i);

    if (tag) {
      return html`
        <a @click=${() => { this.currentPath = arr.slice(0, i + 1).join('/'); }}> ${tag.title} </a>
        ${i < arr.length - 1 ? this.constructor.getChevRight() : nothing}
      `;
    }

    return nothing;
  })}

    </div>
    <div class="menu-group">
      ${this.currentPath.split('/').map((_p, i, arr) => {
    const tag = this.deepGetTag(arr, i);

    if (tag && tag.tags && Object.keys(tag.tags).length) {
      return html`
        <div class="menu">
          ${repeat(Object.entries(tag.tags), ([, value]) => this.buildItem(value))}
        </div>
        `;
    }

    return nothing;
  })
}
    </div>
    `;
  }
}
