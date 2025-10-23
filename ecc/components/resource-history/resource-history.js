/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
import { LIBS } from '../../scripts/scripts.js';
import { style } from './resource-history.css.js';

const { LitElement, html, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class ResourceHistory extends LitElement {
  static properties = {
    history: { type: Array },
    isOpen: { type: Boolean, reflect: true },
    loading: { type: Boolean },
    resourceTitle: { type: String },
  };

  static styles = style;

  constructor() {
    super();
    this.history = [];
    this.isOpen = false;
    this.loading = false;
    this.resourceTitle = '';
  }

  close() {
    this.isOpen = false;
    this.dispatchEvent(new CustomEvent('close-panel'));
  }

  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleString('en-US', options);
  }

  getChangeTypeLabel(changeType) {
    const labels = {
      create: 'Created',
      update: 'Updated',
      delete: 'Deleted',
    };
    return labels[changeType] || changeType;
  }

  getChangeTypeClass(changeType) {
    return `change-type-${changeType}`;
  }

  generateChangeSummary(entry) {
    const { changeType, resourceSubtype, diff } = entry;

    if (changeType === 'create') {
      if (resourceSubtype === 'image') {
        const imageKind = entry.imageKind || 'image';
        return `Added ${imageKind.replace(/-/g, ' ')}`;
      }
      if (resourceSubtype === 'venue') {
        return 'Added venue information';
      }
      if (resourceSubtype === 'speaker') {
        return 'Added speaker';
      }
      return 'Created resource';
    }

    if (changeType === 'delete') {
      if (resourceSubtype === 'image') {
        const imageKind = entry.imageKind || 'image';
        return `Removed ${imageKind.replace(/-/g, ' ')}`;
      }
      if (resourceSubtype === 'speaker') {
        return 'Removed speaker';
      }
      return 'Deleted resource';
    }

    if (changeType === 'update' && diff) {
      const changes = [];
      const { added, updated, deleted } = diff;

      const countFields = (obj) => {
        if (!obj || typeof obj !== 'object') return 0;
        return Object.keys(obj).length;
      };

      const addedCount = countFields(added);
      const updatedCount = countFields(updated);
      const deletedCount = countFields(deleted);

      if (addedCount > 0) changes.push(`added ${addedCount} field${addedCount > 1 ? 's' : ''}`);
      if (updatedCount > 0) changes.push(`updated ${updatedCount} field${updatedCount > 1 ? 's' : ''}`);
      if (deletedCount > 0) changes.push(`removed ${deletedCount} field${deletedCount > 1 ? 's' : ''}`);

      if (changes.length > 0) {
        return `Modified: ${changes.join(', ')}`;
      }

      // Check for specific field updates
      if (updated) {
        const fieldNames = Object.keys(updated);
        if (fieldNames.length === 1) {
          return `Updated ${fieldNames[0].replace(/([A-Z])/g, ' $1').toLowerCase()}`;
        }
        if (fieldNames.length <= 3) {
          return `Updated ${fieldNames.map(f => f.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ')}`;
        }
      }
    }

    return 'Updated resource';
  }

  renderTimelineItem(entry, index) {
    const { user, timestamp } = entry;
    const userName = user?.name || 'Unknown user';
    const userEmail = user?.email || '';
    const changeSummary = this.generateChangeSummary(entry);
    const changeType = entry.changeType;
    const changeLabel = this.getChangeTypeLabel(changeType);

    return html`
      <div class="timeline-item ${this.getChangeTypeClass(changeType)}">
        <div class="timeline-marker">
          <div class="timeline-dot"></div>
          ${index < this.history.length - 1 ? html`<div class="timeline-line"></div>` : nothing}
        </div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="change-type-badge">${changeLabel}</span>
            <span class="timeline-date">${this.formatTimestamp(timestamp)}</span>
          </div>
          <div class="timeline-summary">${changeSummary}</div>
          <div class="timeline-user">
            <span class="user-name">${userName}</span>
            ${userEmail ? html`<span class="user-email">${userEmail}</span>` : nothing}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div class="side-panel-overlay ${this.isOpen ? 'open' : ''}" @click="${this.close}"></div>
      <div class="side-panel ${this.isOpen ? 'open' : ''}">
        <div class="panel-header">
          <div class="panel-title-section">
            <h2 class="panel-title">Version History</h2>
            ${this.resourceTitle ? html`<p class="resource-title">${this.resourceTitle}</p>` : nothing}
          </div>
          <button class="close-button" @click="${this.close}" aria-label="Close panel">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="panel-content">
          ${this.loading ? html`
            <div class="loading-state">
              <sp-progress-circle indeterminate size="l"></sp-progress-circle>
              <p>Loading history...</p>
            </div>
          ` : nothing}
          
          ${!this.loading && this.history.length === 0 ? html`
            <div class="empty-state">
              <p>No history available for this resource.</p>
            </div>
          ` : nothing}
          
          ${!this.loading && this.history.length > 0 ? html`
            <div class="timeline">
              ${this.history.map((entry, index) => this.renderTimelineItem(entry, index))}
            </div>
          ` : nothing}
        </div>
      </div>
    `;
  }
}

customElements.define('resource-history', ResourceHistory);

