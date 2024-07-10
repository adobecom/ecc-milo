/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { LIBS } from '../../scripts/scripts.js';
import { style } from './profile.css.js';
import { createSpeaker, updateSpeaker, uploadImage } from '../../scripts/esp-controller.js';
import { getServiceName } from '../../scripts/utils.js';
import { icons } from '../../icons/icons.svg.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

const DEFAULT_FIELD_LABELS = {
  heading: 'Profile',
  chooseType: 'Choose Type',
  name: 'Name',
  title: 'Add Title',
  bio: 'Add Bio',
  socialMedia: 'Social Medias',
  addSocialMedia: 'Add Social Media link',
  addSocialMediaRepeater: 'Add Social Media',
};

const SPEAKER_TYPE = ['Host', 'Speaker'];
const SUPPORTED_SOCIAL = ['facebook', 'instagram', 'twitter', 'linkedin', 'pinterest', 'discord', 'behance', 'youtube', 'weibo', 'social-media'];

export class Profile extends LitElement {
  static properties = {
    seriesId: { type: String },
    fieldlabels: { type: Object, reflect: true },
    profile: { type: Object, reflect: true },
    profileCopy: { type: Object, reflect: true },
  };

  static styles = style;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.fieldlabels = this.fieldlabels ?? DEFAULT_FIELD_LABELS;

