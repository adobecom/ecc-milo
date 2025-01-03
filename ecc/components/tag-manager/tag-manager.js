/* eslint-disable max-len */
import { LIBS } from '../../scripts/scripts.js';
import { style } from './tag-manager.css.js';

const { LitElement, html, repeat } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class TagManager extends LitElement {
  static styles = style;

  static properties = {
    tags: { type: Object },
    currentPath: { type: String },
    selectedTags: { type: Array },
  };

  constructor() {
    super();
    this.tags = {};
    this.currentPath = 'caas';
    this.selectedTags = [];
  }

  handleItemClick(tag) {
    const { path } = tag;
    const trimmedPath = path.replace('/content/cq:tags/', '');

    this.currentPath = trimmedPath;
  }

  buildItem = (tag) => {
    const { title, tags, path } = tag;

    return html`
          <div class="menu-item" value=${path} @click=${() => this.handleItemClick(tag)}>
            <div class="menu-item-inner" >
              ${this.selectedTags.includes(path) ? html`<sp-checkbox checked=${true}/>` : html`<sp-checkbox/>`}
              <span>${title}</span>
            </div>
            ${tags && Object.keys(tags).length ? html`
              <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18">
                <defs>
                  <style>
                    .fill {
                      fill: #464646;
                    }
                  </style>
                </defs>
                <title>S ChevronRight 18 N</title>
                <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" /><path class="fill" d="M12,9a.994.994,0,0,1-.2925.7045l-3.9915,3.99a1,1,0,1,1-1.4355-1.386l.0245-.0245L9.5905,9,6.3045,5.715A1,1,0,0,1,7.691,4.28l.0245.0245,3.9915,3.99A.994.994,0,0,1,12,9Z" />
              </svg>` : ''}
            </div>
          `;
  };

  deepGetTag(tags, index) {
    let currentTag = this.tags;

    tags.forEach((tag, i) => {
      if (i <= index) {
        currentTag = currentTag.tags[tag];
      }
    });

    return currentTag;
  }

  render() {
    return html`
    <div class="menu-group">
      ${this.currentPath.split('/').map((_p, i, arr) => {
    const tag = this.deepGetTag(arr, i);

    return html`
        <div class="menu">
          ${repeat(Object.entries(tag.tags), ([, value]) => this.buildItem(value))}
        </div>
        `;
  })
}
    </div>
    `;
  }
}
