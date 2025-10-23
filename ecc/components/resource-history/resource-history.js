import { LitElement, html, css, nothing } from '../../../deps/lit-all.min.js';
import { getIcon } from '../../scripts/utils.js';

const DATE_FORMAT_OPTIONS = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

class ResourceHistory extends LitElement {
  static properties = {
    history: { type: Array },
    resourceId: { type: String },
    resourceType: { type: String },
    isOpen: { type: Boolean },
    loading: { type: Boolean },
  };

  constructor() {
    super();
    this.history = [];
    this.resourceId = '';
    this.resourceType = 'event';
    this.isOpen = false;
    this.loading = false;
  }

  static styles = css`
    :host {
      --side-panel-width: 600px;
      --animation-duration: 0.3s;
      font-family: var(--body-font-family, 'Adobe Clean', sans-serif);
    }

    .history-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: opacity var(--animation-duration), visibility var(--animation-duration);
    }

    .history-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .history-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: var(--side-panel-width);
      max-width: 100vw;
      height: 100%;
      background: white;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform var(--animation-duration);
      display: flex;
      flex-direction: column;
    }

    .history-panel.open {
      transform: translateX(0);
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px;
      border-bottom: 1px solid var(--color-gray-300, #e1e1e1);
      flex-shrink: 0;
    }

    .panel-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: var(--color-black, #000);
    }

    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .close-button:hover {
      background-color: var(--color-gray-100, #f5f5f5);
    }

    .close-button img {
      width: 20px;
      height: 20px;
    }

    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      gap: 16px;
      color: var(--color-gray-600, #6e6e6e);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      gap: 16px;
      color: var(--color-gray-600, #6e6e6e);
      text-align: center;
    }

    .empty-state img {
      width: 80px;
      height: 80px;
      opacity: 0.5;
    }

    .timeline {
      position: relative;
      padding-left: 32px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 8px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--color-gray-300, #e1e1e1);
    }

    .timeline-item {
      position: relative;
      margin-bottom: 32px;
      padding-bottom: 32px;
      border-bottom: 1px solid var(--color-gray-200, #f0f0f0);
    }

    .timeline-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .timeline-marker {
      position: absolute;
      left: -28px;
      top: 4px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: white;
      border: 3px solid var(--color-info-accent, #1473e6);
      z-index: 1;
    }

    .timeline-marker.create {
      border-color: var(--color-success-accent, #2d9d78);
    }

    .timeline-marker.update {
      border-color: var(--color-info-accent, #1473e6);
    }

    .timeline-marker.delete {
      border-color: var(--color-negative-accent, #d7373f);
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      gap: 16px;
    }

    .change-type {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .change-type.create {
      background: #e8f5f2;
      color: #2d9d78;
    }

    .change-type.update {
      background: #e9f2ff;
      color: #1473e6;
    }

    .change-type.delete {
      background: #ffeeed;
      color: #d7373f;
    }

    .timestamp {
      font-size: 13px;
      color: var(--color-gray-600, #6e6e6e);
      white-space: nowrap;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--color-info-accent, #1473e6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      font-size: 14px;
      color: var(--color-black, #000);
    }

    .user-email {
      font-size: 12px;
      color: var(--color-gray-600, #6e6e6e);
    }

    .change-summary {
      background: var(--color-gray-100, #f5f5f5);
      padding: 12px;
      border-radius: 4px;
      font-size: 13px;
      line-height: 1.6;
    }

    .change-details {
      margin-top: 12px;
    }

    .change-section {
      margin-bottom: 12px;
    }

    .change-section:last-child {
      margin-bottom: 0;
    }

    .change-section-title {
      font-weight: 600;
      font-size: 12px;
      color: var(--color-gray-700, #4b4b4b);
      margin-bottom: 6px;
      text-transform: uppercase;
    }

    .change-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .change-list li {
      padding: 4px 0;
      font-size: 13px;
      color: var(--color-gray-800, #2c2c2c);
      word-break: break-word;
    }

    .change-list li::before {
      content: '•';
      margin-right: 8px;
      color: var(--color-gray-500, #909090);
    }

    .change-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      margin-left: 6px;
    }

    .change-badge.added {
      background: #e8f5f2;
      color: #2d9d78;
    }

    .change-badge.updated {
      background: #e9f2ff;
      color: #1473e6;
    }

    .change-badge.deleted {
      background: #ffeeed;
      color: #d7373f;
    }

    @media (max-width: 768px) {
      :host {
        --side-panel-width: 100vw;
      }

      .panel-header {
        padding: 16px;
      }

      .panel-content {
        padding: 16px;
      }

      .timeline {
        padding-left: 24px;
      }
    }
  `;

  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, DATE_FORMAT_OPTIONS);
  }

  getUserInitials(name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getChangeSummary(item) {
    const { changeType, resourceSubtype, imageKind } = item;

    if (resourceSubtype === 'image') {
      const kindLabel = imageKind?.replace(/-/g, ' ') || 'image';
      return `${changeType === 'create' ? 'Added' : changeType === 'delete' ? 'Removed' : 'Updated'} ${kindLabel}`;
    }

    if (resourceSubtype === 'venue') {
      return `${changeType === 'create' ? 'Added' : changeType === 'delete' ? 'Removed' : 'Updated'} venue information`;
    }

    if (!item.diff) {
      return `${changeType === 'create' ? 'Created' : changeType === 'delete' ? 'Deleted' : 'Updated'} ${this.resourceType}`;
    }

    const { added, updated, deleted } = item.diff;
    const changes = [];

    if (Object.keys(added || {}).length > 0) {
      changes.push(`${Object.keys(added).length} field${Object.keys(added).length > 1 ? 's' : ''} added`);
    }

    if (Object.keys(updated || {}).length > 0) {
      changes.push(`${Object.keys(updated).length} field${Object.keys(updated).length > 1 ? 's' : ''} updated`);
    }

    if (Object.keys(deleted || {}).length > 0) {
      changes.push(`${Object.keys(deleted).length} field${Object.keys(deleted).length > 1 ? 's' : ''} removed`);
    }

    return changes.length > 0 ? changes.join(', ') : 'Updated';
  }

  renderChangeDetails(item) {
    if (!item.diff) return nothing;

    const { added, updated, deleted } = item.diff;
    const hasChanges = (added && Object.keys(added).length > 0) ||
                       (updated && Object.keys(updated).length > 0) ||
                       (deleted && Object.keys(deleted).length > 0);

    if (!hasChanges) return nothing;

    return html`
      <div class="change-details">
        ${added && Object.keys(added).length > 0 ? html`
          <div class="change-section">
            <div class="change-section-title">Added</div>
            <ul class="change-list">
              ${Object.keys(added).map((key) => html`
                <li>${this.formatFieldName(key)}</li>
              `)}
            </ul>
          </div>
        ` : nothing}

        ${updated && Object.keys(updated).length > 0 ? html`
          <div class="change-section">
            <div class="change-section-title">Updated</div>
            <ul class="change-list">
              ${Object.keys(updated).map((key) => html`
                <li>${this.formatFieldName(key)}</li>
              `)}
            </ul>
          </div>
        ` : nothing}

        ${deleted && Object.keys(deleted).length > 0 ? html`
          <div class="change-section">
            <div class="change-section-title">Removed</div>
            <ul class="change-list">
              ${Object.keys(deleted).map((key) => html`
                <li>${this.formatFieldName(key)}</li>
              `)}
            </ul>
          </div>
        ` : nothing}
      </div>
    `;
  }

  formatFieldName(field) {
    // Convert camelCase or snake_case to readable format
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  renderTimelineItem(item) {
    const { changeType, timestamp, user } = item;

    return html`
      <div class="timeline-item">
        <div class="timeline-marker ${changeType}"></div>
        <div class="timeline-header">
          <span class="change-type ${changeType}">${changeType}</span>
          <span class="timestamp">${this.formatTimestamp(timestamp)}</span>
        </div>
        <div class="user-info">
          <div class="user-avatar">${this.getUserInitials(user.name)}</div>
          <div class="user-details">
            <div class="user-name">${user.name}</div>
            <div class="user-email">${user.email}</div>
          </div>
        </div>
        <div class="change-summary">${this.getChangeSummary(item)}</div>
        ${this.renderChangeDetails(item)}
      </div>
    `;
  }

  renderContent() {
    if (this.loading) {
      return html`
        <div class="loading-state">
          <sp-progress-circle indeterminate size="l"></sp-progress-circle>
          <div>Loading history...</div>
        </div>
      `;
    }

    if (!this.history || this.history.length === 0) {
      return html`
        <div class="empty-state">
          <div>No history available for this ${this.resourceType}.</div>
        </div>
      `;
    }

    return html`
      <div class="timeline">
        ${this.history.map((item) => this.renderTimelineItem(item))}
      </div>
    `;
  }

  close() {
    this.isOpen = false;
  }

  open() {
    this.isOpen = true;
  }

  handleOverlayClick(e) {
    if (e.target.classList.contains('history-overlay')) {
      this.close();
    }
  }

  render() {
    return html`
      <div class="history-overlay ${this.isOpen ? 'open' : ''}" @click=${this.handleOverlayClick}>
        <div class="history-panel ${this.isOpen ? 'open' : ''}">
          <div class="panel-header">
            <h2>${this.resourceType.charAt(0).toUpperCase() + this.resourceType.slice(1)} History</h2>
            <button class="close-button" @click=${this.close} aria-label="Close history panel">
              ${getIcon('cross')}
            </button>
          </div>
          <div class="panel-content">
            ${this.renderContent()}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('resource-history', ResourceHistory);