    this.profile = this.profile ?? { socialMedia: [{ link: '' }] };
    this.profileCopy = { ...this.profile };
  }

  addSocialMedia() {
    const socialMedia = { link: '' };
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
    this.profile.socialMedia[index] = { link: value, serviceName: getServiceName(value) };
    this.requestUpdate();
  }

  renderProfileTypePicker(fieldLabel) {
    return html`
    <div>
    <div><sp-field-label size="l" required>${fieldLabel}</sp-field-label></div>
    <sp-picker label=${fieldLabel} value=${this.profile?.type} size="l" @change=${(event) => this.updateValue('type', event.target.value)}>
        ${repeat(SPEAKER_TYPE, (type) => html`
            <sp-menu-item value="${type}">${type}</sp-menu-item>
        `)}
    </sp-picker>
    </div>`;
  }

  async saveProfile(e) {
    const imageDropzone = this.shadowRoot.querySelector('image-dropzone');
    const saveButton = e.target;

    saveButton.pending = true;

    try {
      this.profile.socialMedia = this.profile.socialMedia.filter((sm) => sm.link !== '');
      this.profileCopy = { ...this.profile };
      let respJson;
      if (this.profile.speakerId) {
        respJson = await updateSpeaker(this.profile, this.seriesId);
      } else {
        respJson = await createSpeaker(this.profile, this.seriesId);
      }

      if (respJson.speakerId) {
        this.profile.speakerId = respJson.speakerId;
        this.profile.photo = imageDropzone?.file ? { imageUrl: imageDropzone?.file?.url } : null;
        const file = imageDropzone?.getFile();

        if (file && (file instanceof File)) {
          const speakerData = await uploadImage(file, {
            targetUrl: `/v1/series/${this.seriesId}/speakers/${this.profile.speakerId}/images`,
            type: 'speaker-photo',
            altText: `${this.profile.firstName} ${this.profile.lastName} photo`,
          });

          this.profile.modificationTime = speakerData.modificationTime;
        }

        this.requestUpdate();
      }
    } catch (error) {
      window.lana?.log(`error occured while saving profile ${error}`);
    }

    saveButton.pending = false;
  }

  renderProfileForm() {
    const fieldLabelsJSON = {
      ...DEFAULT_FIELD_LABELS,
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

    // eslint-disable-next-line max-len
    const imagefile = this.profile?.photo ? { ...this.profile.photo, url: this.profile.photo.imageUrl } : {};
    return html`
    ${this.renderProfileTypePicker(fieldLabelsJSON.chooseType)}
    <custom-textfield data=${JSON.stringify(firstNameData)} config=${JSON.stringify(quietTextfieldConfig)} @input-change=${(event) => this.updateValue('firstName', event.detail.value)}></custom-textfield>
    <custom-textfield data=${JSON.stringify(lastNameData)} config=${JSON.stringify(quietTextfieldConfig)} @input-change=${(event) => this.updateValue('lastName', event.detail.value)}></custom-textfield>
    <image-dropzone configs=${JSON.stringify({
    uploadOnCommand: true,
    type: 'speaker-photo',
    targetUrl: `/v1/series/${this.seriesId}/speakers/${this.profile.speakerId}/images`,
  })} file=${JSON.stringify(imagefile)}>
        <slot name="img-label" slot="img-label"></slot>
    </image-dropzone>
    <custom-textfield data=${JSON.stringify(titleData)} config=${JSON.stringify(quietTextfieldConfig)} @input-change=${(event) => this.updateValue('title', event.detail.value)}></custom-textfield>
    <custom-textfield data=${JSON.stringify(bioData)} config=${JSON.stringify(textareaConfig)} @input-change=${(event) => this.updateValue('bio', event.detail.value)}></custom-textfield>
    <div class="social-media">
    <h3>${fieldLabelsJSON.socialMedia}</h3>
    ${this.profile?.socialMedia ? repeat(
    this.profile?.socialMedia,
    (socialMedia, index) => html`
    <div class="social-media-row">
    <custom-textfield class="social-media-input" data=${JSON.stringify({ ...socialMediaData, value: socialMedia.link ?? undefined })} config=${JSON.stringify(textfieldConfig)} @input-change=${(event) => this.updateSocialMedia(index, event.detail.value)}></custom-textfield>
        ${this.profile?.socialMedia?.length > 1 ? html`<img class="icon icon-remove-circle" src="/ecc/icons/remove-circle.svg" alt="remove-repeater" @click=${() => {
    this.profile.socialMedia.splice(index, 1);
    this.requestUpdate();
  }}></img>` : nothing}
        </div>`,
  ) : nothing}
    </div>
    <repeater-element text=${fieldLabelsJSON.addSocialMediaRepeater} @repeat=${() => { this.addSocialMedia(); }}></repeater-element>
    <sp-divider size='s'></sp-divider>
    `;
  }

  renderProfileCreateForm() {
    return html`
    <div class="profile-view">
    <h2>${this.fieldlabels.heading}</h2>
    ${this.renderProfileForm()}
    <div class="profile-save-footer">
      <sp-button variant="primary" class="save-profile-button" onclick="javascript: this.dispatchEvent(new Event('close', {bubbles: true, composed: true}));" @click=${async (e) => {
    this.saveProfile(e);
  }}>
  <img src="/ecc/icons/user-add.svg" slot="icon"></img>
  Save Profile</sp-button>
    </div>
    `;
  }

  revertProfile() {
    this.profile = { ...this.profileCopy };
    this.requestUpdate();
  }

  renderProfileEditForm() {
    return html`
    <div class="profile-view">
    <h2 class="edit-profile-title">Edit Profile</h2>
    ${this.renderProfileForm()}
    <div class="profile-footer">
    <p class="last-updated">Last update: ${new Date().toLocaleDateString()}</p>
    <sp-button-group class="footer-button-group">
      <sp-button variant="secondary" class="profile-edit-button" onclick="javascript: this.dispatchEvent(new Event('close', {bubbles: true, composed: true}));" @click=${async () => {
    this.revertProfile();
  }}>Cancel</sp-button>
      <sp-button variant="primary" class="profile-edit-button" onclick="javascript: this.dispatchEvent(new Event('close', {bubbles: true, composed: true}));" @click=${async (e) => {
    this.saveProfile(e);
  }}>
  <img src="/ecc/icons/user-edit.svg" slot="icon"></img>
  Confirm update</sp-button>
  </sp-button-group>
    </div>
    `;
  }

  renderSocialMediaLink(socialMedia) {
    const serviceName = SUPPORTED_SOCIAL.includes(socialMedia.serviceName) ? socialMedia.serviceName : 'social-media';
    return socialMedia.link ? html`<div class="social-media-row">
    <svg xmlns="http://www.w3.org/2000/svg" class="feds-social-icon" alt="${serviceName} logo">
      <use href="#footer-icon-${serviceName}"></use>
    </svg>
    <h3>${socialMedia.link}</h3></div>` : nothing;
  }

  renderProfileView() {
    const fieldLabelsJSON = {
      ...DEFAULT_FIELD_LABELS,
      ...(this.fieldlabels ?? {}),
    };

    // FIXME: update last updated date to actual date.
    return html`
    <div class="profile-view">
    <div class="profile-header">
    <h2>${fieldLabelsJSON.heading}</h2>
    <overlay-trigger placement="right">
    <img src="/ecc/icons/info.svg" alt="info icon" class="icon icon-info" slot="trigger"></img>
    <sp-tooltip slot="hover-content" variant="info" open placement="right">
    ${fieldLabelsJSON.tooltipMessage}
    </sp-tooltip>
    </overlay-trigger>
    </div> 
    ${this.renderProfileTypePicker(fieldLabelsJSON.chooseType)}
    <h3>${this.profile.firstName} ${this.profile.lastName}</h3>
    ${this.profile.photo?.imageUrl ? html`
    <div class="img-file-input-wrapper">
      <div class="preview-wrapper">
        <div class="preview-img-placeholder">
          <img class="speaker-image" src="${this.profile.photo?.imageUrl}" alt="preview image">
        </div>
      </div>
    </div>`
    : nothing}
    <div>
        <h5>${this.profile.title}</h5>
        <p>${this.profile.bio}</p>
    </div>
    ${this.profile?.socialMedia?.length ? html`
    <div class="social-media">
        <h3>${fieldLabelsJSON.socialMedia}</h3>
        <div class="feds-footer-icons">
        ${icons}
        </div>
        ${this.profile?.socialMedia ? repeat(this.profile?.socialMedia, (socialMedia) => this.renderSocialMediaLink(socialMedia)) : nothing}
    </div>
    ` : nothing} 
    <sp-divider></sp-divider>
    <div class="profile-footer">
    <p class="last-updated">Last update: ${new Date().toLocaleDateString()}</p>
    <overlay-trigger type="modal" class="edit-profile">
    <sp-dialog-wrapper class="edit-profile-dialog"
        size="l"
        slot="click-content"
        dismiss-label="Close"
        underlay
    >
        ${this.renderProfileEditForm('Edit Profile')}
    </sp-dialog-wrapper>
    <sp-button slot="trigger" variant="primary" class="profile-action-button" @click=${() => { this.profileCopy = { ...this.profile }; }}>
    <img src="/ecc/icons/user-edit.svg" slot="icon"></img>Edit</sp-button>
    </overlay-trigger>
    </div>
    </div>
    `;
  }

  render() {
    if (!this.profile.speakerId) {
      return this.renderProfileCreateForm();
    }
    return this.renderProfileView();
  }
}
