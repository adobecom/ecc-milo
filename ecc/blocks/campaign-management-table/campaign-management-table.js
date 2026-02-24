import { LIBS } from '../../scripts/scripts.js';
import {
  createCampaign,
  getCampaigns,
  updateCampaign,
  deleteCampaign,
} from '../../scripts/esp-controller.js';
import { buildNoAccessScreen, signIn } from '../../scripts/utils.js';
import { initProfileLogicTree } from '../../scripts/profile.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

const SPECTRUM_COMPONENTS = [
  'theme',
  'button',
  'dialog',
  'underlay',
  'textfield',
  'switch',
  'progress-circle',
  'action-button',
  'toast',
  'tooltip',
  'overlay',
  'popover',
  'field-label',
  'divider',
];

const MOCK_CAMPAIGNS = [
  {
    campaignId: 'mock-1',
    name: 'Partner Promotion',
    status: 'Active',
    attendeeLimit: 50,
    attendeeCount: 23,
    waitlistAttendeeCount: 0,
    url: 'https://www.adobe.com/events/example?campaign=partner-promo',
    creationTime: Date.now(),
    modificationTime: Date.now(),
  },
  {
    campaignId: 'mock-2',
    name: 'Email Newsletter',
    status: 'Active',
    attendeeLimit: 100,
    attendeeCount: 67,
    waitlistAttendeeCount: 0,
    url: 'https://www.adobe.com/events/example?campaign=email-newsletter',
    creationTime: Date.now(),
    modificationTime: Date.now(),
  },
  {
    campaignId: 'mock-3',
    name: 'Social Media',
    status: 'Archived',
    attendeeLimit: 0,
    attendeeCount: 45,
    waitlistAttendeeCount: 0,
    url: 'https://www.adobe.com/events/example?campaign=social',
    creationTime: Date.now(),
    modificationTime: Date.now(),
  },
];

class CampaignTable extends LitElement {
  static properties = {
    eventId: { type: String },
    campaigns: { type: Array },
    loading: { type: Boolean },
    editingCampaign: { type: Object },
    deletingCampaign: { type: Object },
    showCreateDialog: { type: Boolean },
    toastMsg: { type: String },
    toastVariant: { type: String },
    eventAttendeeLimit: { type: Number },
  };

  constructor() {
    super();
    this.campaigns = [];
    this.loading = true;
    this.editingCampaign = null;
    this.deletingCampaign = null;
    this.showCreateDialog = false;
    this.toastMsg = '';
    this.toastVariant = 'info';
    this.eventAttendeeLimit = 0;
  }

  createRenderRoot() {
    return this;
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadCampaigns();
  }

  async loadCampaigns() {
    this.loading = true;
    try {
      const resp = await getCampaigns(this.eventId);
      if (Array.isArray(resp)) {
        this.campaigns = resp;
      } else {
        window.lana?.log('Campaign fetch did not return an array, using mock data');
        this.campaigns = MOCK_CAMPAIGNS;
      }
    } catch {
      window.lana?.log('Campaign fetch failed, using mock data');
      this.campaigns = MOCK_CAMPAIGNS;
    }
    this.loading = false;
  }

  get totalCampaigns() { return this.campaigns.length; }

  get activeCampaigns() { return this.campaigns.filter((c) => c.status === 'Active').length; }

  get totalRegistrations() {
    return this.campaigns.reduce((sum, c) => sum + (c.attendeeCount || 0), 0);
  }

  get totalAllocated() {
    return this.campaigns.reduce((sum, c) => sum + (c.attendeeLimit || 0), 0);
  }

  get availableCapacity() {
    return Math.max(0, this.eventAttendeeLimit - this.totalAllocated);
  }

