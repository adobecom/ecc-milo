/* eslint-disable class-methods-use-this */
import { LIBS } from '../../scripts/scripts.js';
import { style } from './profile.css.js';
import { createSpeaker, deleteSpeakerImage, updateSpeaker, uploadImage } from '../../scripts/esp-controller.js';
import { getServiceName } from '../../scripts/utils.js';
import { icons } from '../../icons/icons.svg.js';
import { LINK_REGEX } from '../../scripts/constants.js';
import { getSpeakerPayload } from '../../scripts/data-utils.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

const DEFAULT_FIELD_LABELS = {
  heading: 'Profile',
  chooseType: 'Choose Type',
  name: 'Name',
  title: 'Add Title',
  bio: 'Add Bio',
  socialLinks: 'Social Media',
  addSocialLink: 'Add Social Media',
  addSocialLinkRepeater: 'Add Social Link',
};

const SPEAKER_TYPE = ['Host', 'Presenter', 'Speaker', 'Keynote', 'Judge', 'PortfolioReviewer'];
const SUPPORTED_SOCIAL = ['YouTube', 'LinkedIn', 'Web', 'Twitter', 'X', 'TikTok', 'Instagram', 'Facebook', 'Pinterest'];

export default class Profile extends LitElement {
  static properties = {
    seriesId: { type: String },
    fieldlabels: { type: Object, reflect: true },
    profile: { type: Object, reflect: true },
    profileCopy: { type: Object },
    firstnamesearch: { type: Array },
    lastnamesearch: { type: Array },
    locale: { type: String },
  };

  static styles = style;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.fieldlabels = this.fieldlabels ?? DEFAULT_FIELD_LABELS;

