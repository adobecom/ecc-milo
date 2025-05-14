import { LIBS } from '../../scripts/scripts.js';
import { style } from './event-data-migrator.css.js';
import { getEvents, updateEvent, getEvent, getLocales } from '../../scripts/esp-controller.js';
import { EVENT_DATA_FILTER, getAttribute, getEventPayload } from '../../scripts/data-utils.js';
import { getIcon } from '../../scripts/utils.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

const delay = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

export default class EventDataMigrator extends LitElement {
  static styles = style;

  static properties = {
    series: { type: Array },
    locales: { type: Object },
    selectedSeries: { type: String },
    selectedLocale: { type: String },
    events: { type: Array },
    migrations: { type: Array },
    pendingChanges: { type: Boolean },
    toastState: { type: Object },
    config: { type: Object },
    isLoadingEvents: { type: Boolean },
    isMigrating: { type: Boolean },
    selectedEvents: { type: Set },
  };

  constructor() {
    super();
    this.series = [];
    this.locales = {};
    this.selectedSeries = '';
    this.selectedLocale = '';
    this.events = [];
    this.migrations = [];
    this.pendingChanges = false;
    this.config = {};
    this.isLoadingEvents = false;
    this.isMigrating = false;
    this.selectedEvents = new Set();
  }

  async firstUpdated() {
    this.toast = this.shadowRoot.querySelector('sp-toast');
    const localesResp = await getLocales();
    if (!localesResp.error) {
      this.locales = localesResp.localeNames;
    }
  }

  async handleSeriesChange(e) {
    this.selectedSeries = e.target.value;
    if (this.selectedLocale) {
      this.isLoadingEvents = true;
      this.requestUpdate();
      const events = await getEvents();
      this.events = events.events
        .filter((event) => event.seriesId === this.selectedSeries)
        .map((event) => ({ ...event, migrationStatus: null }));
      this.isLoadingEvents = false;
      this.requestUpdate();
    }
  }

  async handleLocaleChange(e) {
    this.selectedLocale = e.target.value;
    if (this.selectedSeries) {
      this.isLoadingEvents = true;
      this.requestUpdate();
      const events = await getEvents();
      this.events = events.events
        .filter((event) => event.seriesId === this.selectedSeries)
        .map((event) => ({ ...event, migrationStatus: null }));
      this.isLoadingEvents = false;
      this.requestUpdate();
    }
  }

  handleMigrationAdd() {
    this.migrations = [...this.migrations, {
      from: '',
      to: '',
      override: false,
      specialType: 'none',
    }];
    this.requestUpdate();
  }

  handleMigrationRemove(index) {
    this.migrations = this.migrations.filter((_, i) => i !== index);
    this.requestUpdate();
  }

  handleMigrationChange(index, field, value) {
    this.migrations[index][field] = value;
    this.requestUpdate();
  }

  handleEventSelect(eventId) {
    if (this.selectedEvents.has(eventId)) {
      this.selectedEvents.delete(eventId);
    } else {
      this.selectedEvents.add(eventId);
    }
    this.requestUpdate();
  }

  handleSelectAll() {
    if (this.selectedEvents.size === this.events.length) {
      this.selectedEvents.clear();
    } else {
      this.selectedEvents = new Set(this.events.map((e) => e.eventId));
    }
    this.requestUpdate();
  }

  async handleMigrate() {
    if (this.selectedEvents.size === 0) return;

    this.isMigrating = true;
    this.events = this.events.map((event) => (
      this.selectedEvents.has(event.eventId)
        ? { ...event, migrationStatus: 'pending' }
        : event
    ));
    this.requestUpdate();

    await Array.from(this.selectedEvents).reduce(async (promise, eventId) => {
      await promise;
      const event = this.events.find((e) => e.eventId === eventId);
      if (!event) return;

      try {
        const eventData = await getEvent(event.eventId);
        if (eventData.error) {
          this.events = this.events.map((e) => (
            e.eventId === event.eventId
              ? { ...e, migrationStatus: 'error', error: eventData.error }
              : e
          ));
          this.requestUpdate();
          return;
        }

        const updatedData = getEventPayload(eventData, this.selectedLocale);
        this.migrations.forEach((migration) => {
          const fromValue = getAttribute(eventData, migration.from, this.selectedLocale);
          if (!fromValue) return;

          const toValue = getAttribute(eventData, migration.to, this.selectedLocale);
          if (toValue && !migration.override) return;

          let updatedValue = fromValue;
          if (migration.specialType === 'text-to-html') {
            updatedValue = `<p>${fromValue}</p>`;
          }

          if (EVENT_DATA_FILTER[migration.to]?.localizable) {
            if (!updatedData.localizations) {
              updatedData.localizations = {};
            }
            if (!updatedData.localizations[this.selectedLocale]) {
              updatedData.localizations[this.selectedLocale] = {};
            }
            updatedData.localizations[this.selectedLocale][migration.to] = updatedValue;
          } else {
            updatedData[migration.to] = updatedValue;
          }
        });

        const result = await updateEvent(event.eventId, updatedData);
        this.events = this.events.map((e) => (
          e.eventId === event.eventId
            ? { ...e, migrationStatus: result.error ? 'error' : 'success', error: result.error }
            : e
        ));
        this.requestUpdate();
        await delay(500);
      } catch (error) {
        this.events = this.events.map((e) => (
          e.eventId === event.eventId
            ? { ...e, migrationStatus: 'error', error: error.message }
            : e
        ));
        this.requestUpdate();
      }
    }, Promise.resolve());

    this.isMigrating = false;
    if (this.toast) this.toast.open = true;
  }

