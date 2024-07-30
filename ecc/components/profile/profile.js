/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { LIBS } from '../../scripts/scripts.js';
import { style } from './profile.css.js';
import { createSpeaker, deleteSpeakerImage, updateSpeaker, uploadImage } from '../../scripts/esp-controller.js';
import { getServiceName } from '../../scripts/utils.js';
import { icons } from '../../icons/icons.svg.js';
import { LINK_REGEX } from '../../constants/constants.js';

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
// eslint-disable-next-line max-len
const SUPPORTED_SOCIAL = ['YouTube', 'LinkedIn', 'Web', 'X', 'TikTok', 'Instagram', 'Facebook', 'Pinterest'];

export class Profile extends LitElement {
  static properties = {
    seriesId: { type: String },
    fieldlabels: { type: Object, reflect: true },
    profile: { type: Object, reflect: true },
    profileCopy: { type: Object, reflect: true },
    firstnamesearch: { type: Array },
    lastnamesearch: { type: Array },
  };

  static styles = style;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.fieldlabels = this.fieldlabels ?? DEFAULT_FIELD_LABELS;

    this.profile = this.profile ?? { socialMedia: [{ link: '' }] };
    this.profileCopy = {};
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

  updateProfile(profile) {
    const updatedProfile = { ...this.profile, ...profile };
    this.dispatchEvent(new CustomEvent('update-profile', { detail: { profile: updatedProfile } }));
  }

  updateSocialMedia(index, value) {
    const tempServiceName = getServiceName(value);
    // eslint-disable-next-line max-len
    let serviceName = SUPPORTED_SOCIAL.find((service) => service.toLowerCase() === tempServiceName.toLowerCase());
    if (serviceName === undefined) {
      serviceName = 'Web';
    }
    // eslint-disable-next-line max-len
    this.profile.socialMedia[index] = { link: value, serviceName };
    this.requestUpdate();
  }