    this.profile = this.profile ?? { socialLinks: [{ link: '' }], isPlaceholder: true };
    this.profileCopy = {};
    this.locale = this.locale ?? 'en-US';
  }

  addSocialLink(shallow = false) {
    const socialLink = { link: '' };
    const profile = shallow ? this.profileCopy : this.profile;
    if (profile?.socialLinks) {
      profile.socialLinks.push(socialLink);
    } else {
      profile.socialLinks = [socialLink];
    }
    this.requestUpdate();
  }

  updateProfile(profile, shallow = false) {
    if (shallow) {
      this.profileCopy = { ...this.profileCopy, ...profile };
    } else {
      const updatedProfile = { ...this.profile, ...profile };
      this.dispatchEvent(new CustomEvent('update-profile', { detail: { profile: updatedProfile } }));
    }
  }

  updateSocialLink(index, value, shallow = false) {
    const tempServiceName = getServiceName(value);
    // eslint-disable-next-line max-len
    let serviceName = SUPPORTED_SOCIAL.find((service) => service.toLowerCase() === tempServiceName.toLowerCase());
    if (serviceName === undefined) {
      serviceName = 'Web';
    }
    // eslint-disable-next-line max-len
    if (shallow) {
      this.profileCopy.socialLinks[index] = { link: value, serviceName };
      return;
    }

    this.profile.socialLinks[index] = { link: value, serviceName };
    this.requestUpdate();
  }

  renderProfileTypePicker(shallow = false) {
    // eslint-disable-next-line max-len
    const fieldLabel = this.getRequiredProps(shallow).fieldLabelsJSON.chooseType ?? DEFAULT_FIELD_LABELS.chooseType;
    return html`
    <div>
    <div><sp-field-label size="l" required>${fieldLabel} *</sp-field-label></div>
    <sp-picker label=${fieldLabel} value=${shallow ? this.profileCopy?.type : this.profile?.type} size="l" @change=${(event) => this.updateProfile({ type: event.target.value }, shallow)}>
        ${repeat(SPEAKER_TYPE, (type) => html`
            <sp-menu-item value="${type}">${type.replace(/([a-z])([A-Z])/g, '$1 $2')}</sp-menu-item>
        `)}
    </sp-picker>
    </div>`;
  }

  async saveProfile(e, edited = false) {
    const imageDropzone = this.shadowRoot.querySelector('image-dropzone');
    const saveButton = e.target;

    saveButton.pending = true;

    try {
      const profile = edited ? structuredClone(this.profileCopy) : structuredClone(this.profile);
      const correctSocialLinks = profile.socialLinks.filter((sm) => sm.link === '' || sm.link?.match(LINK_REGEX));

      if (correctSocialLinks.length < profile.socialLinks.length) {
        const dialogToastParent = edited ? this.shadowRoot.querySelector('.edit-profile-dialog') : null;
        this.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { message: 'Please enter a valid website address starting with "https://". For example: https://www.example.com' }, targetEl: dialogToastParent }, bubbles: true, composed: true }));
        saveButton.pending = false;
        return false;
      }

      profile.isPlaceholder = false;
      profile.socialLinks = profile.socialLinks.filter((sm) => sm.link !== '');

      const sProfile = { ...profile };
      delete sProfile.type;
      let respJson;
      const profilePayload = getSpeakerPayload(sProfile, this.locale);
      if (this.profile.speakerId) {
        respJson = await updateSpeaker(profilePayload, this.seriesId);
      } else {
        respJson = await createSpeaker(profilePayload, this.seriesId);
      }

      if (respJson.error) {
        const { errors, message } = respJson.error;
        window.lana?.log(`error occured while saving profile ${errors ?? message}`);
        saveButton.pending = false;
        const dialogToastParent = edited ? this.shadowRoot.querySelector('.edit-profile-dialog') : null;
        this.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: { errors, message }, targetEl: dialogToastParent }, bubbles: true, composed: true }));
        return false;
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
        saveButton.pending = false;
        return true;
      }
    } catch (error) {
      window.lana?.log(`error occured while saving profile ${error}`);
    }

    saveButton.pending = false;
    return false;
  }

  handleProfileSelection(e) {
    const profile = { ...e.detail.entryData, isPlaceholder: false, type: this.profile.type };
    this.dispatchEvent(new CustomEvent('select-profile', { detail: { profile } }));
  }

  saveDisabled() {
    // eslint-disable-next-line max-len
    return !this.profile.firstName || !this.profile.lastName || !this.profile.title;
  }

  renderNameFieldWithSearchIntegrated(shallow = false) {
    const {
      firstNameData,
      quietTextfieldConfig,
      lastNameData,
      firstNameSearchMap,
      lastNameSearchMap,
    } = this.getRequiredProps(shallow);

    const searchFieldConfig = { ...quietTextfieldConfig, showImage: true, thumbnailType: 'circle' };

    return html`
    <custom-search searchMap=${JSON.stringify(firstNameSearchMap)} fielddata=${JSON.stringify(firstNameData)} config=${JSON.stringify(searchFieldConfig)} @change-custom-search=${(event) => this.updateProfile({ firstName: event.detail.value }, shallow)} @entry-selected=${this.handleProfileSelection} searchdata=${JSON.stringify(this.firstnamesearch)} identifier='speakerId'></custom-search>
    <custom-search searchMap=${JSON.stringify(lastNameSearchMap)} fielddata=${JSON.stringify(lastNameData)} config=${JSON.stringify(searchFieldConfig)} @change-custom-search=${(event) => this.updateProfile({ lastName: event.detail.value }, shallow)} @entry-selected=${this.handleProfileSelection} searchdata=${JSON.stringify(this.lastnamesearch)} identifier='speakerId'></custom-search>
    `;
  }

  renderRemainingFormBody(shallow = false) {
    const {
      fieldLabelsJSON,
      quietTextfieldConfig,
      titleData,
      bioData,
      textareaConfig,
      socialLinksData,
      socialLinksConfig,
    } = this.getRequiredProps(shallow);

    const profile = shallow ? this.profileCopy : this.profile;

    // eslint-disable-next-line max-len
    const imagefile = profile?.photo ? { ...profile.photo, url: profile.photo.imageUrl } : {};

    return html`
    <image-dropzone configs=${JSON.stringify({
    uploadOnCommand: true,
    type: 'speaker-photo',
    targetUrl: `/v1/series/${this.seriesId}/speakers/${profile.speakerId}/images`,
  })} file=${JSON.stringify(imagefile)}>
        <slot name="img-label" slot="img-label"></slot>
    </image-dropzone>
    <custom-textfield fielddata=${JSON.stringify(titleData)} config=${JSON.stringify(quietTextfieldConfig)} @change-custom=${(event) => this.updateProfile({ title: event.detail.value }, shallow)}></custom-textfield>
    <custom-textfield fielddata=${JSON.stringify(bioData)} config=${JSON.stringify(textareaConfig)} @change-custom=${(event) => this.updateProfile({ bio: event.detail.value }, shallow)}></custom-textfield>
    <div class="social-media">
    <h3>${fieldLabelsJSON.socialLinks}</h3>
    ${profile?.socialLinks ? repeat(
    profile.socialLinks,
    (socialLink, index) => html`
    <div class="social-media-row">
    <custom-textfield class="social-media-input" fielddata=${JSON.stringify({ ...socialLinksData, value: socialLink.link ?? undefined })} config=${JSON.stringify(socialLinksConfig)} @change-custom=${(event) => this.updateSocialLink(index, event.detail.value?.trim(), shallow)}></custom-textfield>
        ${profile.socialLinks?.length > 1 ? html`<img class="icon icon-remove-circle" src="/ecc/icons/remove-circle.svg" alt="remove-repeater" @click=${() => {
    profile.socialLinks.splice(index, 1);
    this.requestUpdate();
  }}></img>` : nothing}
        </div>`,
  ) : nothing}
    </div>
    <repeater-element text=${fieldLabelsJSON.addSocialLinkRepeater} @repeat=${() => { this.addSocialLink(shallow); }}></repeater-element>
    <sp-divider size='s'></sp-divider>`;
  }

  renderProfileForm() {
    return html`
    ${this.renderProfileTypePicker()}
    ${this.renderNameFieldWithSearchIntegrated()}
    ${this.renderRemainingFormBody()}`;
  }

  renderNameFields(shallow = false) {
    const { firstNameData, quietTextfieldConfig, lastNameData } = this.getRequiredProps(shallow);

    return html`    
    <custom-textfield fielddata=${JSON.stringify(firstNameData)} config=${JSON.stringify(quietTextfieldConfig)} @change-custom=${(event) => this.updateProfile({ firstName: event.detail.value }, shallow)}></custom-textfield>
    <custom-textfield fielddata=${JSON.stringify(lastNameData)} config=${JSON.stringify(quietTextfieldConfig)} @change-custom=${(event) => this.updateProfile({ lastName: event.detail.value }, shallow)}></custom-textfield>
    `;
  }

  renderProfileEditForm() {
    return html`
    ${this.renderProfileTypePicker(true)}
    ${this.renderNameFields(true)}
    ${this.renderRemainingFormBody(true)}
    `;
  }

  getRequiredProps(shallow = false) {
    const fieldLabelsJSON = {
      ...DEFAULT_FIELD_LABELS,
      ...(this.fieldlabels ?? {}),
    };

    const firstNameData = {
      value: shallow ? this.profileCopy?.firstName : this.profile?.firstName,
      placeholder: fieldLabelsJSON.firstName,
      helperText: fieldLabelsJSON.firstNameSubText,
    };

    const lastNameData = {
      value: shallow ? this.profileCopy?.lastName : this.profile?.lastName,
      placeholder: fieldLabelsJSON.lastName,
      helperText: fieldLabelsJSON.lastNameSubText,
    };

    const bioData = {
      value: shallow ? this.profileCopy?.bio : this.profile?.bio || '',
      placeholder: fieldLabelsJSON.bio,
      helperText: fieldLabelsJSON.bioSubText,
    };

    const titleData = {
      value: shallow ? this.profileCopy?.title : this.profile?.title,
      placeholder: fieldLabelsJSON.title,
      helperText: fieldLabelsJSON.titleSubText,
    };

    const socialLinksData = { placeholder: fieldLabelsJSON.addSocialLink };

    const textareaConfig = {
      grows: true,
      multiline: true,
      size: 'xl',
      quiet: true,
    };

    const socialLinksConfig = { size: 'xl', pattern: LINK_REGEX };
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
      socialLinksData,
      socialLinksConfig,
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

  initializeProfileCopy() {
    this.profileCopy = structuredClone(this.profile);
    this.requestUpdate();

    // FIXME: shouldn't need to sync state downstream like this
    const allcustomTextfields = this.shadowRoot.querySelectorAll('custom-textfield');
    allcustomTextfields.forEach((customTextfield) => {
      const textfield = customTextfield.shadowRoot.querySelector('sp-textfield');
      if (textfield && customTextfield.fielddata.value) {
        textfield.value = customTextfield.fielddata.value;
      }
    });
  }

  renderProfileEditFormWrapper() {
    return html`
    <div class="profile-view">
    <h2 class="edit-profile-title">Edit Profile</h2>
    ${this.renderProfileEditForm()}
    <div class="profile-footer">
    <p class="last-updated">Last update: ${new Date().toLocaleDateString()}</p>
    <sp-button-group class="footer-button-group">
      <sp-button variant="secondary" class="profile-edit-button" onclick="javascript: this.dispatchEvent(new Event('close', {bubbles: true, composed: true}));">Cancel</sp-button>
      <sp-button variant="primary" class="profile-edit-button" @click=${async (e) => {
    this.saveProfile(e, true).then((success) => {
      if (success) {
        const dialog = this.shadowRoot.querySelector('sp-dialog-wrapper');
        dialog?.dispatchEvent(new Event('close', { bubbles: true, composed: true }));
      }
    });
  }} ?disabled=${this.saveDisabled()}>
  <img src="/ecc/icons/user-edit.svg" slot="icon"></img>
  Confirm update</sp-button>
  </sp-button-group>
    </div>
    `;
  }

  renderSocialLinksLink(socialLinks) {
    const serviceName = SUPPORTED_SOCIAL.includes(socialLinks.serviceName) ? socialLinks.serviceName.toLowerCase() : 'social-media';
    return socialLinks.link ? html`<div class="social-media-row">
    <svg xmlns="http://www.w3.org/2000/svg" class="feds-social-icon" alt="${serviceName} logo">
      <use href="#footer-icon-${serviceName}"></use>
    </svg>
    <h3>${socialLinks.link}</h3></div>` : nothing;
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
    ${this.renderProfileTypePicker()}
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
        ${this.profile.bio ? html`<p>${this.profile.bio}</p>` : nothing}
    </div>
    ${this.profile?.socialLinks?.length ? html`
    <div class="social-media">
        <h3>${fieldLabelsJSON.socialLinks}</h3>
        <div class="feds-footer-icons">
        ${icons}
        </div>
        ${this.profile?.socialLinks ? repeat(this.profile?.socialLinks, (socialLinks) => this.renderSocialLinksLink(socialLinks)) : nothing}
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
        ${this.renderProfileEditFormWrapper()}
        <sp-theme class="toast-area"></sp-theme>
    </sp-dialog-wrapper>
    <sp-button slot="trigger" variant="primary" class="profile-action-button" @click=${this.initializeProfileCopy}>
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