  static getStatusIcon(status) {
    switch (status) {
      case 'success':
        return html`<sp-icon size="s" class="status-icon success">${getIcon('dot-green')}</sp-icon>`;
      case 'error':
        return html`<sp-icon size="s" class="status-icon error">${getIcon('dot-red')}</sp-icon>`;
      case 'pending':
        return html`<sp-progress-circle indeterminate size="s"></sp-progress-circle>`;
      default:
        return nothing;
    }
  }

  render() {
    return html`
      <div class="form-container">
        <div class="header">
          <h1>Event Data Migrator</h1>
        </div>

        <div class="picker-container">
          <div class="pickers">
            <sp-picker
              class="series-picker"
              @change=${this.handleSeriesChange}
              label="Select a Series"
            >
              <sp-menu>
                ${repeat(this.series, (series) => html`
                  <sp-menu-item
                    value="${series.seriesId}"
                    ?active=${this.selectedSeries === series.seriesId}
                  >
                    ${series.seriesName}
                  </sp-menu-item>
                `)}
              </sp-menu>
            </sp-picker>

            <sp-picker
              class="locale-picker"
              @change=${this.handleLocaleChange}
              label="Select a Locale"
            >
              <sp-menu>
                ${repeat(Object.entries(this.locales), ([key, value]) => html`
                  <sp-menu-item
                    value="${key}"
                    ?active=${this.selectedLocale === key}
                  >
                    ${value}
                  </sp-menu-item>
                `)}
              </sp-menu>
            </sp-picker>
          </div>
        </div>

        ${this.selectedSeries && this.selectedLocale ? html`
          <div class="migration-container">
            <div class="events-list">
              <div class="events-header">
                <h2>Events in Series</h2>
                <sp-checkbox
                  ?checked=${this.selectedEvents.size === this.events.length}
                  ?indeterminate=${this.selectedEvents.size > 0 && this.selectedEvents.size < this.events.length}
                  @change=${this.handleSelectAll}
                >
                  Select All
                </sp-checkbox>
              </div>
              ${this.isLoadingEvents ? html`
                <div class="loading-container">
                  <sp-progress-circle indeterminate size="m"></sp-progress-circle>
                  <span>Loading events...</span>
                </div>
              ` : html`
                <div class="events">
                  ${repeat(this.events, (event) => html`
                    <div class="event-item ${event.migrationStatus || ''}">
                      <div class="event-header">
                        <sp-checkbox
                          ?checked=${this.selectedEvents.has(event.eventId)}
                          @change=${() => this.handleEventSelect(event.eventId)}
                        ></sp-checkbox>
                        <span class="event-title">${getAttribute(event, 'title', this.selectedLocale)}</span>
                        ${EventDataMigrator.getStatusIcon(event.migrationStatus)}
                      </div>
                      ${event.migrationStatus === 'error' ? html`
                        <div class="error-message">${event.error.message}</div>
                      ` : nothing}
                    </div>
                  `)}
                </div>
              `}
            </div>

            <div class="migrations-section">
              <h2>Migration Rules</h2>
              <div class="migrations">
                ${repeat(this.migrations, (migration, index) => html`
                  <div class="migration-row">
                    <sp-picker
                      @change=${(e) => this.handleMigrationChange(index, 'from', e.target.value)}
                      label="From"
                    >
                      <sp-menu>
                        ${repeat(Object.keys(EVENT_DATA_FILTER), (key) => html`
                          <sp-menu-item
                            value="${key}"
                            ?active=${migration.from === key}
                          >
                            ${key}
                          </sp-menu-item>
                        `)}
                      </sp-menu>
                    </sp-picker>

                    <sp-picker
                      @change=${(e) => this.handleMigrationChange(index, 'to', e.target.value)}
                      label="To"
                    >
                      <sp-menu>
                        ${repeat(Object.keys(EVENT_DATA_FILTER), (key) => html`
                          <sp-menu-item
                            value="${key}"
                            ?active=${migration.to === key}
                          >
                            ${key}
                          </sp-menu-item>
                        `)}
                      </sp-menu>
                    </sp-picker>

                    <sp-picker
                      @change=${(e) => this.handleMigrationChange(index, 'specialType', e.target.value)}
                      label="Special Type"
                    >
                      <sp-menu>
                        <sp-menu-item value="none" ?active=${migration.specialType === 'none'}>None</sp-menu-item>
                        <sp-menu-item value="text-to-html" ?active=${migration.specialType === 'text-to-html'}>Text to HTML</sp-menu-item>
                      </sp-menu>
                    </sp-picker>

                    <sp-checkbox
                      ?checked=${migration.override}
                      @change=${(e) => this.handleMigrationChange(index, 'override', e.target.checked)}
                    >
                      Override if target has value
                    </sp-checkbox>

                    <sp-button
                      variant="negative"
                      @click=${() => this.handleMigrationRemove(index)}
                    >
                      Remove
                    </sp-button>
                  </div>
                `)}
              </div>

              <sp-button
                variant="secondary"
                @click=${this.handleMigrationAdd}
              >
                Add Migration Rule
              </sp-button>
            </div>
          </div>
        ` : nothing}
      </div>

      <div class="action-bar">
        <sp-toast variant="positive" size="m" timeout="6000">Migration completed</sp-toast>
        <sp-button
          variant="primary"
          size="l"
          ?disabled=${!this.selectedSeries || !this.selectedLocale || !this.migrations.length || this.isMigrating || this.selectedEvents.size === 0}
          @click=${this.handleMigrate}
        >
          ${this.isMigrating ? 'Migrating...' : 'Run Migration'}
        </sp-button>
      </div>
    `;
  }
}