  showToast(msg, variant = 'info') {
    this.toastMsg = msg;
    this.toastVariant = variant;
    setTimeout(() => { this.toastMsg = ''; }, 4000);
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copied to clipboard');
    } catch {
      this.showToast('Failed to copy', 'negative');
    }
  }

  static extractUrlParam(campaign) {
    if (!campaign.url) return '';
    try {
      const url = new URL(campaign.url);
      return url.searchParams.get('campaign') || campaign.campaignId || '';
    } catch {
      return campaign.campaignId || '';
    }
  }

  openCreateDialog() { this.showCreateDialog = true; }

  closeCreateDialog() { this.showCreateDialog = false; }

  openEditDialog(campaign) { this.editingCampaign = { ...campaign }; }

  closeEditDialog() { this.editingCampaign = null; }

  openDeleteDialog(campaign) { this.deletingCampaign = campaign; }

  closeDeleteDialog() { this.deletingCampaign = null; }

  async handleCreate(e) {
    e.preventDefault();
    const form = this.querySelector('.create-dialog');
    const name = form.querySelector('[name="name"]')?.value?.trim();
    const attendeeLimit = parseInt(form.querySelector('[name="attendeeLimit"]')?.value, 10);

    if (!name) return;

    const payload = { name };
    if (!Number.isNaN(attendeeLimit) && attendeeLimit > 0) {
      payload.attendeeLimit = attendeeLimit;
    }

    const resp = await createCampaign(this.eventId, payload);
    if (resp.error) {
      const msg = resp.status === 409
        ? 'Campaign capacity exceeds available event capacity.'
        : 'Failed to create campaign.';
      this.showToast(msg, 'negative');
      return;
    }

    this.closeCreateDialog();
    await this.loadCampaigns();
    this.showToast('Campaign created successfully', 'positive');
  }

  async handleUpdate(e) {
    e.preventDefault();
    const form = this.querySelector('.edit-dialog');
    const name = form.querySelector('[name="name"]')?.value?.trim();
    const statusSwitch = form.querySelector('[name="status"]');
    const status = statusSwitch?.checked ? 'Active' : 'Archived';

    if (!name) return;

    const payload = { name, status };

    const resp = await updateCampaign(
      this.eventId,
      this.editingCampaign.campaignId,
      payload,
    );

    if (resp.error) {
      const msg = resp.status === 409
        ? 'Campaign was modified by another user. Please refresh and try again.'
        : 'Failed to update campaign.';
      this.showToast(msg, 'negative');
      return;
    }

    this.closeEditDialog();
    await this.loadCampaigns();
    this.showToast('Campaign updated successfully', 'positive');
  }

  async handleDelete() {
    const { campaignId, name } = this.deletingCampaign;
    const resp = await deleteCampaign(this.eventId, campaignId);

    if (resp.error) {
      const msg = resp.status === 400
        ? `Cannot delete "${name}" because it has registered attendees.`
        : `Failed to delete campaign "${name}".`;
      this.showToast(msg, 'negative');
      this.closeDeleteDialog();
      return;
    }

    this.closeDeleteDialog();
    await this.loadCampaigns();
    this.showToast(`Campaign "${name}" deleted`, 'positive');
  }

  renderStats() {
    return html`
      <div class="campaign-stats">
        <div class="stat">
          <span class="stat-label">TOTAL CAMPAIGNS</span>
          <span class="stat-value">${this.totalCampaigns}</span>
        </div>
        <div class="stat">
          <span class="stat-label">ACTIVE</span>
          <span class="stat-value">${this.activeCampaigns}</span>
        </div>
        <div class="stat">
          <span class="stat-label">CAMPAIGN REGISTRATIONS</span>
          <span class="stat-value">${this.totalRegistrations}</span>
        </div>
        <div class="stat">
          <span class="stat-label">AVAILABLE CAPACITY</span>
          <span class="stat-value">${this.availableCapacity}
            <span class="stat-subtext">of ${this.eventAttendeeLimit} total</span>
          </span>
        </div>
      </div>`;
  }

  renderTable() {
    if (!this.campaigns.length) {
      return html`<div class="empty-state">
        <p>No campaigns yet. Create one to get started.</p>
      </div>`;
    }

    return html`
      <div class="campaign-table-wrapper">
        <table class="campaign-table">
          <thead>
            <tr>
              <th>CAMPAIGN NAME</th>
              <th>URL PARAM</th>
              <th>REGISTRATIONS</th>
              <th>STATUS</th>
              <th class="actions-col"></th>
            </tr>
          </thead>
          <tbody>
            ${repeat(this.campaigns, (c) => c.campaignId, (c) => html`
              <tr>
                <td class="campaign-name-cell">${c.name}</td>
                <td class="url-param-cell">
                  <span class="url-param-text">${CampaignTable.extractUrlParam(c)}</span>
                  <sp-action-button size="xl" quiet label="Copy URL"
                    @click=${() => this.copyToClipboard(c.url || '')}>
                    <img src="/ecc/icons/copy.svg" slot="icon" alt="copy">
                  </sp-action-button>
                </td>
                <td class="registrations-cell">
                  ${c.attendeeCount || 0}${c.attendeeLimit ? html` / ${c.attendeeLimit}` : nothing}
                </td>
                <td>
                  <span class="status-badge ${c.status === 'Active' ? 'active' : 'archived'}">
                    ${c.status === 'Active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td class="actions-col">
                  <sp-action-button size="xl" quiet label="Edit"
                    @click=${() => this.openEditDialog(c)}>
                    <img src="/ecc/icons/edit.svg" slot="icon" alt="edit">
                  </sp-action-button>
                  <sp-action-button size="xl" quiet label="Delete"
                    @click=${() => this.openDeleteDialog(c)}>
                    <img src="/ecc/icons/delete.svg" slot="icon" alt="delete">
                  </sp-action-button>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>`;
  }

  renderCreateDialog() {
    if (!this.showCreateDialog) return nothing;
    return html`
      <sp-underlay open></sp-underlay>
      <div class="campaign-dialog create-dialog">
        <h2>Add tracking link</h2>
        <sp-divider size="s"></sp-divider>
        <div class="dialog-body">
          <div class="field-row">
            <sp-field-label for="create-name" required>Name</sp-field-label>
            <sp-textfield id="create-name" name="name" placeholder="Campaign name" required></sp-textfield>
          </div>
          <div class="field-row">
            <sp-field-label for="create-limit">Set link capacity limit</sp-field-label>
            <input id="create-limit" name="attendeeLimit" type="number" placeholder="e.g. 50" min="1" class="capacity-input">
            <span class="helper-text">Must be lower than the event capacity limit</span>
          </div>
        </div>
        <div class="dialog-actions">
          <sp-button variant="secondary" @click=${this.closeCreateDialog}>Cancel</sp-button>
          <sp-button variant="accent" @click=${(e) => this.handleCreate(e)}>Save</sp-button>
        </div>
      </div>`;
  }

  renderEditDialog() {
    if (!this.editingCampaign) return nothing;
    const c = this.editingCampaign;
    return html`
      <sp-underlay open></sp-underlay>
      <div class="campaign-dialog edit-dialog">
        <h2>Edit tracking link</h2>
        <sp-divider size="s"></sp-divider>
        <div class="dialog-body">
          <div class="field-row">
            <sp-field-label for="edit-name" required>Name</sp-field-label>
            <sp-textfield id="edit-name" name="name" value=${c.name} required></sp-textfield>
          </div>
          <div class="field-row">
            <sp-field-label>Tracking link</sp-field-label>
            <div class="tracking-link-row">
              <span class="tracking-link-text">${c.url || ''}</span>
              <sp-action-button size="xl" quiet label="Copy link"
                @click=${() => this.copyToClipboard(c.url || '')}>
                <img src="/ecc/icons/copy.svg" slot="icon" alt="copy">
              </sp-action-button>
            </div>
          </div>
          <div class="field-row">
            <sp-field-label>Set link capacity limit</sp-field-label>
            <input name="attendeeLimit" type="number" value=${c.attendeeLimit || ''} disabled class="capacity-input">
          </div>
          <div class="field-row switch-row">
            <sp-switch name="status" ?checked=${c.status === 'Active'}>Active</sp-switch>
            <span class="helper-text">Link is accepting registrations</span>
          </div>
        </div>
        <div class="dialog-actions">
          <sp-button variant="secondary" @click=${this.closeEditDialog}>Cancel</sp-button>
          <sp-button variant="accent" @click=${(e) => this.handleUpdate(e)}>Save</sp-button>
        </div>
      </div>`;
  }

  renderDeleteDialog() {
    if (!this.deletingCampaign) return nothing;
    return html`
      <sp-underlay open></sp-underlay>
      <div class="campaign-dialog delete-dialog">
        <h2>Delete Campaign</h2>
        <sp-divider size="s"></sp-divider>
        <div class="dialog-body">
          <p>Are you sure you want to delete the campaign "${this.deletingCampaign.name}"?
          This will not affect existing registrations, but the campaign URL will no longer work.</p>
        </div>
        <div class="dialog-actions">
          <sp-button variant="secondary" @click=${this.closeDeleteDialog}>Cancel</sp-button>
          <sp-button variant="negative" @click=${() => this.handleDelete()}>Delete</sp-button>
        </div>
      </div>`;
  }

  renderToast() {
    if (!this.toastMsg) return nothing;
    return html`<sp-toast open variant=${this.toastVariant} timeout="4000">${this.toastMsg}</sp-toast>`;
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading-screen">
          <sp-progress-circle size="l" indeterminate></sp-progress-circle>
        </div>`;
    }

    return html`
      ${this.renderStats()}
      <div class="campaign-actions-bar">
        <sp-button variant="accent" size="m" @click=${this.openCreateDialog}>
          + Add Campaign
        </sp-button>
      </div>
      ${this.renderTable()}
      ${this.renderCreateDialog()}
      ${this.renderEditDialog()}
      ${this.renderDeleteDialog()}
      <div class="toast-area">${this.renderToast()}</div>
    `;
  }
}

customElements.define('campaign-table', CampaignTable);

export default async function init(el) {
  const miloLibs = LIBS;
  const promises = SPECTRUM_COMPONENTS.map(
    (component) => import(`${miloLibs}/features/spectrum-web-components/dist/${component}.js`),
  );
  await Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    ...promises,
  ]);

  el.innerHTML = '';

  const spTheme = document.createElement('sp-theme');
  spTheme.setAttribute('color', 'light');
  spTheme.setAttribute('scale', 'medium');
  el.parentElement.replaceChild(spTheme, el);
  spTheme.appendChild(el);

  const eventId = new URLSearchParams(window.location.search).get('eventId');
  if (!eventId) {
    el.textContent = 'No event ID provided.';
    return;
  }

  await initProfileLogicTree('campaign-management-table', {
    noProfile: () => { signIn(); },
    noAccessProfile: () => { buildNoAccessScreen(el); },
    validProfile: () => {
      const table = document.createElement('campaign-table');
      table.eventId = eventId;
      el.appendChild(table);
    },
  });
}
