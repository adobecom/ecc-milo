/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { getLibs } from '../../scripts/utils.js';
import { style } from './profile.css.js';
import { createSpeaker } from '../../utils/esp-controller.js';

const { LitElement, html, repeat, nothing, query } = await import(`${getLibs()}/deps/lit-all.min.js`);

const defaultFieldLabels = {
  heading: 'Profile',
  chooseType: 'Choose Type',
  name: 'Name',
  title: 'Add Title',
  bio: 'Add Bio',
  socialMedia: 'Social Medias',
  addSocialMedia: 'Add Social Media link',
  addSocialMediaRepeater: 'Add Social Media',
};

const speakerType = ['Presenter', 'Host', 'Speaker', 'Keynote'];

export class Profile extends LitElement {
  static properties = {
    seriesId: { type: String },
    fieldlabels: { type: Object, reflect: true },
    profile: { type: Object, reflect: true },
  };

  static styles = style;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.fieldlabels = this.fieldlabels ?? defaultFieldLabels;

    this.profile = this.profile ?? { socialMedia: [{ url: '' }] };
  }

  firstUpdated() {
    this.imageDropzone = this.shadowRoot.querySelector('image-dropzone');
  }

  addSocialMedia() {
    const socialMedia = { url: '' };
    if (this.profile?.socialMedia) {
      this.profile.socialMedia.push(socialMedia);
    } else {
      this.profile.socialMedia = [socialMedia];
    }
    this.requestUpdate();
  }

  updateValue(key, value) {
    this.profile = { ...this.profile, [key]: value };
  }

  updateSocialMedia(index, value) {
    this.profile.socialMedia[index] = { url: value };
  }

  renderProfileForm() {
    const fieldLabelsJSON = {
      ...defaultFieldLabels,
      ...(this.fieldlabels ?? {}),
    };

    const firstNameData = {
      value: this.profile?.firstName,
      placeholder: fieldLabelsJSON.firstName,
      helperText: fieldLabelsJSON.firstNameSubText,
    };

    const lastNameData = {
      value: this.profile?.lastName,
      placeholder: fieldLabelsJSON.lastName,
      helperText: fieldLabelsJSON.lastNameSubText,
    };

    const bioData = {
      value: this.profile?.bio,
      placeholder: fieldLabelsJSON.bio,
      helperText: fieldLabelsJSON.bioSubText,
    };

    const titleData = {
      value: this.profile?.title,
      placeholder: fieldLabelsJSON.title,
      helperText: fieldLabelsJSON.titleSubText,
    };

    const socialMediaData = { placeholder: fieldLabelsJSON.addSocialMedia };

    const textareaConfig = {
      grows: true,
      multiline: true,
      size: 'xl',
      quiet: true,
    };

    const textfieldConfig = { size: 'xl' };
    const quietTextfieldConfig = { size: 'xl', quiet: true };

    return html`
    <h2>${fieldLabelsJSON.heading}</h2>
    <div>
        <div><sp-field-label size="l" required>${fieldLabelsJSON.chooseType}</sp-field-label></div>
        <sp-picker label=${fieldLabelsJSON.chooseType} value=${this.profile?.type} size="l" @change=${(event) => this.updateValue('type', event.target.value)}>
            ${repeat(speakerType, (type) => html`
                <sp-menu-item value="${type}">${type}</sp-menu-item>
            `)}
        </sp-picker>
    </div>
    <custom-textfield data=${JSON.stringify(firstNameData)} config=${JSON.stringify(quietTextfieldConfig)} @input-change=${(event) => this.updateValue('firstName', event.detail.value)}></custom-textfield>
    <custom-textfield data=${JSON.stringify(lastNameData)} config=${JSON.stringify(quietTextfieldConfig)} @input-change=${(event) => this.updateValue('lastName', event.detail.value)}></custom-textfield>
    <image-dropzone configs=${JSON.stringify({
    uploadOnEvent: true,
    type: 'speaker-photo',
    targetUrl: `/v1/speakers/${this.profile.id}/images`,
  })}>
        <slot name="img-label" slot="img-label"></slot>
    </image-dropzone>
    <custom-textfield data=${JSON.stringify(titleData)} config=${JSON.stringify(quietTextfieldConfig)} @input-change=${(event) => this.updateValue('title', event.detail.value)}></custom-textfield>
    <custom-textfield data=${JSON.stringify(bioData)} config=${JSON.stringify(textareaConfig)} @input-change=${(event) => this.updateValue('bio', event.detail.value)}></custom-textfield>
    <div>
    <h3>${fieldLabelsJSON.socialMedia}</h3>
    ${this.profile?.socialMedia ? repeat(
    this.profile?.socialMedia,
    (socialMedia, index) => html`
    <div class="social-media-row">
    <custom-textfield class="social-media-input" data=${JSON.stringify({ ...socialMediaData, value: socialMedia.url ?? undefined })} config=${JSON.stringify(textfieldConfig)} @input-change=${(event) => this.updateSocialMedia(index, event.detail.value)}></custom-textfield>
        ${this.profile?.socialMedia?.length > 1 ? html`<img class="icon icon-remove-circle" src="/icons/remove-circle.svg" alt="remove-repeater" @click=${() => {
    this.profile.socialMedia.splice(index, 1);
    this.requestUpdate();
  }}></img>` : nothing}
        </div>`,
  ) : nothing}
    </div>
    <repeater-element text=${fieldLabelsJSON.addSocialMediaRepeater} @repeat=${() => { this.addSocialMedia(); }}></repeater-element>
    <sp-divider size='s'></sp-divider>
    <sp-button variant="primary" class="save-profile-button" @click=${async () => {
    const respJson = await createSpeaker(this.profile, this.seriesId);
    if (respJson.speakerId) {
      this.profile.id = respJson.speakerId;
      this.imageDropzone.dispatchEvent(new CustomEvent('shouldupload'));
    }
  }}>Save Profile</sp-button>
    `;
  }

  renderProfileView() {
    const fieldLabelsJSON = {
      ...defaultFieldLabels,
      ...(this.fieldlabels ?? {}),
    };

    return html`
    <h2>${fieldLabelsJSON.heading}</h2>
    <div>
        <div><sp-field-label size="l" required>${fieldLabelsJSON.chooseType}</sp-field-label></div>
        <sp-picker label=${fieldLabelsJSON.chooseType} value=${this.profile?.type} size="l" @change=${(event) => this.updateValue('type', event.target.value)}>
            ${repeat(speakerType, (type) => html`
                <sp-menu-item value="${type}">${type}</sp-menu-item>
            `)}
        </sp-picker>
    </div>
    <h3>${this.profile.firstName} ${this.profile.lastName}</h3>
    <div class="img-file-input-wrapper">
    ${this.profile.image?.url ? html`
    <div class="preview-wrapper">
      <div class="preview-img-placeholder">
      <img src="${this.profile.image?.url}" alt="preview image">
      </div>
    </div>`
    : nothing}
    </div>
    <div>
        <h5>${this.profile.title}</h5>
        <p>${this.profile.bio}</p>
    </div>
    <div>
        <h4>${fieldLabelsJSON.socialMedia}</h4>
        ${this.profile?.socialMedia ? repeat(this.profile?.socialMedia, (socialMedia) => html`<p>${socialMedia.url}</p>`) : nothing}
    </div>
    <sp-divider></sp-divider>
    <sp-button variant="primary">Save Profile</sp-button>
    `;
  }

  render() {
    if (!this.profile.id) {
      return this.renderProfileForm();
    }
    return this.renderProfileView();
  }
}