  renderProfileTypePicker() {
    // eslint-disable-next-line max-len
    const fieldLabel = this.getRequiredProps().fieldLabelsJSON.chooseType ?? DEFAULT_FIELD_LABELS.chooseType;
    return html`
    <div>
    <div><sp-field-label size="l" required>${fieldLabel} *</sp-field-label></div>
    <sp-picker label=${fieldLabel} value=${this.profile?.type} size="l" @change=${(event) => this.updateProfile({ type: event.target.value })}>
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
      const profile = { ...this.profile };
      profile.isPlaceholder = false;
      profile.socialMedia = this.profile.socialMedia.filter((sm) => sm.link !== '');
      this.profileCopy = { };
      let respJson;
      if (this.profile.speakerId) {
        respJson = await updateSpeaker(profile, this.seriesId);
      } else {
        respJson = await createSpeaker(profile, this.seriesId);
      }

      if (respJson.error) {
        const { errors, message } = respJson.error;
        window.lana?.log(`error occured while saving profile ${errors ?? message}`);
        saveButton.pending = false;
        this.dispatchEvent(new CustomEvent('show-error-toast', { detail: { errors, message }, bubbles: true, composed: true }));
        return;
      }

      if (respJson.speakerId) {
        profile.speakerId = respJson.speakerId;
        const lastPhoto = respJson.photo;
        const file = imageDropzone?.getFile();
        profile.photo = file ? { imageUrl: file.url } : null;

        profile.modificationTime = respJson.modificationTime;

        if (file && (file instanceof File)) {
          const speakerData = await uploadImage(
            file,
            {
              targetUrl: `/v1/series/${this.seriesId}/speakers/${profile.speakerId}/images`,
              type: 'speaker-photo',
              altText: `${this.profile.firstName} ${this.profile.lastName} photo`,
            },
            null,
            lastPhoto?.imageId,
          );

          if (speakerData.error) {
            this.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Failed to upload the image. Please try again later.' } }, bubbles: true, composed: true }));
          }

          if (speakerData.modificationTime) profile.modificationTime = speakerData.modificationTime;
        } else if (lastPhoto && !profile.photo) {
          const resp = await deleteSpeakerImage(
            profile.speakerId,
            this.seriesId,
            lastPhoto.imageId,
          );

          if (resp.error) {
            imageDropzone.file = { url: lastPhoto.imageUrl };
            profile.photo = lastPhoto;
            this.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Failed to upload the image. Please try again later.' } }, bubbles: true, composed: true }));
          }

          if (resp.modificationTime) profile.modificationTime = resp.modificationTime;
        }

        this.updateProfile(profile);
        this.requestUpdate();
      }
    } catch (error) {
      window.lana?.log(`error occured while saving profile ${error}`);
    }

    saveButton.pending = false;
  }

  handleProfileSelection(e) {
    const profile = { ...e.detail.entryData, isPlaceholder: false, type: this.profile.type };
    this.dispatchEvent(new CustomEvent('select-profile', { detail: { profile } }));
  }

  saveDisabled() {
    // eslint-disable-next-line max-len
    return !this.profile.firstName || !this.profile.lastName || !this.profile.title || !this.profile.bio;
  }

  renderNameFieldWithSearchIntegrated() {
    const {
      firstNameData,
      quietTextfieldConfig,
      lastNameData,
      firstNameSearchMap,
      lastNameSearchMap,
    } = this.getRequiredProps();

    const searchFieldConfig = { ...quietTextfieldConfig, showImage: true };

    return html`
    <custom-search searchMap=${JSON.stringify(firstNameSearchMap)} fielddata=${JSON.stringify(firstNameData)} config=${JSON.stringify(searchFieldConfig)} @change-custom-search=${(event) => this.updateProfile({ firstName: event.detail.value })} @entry-selected=${this.handleProfileSelection} searchdata=${JSON.stringify(this.firstnamesearch)} identifier='speakerId'></custom-search>
    <custom-search searchMap=${JSON.stringify(lastNameSearchMap)} fielddata=${JSON.stringify(lastNameData)} config=${JSON.stringify(searchFieldConfig)} @change-custom-search=${(event) => this.updateProfile({ lastName: event.detail.value })} @entry-selected=${this.handleProfileSelection} searchdata=${JSON.stringify(this.lastnamesearch)} identifier='speakerId'></custom-search>
    `;
  }

  renderRemainingFormBody() {
    const {
      // eslint-disable-next-line max-len
      fieldLabelsJSON, quietTextfieldConfig, titleData, bioData, textareaConfig, socialMediaData, socialMediaConfig,
    } = this.getRequiredProps();

    // eslint-disable-next-line max-len
    const imagefile = this.profile?.photo ? { ...this.profile.photo, url: this.profile.photo.imageUrl } : {};

    return html`
    <image-dropzone configs=${JSON.stringify({
    uploadOnCommand: true,
    type: 'speaker-photo',
    targetUrl: `/v1/series/${this.seriesId}/speakers/${this.profile.speakerId}/images`,
  })} file=${JSON.stringify(imagefile)}>
        <slot name="img-label" slot="img-label"></slot>
    </image-dropzone>
    <custom-textfield fielddata=${JSON.stringify(titleData)} config=${JSON.stringify(quietTextfieldConfig)} @change-custom=${(event) => this.updateProfile({ title: event.detail.value })}></custom-textfield>
    <custom-textfield fielddata=${JSON.stringify(bioData)} config=${JSON.stringify(textareaConfig)} @change-custom=${(event) => this.updateProfile({ bio: event.detail.value })}></custom-textfield>
    <div class="social-media">
    <h3>${fieldLabelsJSON.socialMedia}</h3>
    ${this.profile?.socialMedia ? repeat(
    this.profile?.socialMedia,
    (socialMedia, index) => html`
    <div class="social-media-row">
    <custom-textfield class="social-media-input" fielddata=${JSON.stringify({ ...socialMediaData, value: socialMedia.link ?? undefined })} config=${JSON.stringify(socialMediaConfig)} @change-custom=${(event) => this.updateSocialMedia(index, event.detail.value)}></custom-textfield>
        ${this.profile?.socialMedia?.length > 1 ? html`<img class="icon icon-remove-circle" src="/ecc/icons/remove-circle.svg" alt="remove-repeater" @click=${() => {
    this.profile.socialMedia.splice(index, 1);
    this.requestUpdate();
  }}></img>` : nothing}
        </div>`,
  ) : nothing}
    </div>
    <repeater-element text=${fieldLabelsJSON.addSocialMediaRepeater} @repeat=${() => { this.addSocialMedia(); }}></repeater-element>
    <sp-divider size='s'></sp-divider>`;
  }

  renderProfileForm() {
    return html`
    ${this.renderProfileTypePicker()}
    ${this.renderNameFieldWithSearchIntegrated()}
    ${this.renderRemainingFormBody()}`;
  }

  renderNameFields() {
    const { firstNameData, quietTextfieldConfig, lastNameData } = this.getRequiredProps();

    return html`    
    <custom-textfield fielddata=${JSON.stringify(firstNameData)} config=${JSON.stringify(quietTextfieldConfig)} @change-custom=${(event) => this.updateProfile({ firstName: event.detail.value })}></custom-textfield>
    <custom-textfield fielddata=${JSON.stringify(lastNameData)} config=${JSON.stringify(quietTextfieldConfig)} @change-custom=${(event) => this.updateProfile({ lastName: event.detail.value })}></custom-textfield>
    `;
  }

  renderProfileEditForm() {
    return html`
    ${this.renderProfileTypePicker()}
    ${this.renderNameFields()}
    ${this.renderRemainingFormBody()}
    `;
  }

  getRequiredProps() {
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

    const socialMediaConfig = { size: 'xl', pattern: LINK_REGEX };
    const quietTextfieldConfig = { size: 'xl', quiet: true };

    const firstNameSearchMap = {
      searchKeys: ['firstName'],
      renderKeys: ['firstName', 'lastName'],
    };

    const lastNameSearchMap = {
      searchKeys: ['lastName'],
      renderKeys: ['firstName', 'lastName'],
    };

    return {
      fieldLabelsJSON,
      firstNameData,
      quietTextfieldConfig,
      lastNameData,
      titleData,
      bioData,
      textareaConfig,
      socialMediaData,
      socialMediaConfig,
      firstNameSearchMap,
      lastNameSearchMap,
    };
  }

  renderProfileCreateForm() {
    return html`
    <div class="profile-view">
    <h2>${this.fieldlabels.heading}</h2>
    ${this.renderProfileForm()}
    <div class="profile-save-footer">
      <sp-button variant="primary" class="save-profile-button" @click=${async (e) => {
    this.saveProfile(e);
  }} ?disabled=${this.saveDisabled()}>
  <img src="/ecc/icons/user-add.svg" slot="icon"></img>
  Save Profile</sp-button>
    </div>
    `;
  }

  revertProfile() {
    this.profile = { ...this.profileCopy };
    this.requestUpdate();
  }

  renderProfileEditFormWrapper() {
    return html`
    <div class="profile-view">
    <h2 class="edit-profile-title">Edit Profile</h2>
    ${this.renderProfileEditForm()}
    <div class="profile-footer">
    <p class="last-updated">Last update: ${new Date().toLocaleDateString()}</p>
    <sp-button-group class="footer-button-group">
      <sp-button variant="secondary" class="profile-edit-button" onclick="javascript: this.dispatchEvent(new Event('close', {bubbles: true, composed: true}));" @click=${async () => {
    this.revertProfile();
  }}>Cancel</sp-button>
      <sp-button variant="primary" class="profile-edit-button" onclick="javascript: this.dispatchEvent(new Event('close', {bubbles: true, composed: true}));" @click=${async (e) => {
    this.saveProfile(e);
  }} ?disabled=${this.saveDisabled()}>
  <img src="/ecc/icons/user-edit.svg" slot="icon"></img>
  Confirm update</sp-button>
  </sp-button-group>
    </div>
    `;
  }

  renderSocialMediaLink(socialMedia) {
    const serviceName = SUPPORTED_SOCIAL.includes(socialMedia.serviceName) ? socialMedia.serviceName.toLowerCase() : 'social-media';
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
    <p class="last-updated">Last update: ${new Date(this.profile.modificationTime).toLocaleDateString()}</p>
    <overlay-trigger type="modal" class="edit-profile">
    <sp-dialog-wrapper class="edit-profile-dialog"
        size="l"
        slot="click-content"
        dismiss-label="Close"
        underlay
    >
        ${this.renderProfileEditFormWrapper('Edit Profile')}
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
